import { execFileSync } from "node:child_process";
import { Client } from "@notionhq/client";
import type { Transaction } from "@/types/transaction";
import { notionMapping } from "@/lib/notion-mapping";
import { normalizeCategoryName } from "@/lib/categories";

export interface NotionStatus {
  configured: boolean;
  mode: "demo" | "notion";
}

export function getNotionStatus(): NotionStatus {
  const configured = Boolean(process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID);
  return { configured, mode: configured ? "notion" : "demo" };
}

function titleValue(property: unknown): string {
  if (!property || typeof property !== "object") return "";
  const title = (property as { title?: Array<{ plain_text?: string }> }).title;
  return title?.map((item) => item.plain_text ?? "").join("") ?? "";
}

function richTextValue(property: unknown): string {
  if (!property || typeof property !== "object") return "";
  const richText = (property as { rich_text?: Array<{ plain_text?: string }> }).rich_text;
  return richText?.map((item) => item.plain_text ?? "").join("") ?? "";
}

function selectValue(property: unknown): string {
  if (!property || typeof property !== "object") return "";
  const propertyValue = property as { select?: { name?: string } | null };
  return propertyValue.select?.name ?? "";
}

function propertyValue(properties: Record<string, unknown>, name: string): unknown {
  return properties[name];
}

export function mapNotionPage(page: { id: string; properties?: Record<string, unknown> }): Transaction | null {
  const properties = page.properties ?? {};
  const descriptionProperty = propertyValue(properties, notionMapping.description);
  const amountProperty = propertyValue(properties, notionMapping.amount) as { number?: number } | undefined;
  const dateProperty = propertyValue(properties, notionMapping.date) as { date?: { start?: string } } | undefined;
  const categoryProperty = propertyValue(properties, notionMapping.category);

  const description = titleValue(descriptionProperty);
  const amount = amountProperty?.number;
  const date = dateProperty?.date?.start;
  if (!description || amount == null || !date) return null;

  const typeProperty = propertyValue(properties, notionMapping.type);
  const paymentProperty = propertyValue(properties, notionMapping.paymentMethod);
  const notesProperty = propertyValue(properties, notionMapping.notes);

  const rawType = selectValue(typeProperty);
  return {
    id: page.id,
    description,
    amount,
    date,
    category: normalizeCategoryName(selectValue(categoryProperty) || richTextValue(categoryProperty) || "Miscellaneous"),
    paymentMethod: selectValue(paymentProperty) || richTextValue(paymentProperty) || "Not specified",
    type: rawType === "Income" ? "Income" : "Expense",
    notes: richTextValue(notesProperty),
  };
}

function createSecureFetch() {
  if (process.platform !== "win32") return undefined;

  return (url: string, init?: { method?: string; headers?: Record<string, string>; body?: string | FormData }) => {
    const args = ["--silent", "--show-error", "--location", "--write-out", "\n__POCKET_STATUS__%{http_code}"];
    if (init?.method) args.push("--request", init.method);
    for (const [name, value] of Object.entries(init?.headers ?? {})) {
      args.push("--header", `${name}: ${value}`);
    }
    if (typeof init?.body === "string") {
      args.push("--header", "Content-Type: application/json", "--data-binary", init.body);
    }
    args.push(url);

    try {
      const output = execFileSync("curl.exe", args, { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
      const match = output.match(/\n__POCKET_STATUS__(\d{3})$/);
      const status = match ? Number(match[1]) : 500;
      const text = match ? output.slice(0, match.index) : output;
      return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        text: async () => text,
        body: null,
        headers: {},
      });
    } catch (error) {
      return Promise.reject(error);
    }
  };
}

export async function createNotionTransaction(transaction: Omit<Transaction, "id">): Promise<Transaction> {
  const status = getNotionStatus();
  if (!status.configured) throw new Error("Notion is not configured.");

  const databaseId = process.env.NOTION_DATABASE_ID!;
  const notion = new Client({ auth: process.env.NOTION_API_KEY, fetch: createSecureFetch(), notionVersion: "2025-09-03" });

  try {
    const database = await notion.databases.retrieve({ database_id: databaseId });
    const dataSourceId = "data_sources" in database ? database.data_sources[0]?.id : undefined;
    if (!dataSourceId) throw new Error("Notion database has no accessible data source.");

    const page = await notion.pages.create({
      parent: { data_source_id: dataSourceId },
      properties: {
        [notionMapping.description]: { title: [{ text: { content: transaction.description } }] },
        [notionMapping.amount]: { number: transaction.amount },
        [notionMapping.date]: { date: { start: transaction.date } },
        [notionMapping.category]: { select: { name: transaction.category } },
      },
    });

    return { ...transaction, id: page.id };
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "unknown";
    const message = error instanceof Error ? error.message : "Could not create Notion transaction.";
    throw new Error(`Notion create failed (${code}): ${message}`);
  }
}

export async function getNotionTransactions(): Promise<Transaction[]> {
  const status = getNotionStatus();
  if (!status.configured) throw new Error("Notion is not configured.");

  const databaseId = process.env.NOTION_DATABASE_ID!;
  const notion = new Client({ auth: process.env.NOTION_API_KEY, fetch: createSecureFetch() });
  const transactions: Transaction[] = [];
  let cursor: string | undefined;

  try {
    const database = await notion.databases.retrieve({ database_id: databaseId });
    const dataSourceId = "data_sources" in database ? database.data_sources[0]?.id : undefined;
    if (!dataSourceId) throw new Error("Notion database has no accessible data source.");

    do {
      const result = await notion.dataSources.query({
        data_source_id: dataSourceId,
        page_size: 100,
        start_cursor: cursor,
      });

      for (const page of result.results) {
        if ("properties" in page) {
          const transaction = mapNotionPage({ id: page.id, properties: page.properties as Record<string, unknown> });
          if (transaction) transactions.push(transaction);
        }
      }
      cursor = result.has_more ? result.next_cursor ?? undefined : undefined;
    } while (cursor);
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "unknown";
    const message = error instanceof Error ? error.message : "Could not access Notion database.";
    throw new Error(`Notion access failed (${code}): ${message}`);
  }

  return transactions.sort((a, b) => b.date.localeCompare(a.date));
}
