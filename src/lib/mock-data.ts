import type { Transaction } from "@/types/transaction";

export const mockTransactions: Transaction[] = [
  { id: "1", description: "Monthly salary", amount: 85000, date: "2026-11-01", category: "Investments", paymentMethod: "Bank transfer", type: "Income", notes: "November payroll" },
  { id: "2", description: "Apartment rent", amount: 22000, date: "2026-11-02", category: "Rent", paymentMethod: "Bank transfer", type: "Expense" },
  { id: "3", description: "BigBasket groceries", amount: 3285, date: "2026-11-03", category: "Groceries", paymentMethod: "UPI", type: "Expense" },
  { id: "4", description: "Dinner at The Bombay Canteen", amount: 2150, date: "2026-11-04", category: "Food & Dining", paymentMethod: "Credit card", type: "Expense" },
  { id: "5", description: "Monthly metro pass", amount: 1250, date: "2026-11-05", category: "Transport", paymentMethod: "UPI", type: "Expense" },
  { id: "6", description: "Electricity bill", amount: 2458, date: "2026-11-07", category: "Bills & Utilities", paymentMethod: "Net banking", type: "Expense" },
  { id: "7", description: "Nike running shoes", amount: 6499, date: "2026-11-09", category: "Shopping", paymentMethod: "Credit card", type: "Expense" },
  { id: "8", description: "Coffee meeting", amount: 740, date: "2026-11-11", category: "Food & Dining", paymentMethod: "UPI", type: "Expense" },
  { id: "9", description: "Movie tickets", amount: 1160, date: "2026-11-13", category: "Entertainment", paymentMethod: "UPI", type: "Expense" },
  { id: "10", description: "Health insurance", amount: 4200, date: "2026-11-15", category: "Healthcare", paymentMethod: "Debit card", type: "Expense" },
  { id: "11", description: "Freelance project", amount: 18000, date: "2026-11-18", category: "Miscellaneous", paymentMethod: "Bank transfer", type: "Income" },
  { id: "12", description: "Supermarket restock", amount: 1886, date: "2026-11-20", category: "Groceries", paymentMethod: "UPI", type: "Expense" },
  { id: "13", description: "Cab to airport", amount: 980, date: "2026-11-21", category: "Transport", paymentMethod: "UPI", type: "Expense" },
  { id: "14", description: "Internet and mobile", amount: 1699, date: "2026-11-22", category: "Bills & Utilities", paymentMethod: "Net banking", type: "Expense" },
  { id: "15", description: "Weekend brunch", amount: 1320, date: "2026-11-24", category: "Food & Dining", paymentMethod: "Credit card", type: "Expense" },
];
