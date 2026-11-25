export type TransactionType = "Expense" | "Income";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  paymentMethod: string;
  type: TransactionType;
  notes?: string;
}
