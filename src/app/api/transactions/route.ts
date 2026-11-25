import { NextResponse } from "next/server";
import { mockTransactions } from "@/lib/mock-data";
import { createNotionTransaction, getNotionStatus, getNotionTransactions } from "@/lib/notion/service";

export async function GET() {
  const status = getNotionStatus();
  if (!status.configured) {
    return NextResponse.json({ data: mockTransactions, demo: true });
  }

  try {
    const data = await getNotionTransactions();
    return NextResponse.json({ data, demo: false });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not connect to Notion.", demo: false }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.description || !body.amount || !body.date) {
    return NextResponse.json({ error: "Description, amount, and date are required." }, { status: 400 });
  }
  if (!Number.isFinite(Number(body.amount)) || Number(body.amount) <= 0) {
    return NextResponse.json({ error: "Amount must be a positive number." }, { status: 400 });
  }
  const status = getNotionStatus();
  if (!status.configured) {
    return NextResponse.json({ ok: true, demo: true, transaction: { ...body, id: crypto.randomUUID(), amount: Number(body.amount) } });
  }

  try {
    const transaction = await createNotionTransaction({
      description: String(body.description).trim(),
      amount: Number(body.amount),
      date: String(body.date),
      category: String(body.category || "Miscellaneous"),
      paymentMethod: String(body.paymentMethod || "Not specified"),
      type: body.type === "Income" ? "Income" : "Expense",
      notes: String(body.notes || ""),
    });
    return NextResponse.json({ ok: true, demo: false, transaction });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save transaction.", demo: false }, { status: 502 });
  }
}

export async function PUT(request: Request) {
  const body = await request.json();
  if (!body.id || !body.description || !body.amount || !body.date) {
    return NextResponse.json({ error: "A valid transaction is required." }, { status: 400 });
  }
  return NextResponse.json({ ok: true, demo: true, transaction: body });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Transaction ID is required." }, { status: 400 });
  return NextResponse.json({ ok: true, demo: true, id });
}
