"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { categories } from "@/lib/categories";
import { formatINR } from "@/lib/format";

const initialBudgets: Record<string, number> = {
  "Food & Dining": 10000, Groceries: 12000, Transport: 6000, Shopping: 8000,
  Entertainment: 5000, "Bills & Utilities": 10000, Rent: 22000, Travel: 7000,
};

export default function BudgetsPage() {
  const [budget, setBudget] = useState(40000);
  const [categoryBudgets, setCategoryBudgets] = useState(initialBudgets);
  const { transactions, demo, loading, error } = useTransactions();
  const expenses = transactions.filter((item) => item.type === "Expense");
  const spent = expenses.reduce((sum, item) => sum + item.amount, 0);

  return <>
    {demo && <div className="demo-banner"><span>Demo mode</span><p>Using sample budgets until Notion access is configured.</p></div>}
    {loading && <div className="empty-state">Loading budget data...</div>}
    {error && <div className="demo-banner"><span>Connection</span><p>{error}</p></div>}<div className="page-header"><div><p className="eyebrow">November 2026</p><h1>Budgets</h1></div><button className="button primary" onClick={() => setBudget((value) => value + 5000)}><Plus size={17}/>Adjust budget</button></div><section className="budget-summary"><article className="panel budget-total"><div><p className="eyebrow">Monthly budget</p><strong>{formatINR(budget)}</strong></div><div className="budget-spent"><span>{formatINR(spent)} spent</span><span>{formatINR(Math.max(budget - spent, 0))} left</span></div><div className="progress-track"><div style={{ width: `${Math.min((spent / budget) * 100, 100)}%` }}/></div></article></section><section className="budget-grid">{categories.filter((item) => categoryBudgets[item.name]).map((item) => { const categorySpent = expenses.filter((transaction) => transaction.category === item.name).reduce((sum, transaction) => sum + transaction.amount, 0); const limit = categoryBudgets[item.name]; const percentage = Math.round((categorySpent / limit) * 100); const over = percentage > 100; return <article className="panel budget-card" key={item.name}><div className="budget-card-head"><span><i style={{ background: item.color }}/>{item.name}</span><button onClick={() => setCategoryBudgets((values) => ({ ...values, [item.name]: limit + 1000 }))}>Edit</button></div><strong>{formatINR(categorySpent)} <small>of {formatINR(limit)}</small></strong><div className="progress-track"><div className={over ? "over" : ""} style={{ width: `${Math.min(percentage, 100)}%`, background: over ? "#EF4444" : item.color }}/></div><p className={over ? "over-text" : ""}>{over ? `${formatINR(categorySpent - limit)} over limit` : `${formatINR(limit - categorySpent)} remaining`}</p></article>; })}</section></>;
}
