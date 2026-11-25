"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTransactions } from "@/hooks/use-transactions";
import { categories } from "@/lib/categories";
import { formatINR } from "@/lib/format";

const monthlyData = [
  { month: "Jun", income: 92000, expenses: 51000 }, { month: "Jul", income: 92000, expenses: 57500 },
  { month: "Aug", income: 96000, expenses: 54800 }, { month: "Sep", income: 96000, expenses: 62000 },
  { month: "Oct", income: 92000, expenses: 58200 }, { month: "Nov", income: 103000, expenses: 47787 },
];

export default function AnalyticsPage() {
  const { transactions, demo, loading, error } = useTransactions();
  const expenses = transactions.filter((item) => item.type === "Expense");
  const categoryData = categories.map((category) => ({ name: category.name, amount: expenses.filter((item) => item.category === category.name).reduce((sum, item) => sum + item.amount, 0) })).filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount);
  const top = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);

  return <>
    {demo && <div className="demo-banner"><span>Demo mode</span><p>Using sample analytics until Notion access is configured.</p></div>}
    {loading && <div className="empty-state">Loading analytics...</div>}
    {error && <div className="demo-banner"><span>Connection</span><p>{error}</p></div>}<div className="page-header"><div><p className="eyebrow">Financial performance</p><h1>Analytics</h1></div></div><section className="analytics-grid"><article className="panel"><div className="panel-header"><div><p className="eyebrow">Six months</p><h2>Income vs expenses</h2></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><LineChart data={monthlyData} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}><CartesianGrid stroke="#EEF0F4" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value / 1000}k`}/><Tooltip formatter={(value) => formatINR(Number(value))}/><Line type="monotone" dataKey="income" stroke="#16A34A" strokeWidth={2.5}/><Line type="monotone" dataKey="expenses" stroke="#6366F1" strokeWidth={2.5}/></LineChart></ResponsiveContainer></div></article><article className="panel"><div className="panel-header"><div><p className="eyebrow">This month</p><h2>Top categories</h2></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}><CartesianGrid stroke="#EEF0F4" horizontal={false}/><XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value / 1000}k`}/><YAxis type="category" dataKey="name" width={110} axisLine={false} tickLine={false}/><Tooltip formatter={(value) => formatINR(Number(value))}/><Bar dataKey="amount" fill="#6366F1" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></div></article></section><section className="panel top-transactions"><div className="panel-header"><div><p className="eyebrow">Largest purchases</p><h2>Top transactions</h2></div></div><div className="table-wrap"><table><thead><tr><th>Description</th><th>Category</th><th>Date</th><th className="amount-head">Amount</th></tr></thead><tbody>{top.map((item) => <tr key={item.id}><td><strong>{item.description}</strong></td><td>{item.category}</td><td>{item.date}</td><td className="amount-cell">-{formatINR(item.amount)}</td></tr>)}</tbody></table></div></section></>;
}
