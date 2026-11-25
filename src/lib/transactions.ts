import type { Transaction } from "@/types/transaction";
import { mockTransactions } from "@/lib/mock-data";

export function isDemoMode(): boolean {
  return !process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID;
}

export function getTransactions(): Transaction[] {
  return mockTransactions;
}
