"use client";

import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTransactions } from "@/hooks/use-transactions";
import { categories } from "@/lib/categories";
import { formatINR } from "@/lib/format";

export default function AnalyticsPage() {
  const [trendPeriod, setTrendPeriod] = useState<"daily" | "weekly">("daily");
  const { transactions, demo, loading, error } = useTransactions();
  const expenses = transactions.filter((item) => item.type === "Expense");
  const categoryData = categories.map((category) => ({ name: category.name, amount: expenses.filter((item) => item.category === category.name).reduce((sum, item) => sum + item.amount, 0) })).filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount);
  const top = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);

  const spendingTrend = (() => {
    if (trendPeriod === "weekly") {
      const totals = new Map<string, number>();
      expenses.forEach((item) => {
        const date = new Date(`${item.date}T00:00:00`);
        const start = new Date(date);
        start.setDate(date.getDate() - date.getDay());
        const key = start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
        totals.set(key, (totals.get(key) ?? 0) + item.amount);
      });
      return [...totals.entries()].map(([week, amount]) => ({ label: week, amount })).sort((a, b) => a.label.localeCompare(b.label));
    }

    const totals = new Map<string, number>();
    expenses.forEach((item) => {
      const date = new Date(`${item.date}T00:00:00`);
      const key = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      totals.set(key, (totals.get(key) ?? 0) + item.amount);
    });
    return [...totals.entries()].map(([day, amount]) => ({ label: day, amount })).sort((a, b) => new Date(`${a.label} 2026`).getTime() - new Date(`${b.label} 2026`).getTime());
  })();

  return <>
    {demo && <div className="demo-banner"><span>Demo mode</span><p>Using sample analytics until Notion access is configured.</p></div>}
    {loading && <div className="empty-state">Loading analytics...</div>}
    {error && <div className="demo-banner"><span>Connection</span><p>{error}</p></div>}<div className="page-header"><div><p className="eyebrow">Financial performance</p><h1>Analytics</h1></div></div><section className="analytics-grid"><article className="panel"><div className="panel-header"><div><p className="eyebrow">Live data</p><h2>Spending trends</h2></div><div className="segmented"><button className={trendPeriod === "daily" ? "selected" : ""} onClick={() => setTrendPeriod("daily")}>Daily</button><button className={trendPeriod === "weekly" ? "selected" : ""} onClick={() => setTrendPeriod("weekly")}>Weekly</button></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={spendingTrend} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}><defs><linearGradient id="analyticsTrend" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366F1" stopOpacity={0.18}/><stop offset="100%" stopColor="#6366F1" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#EEF0F4" vertical={false}/><XAxis dataKey="label" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value / 1000}k`}/><Tooltip formatter={(value) => formatINR(Number(value))}/><Area type="monotone" dataKey="amount" stroke="#6366F1" strokeWidth={2.5} fill="url(#analyticsTrend)"/></AreaChart></ResponsiveContainer></div></article><article className="panel"><div className="panel-header"><div><p className="eyebrow">This month</p><h2>Top categories</h2></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}><CartesianGrid stroke="#EEF0F4" horizontal={false}/><XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value / 1000}k`}/><YAxis type="category" dataKey="name" width={110} axisLine={false} tickLine={false}/><Tooltip formatter={(value) => formatINR(Number(value))}/><Bar dataKey="amount" fill="#6366F1" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></div></article></section><section className="panel top-transactions"><div className="panel-header"><div><p className="eyebrow">Largest purchases</p><h2>Top transactions</h2></div></div><div className="table-wrap"><table><thead><tr><th>Description</th><th>Category</th><th>Date</th><th className="amount-head">Amount</th></tr></thead><tbody>{top.map((item) => <tr key={item.id}><td><strong>{item.description}</strong></td><td>{item.category}</td><td>{item.date}</td><td className="amount-cell">-{formatINR(item.amount)}</td></tr>)}</tbody></table></div></section></>;
}
