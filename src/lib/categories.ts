export interface Category {
  name: string;
  color: string;
}

export const categories: Category[] = [
  { name: "Food & Dining", color: "#6366F1" },
  { name: "Groceries", color: "#22C55E" },
  { name: "Transport", color: "#F59E0B" },
  { name: "Shopping", color: "#EC4899" },
  { name: "Entertainment", color: "#8B5CF6" },
  { name: "Bills & Utilities", color: "#0EA5E9" },
  { name: "Rent", color: "#F97316" },
  { name: "Travel", color: "#14B8A6" },
  { name: "Healthcare", color: "#EF4444" },
  { name: "Investments", color: "#64748B" },
  { name: "Education", color: "#A855F7" },
  { name: "Personal", color: "#D946EF" },
  { name: "Miscellaneous", color: "#94A3B8" },
];

export function normalizeCategoryName(name: string): string {
  const aliases: Record<string, string> = {
    "Food & drink": "Food & Dining",
    Petrol: "Transport",
  };
  return aliases[name] ?? name;
}

export function getCategoryColor(name: string): string {
  const normalizedName = normalizeCategoryName(name);
  return categories.find((category) => category.name === normalizedName)?.color ?? "#94A3B8";
}
