"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronDown, Plus, Search, TrendingUp, Wallet } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTransactions } from "@/hooks/use-transactions";
import { categories } from "@/lib/categories";
import { formatINR, formatShortDate } from "@/lib/format";
import { TransactionModal } from "@/components/transaction-modal";

const dailyData = [
  { day: "1 Nov", amount: 22000 }, { day: "3 Nov", amount: 3285 }, { day: "5 Nov", amount: 1250 },
  { day: "7 Nov", amount: 2458 }, { day: "9 Nov", amount: 6499 }, { day: "11 Nov", amount: 740 },
  { day: "13 Nov", amount: 1160 }, { day: "15 Nov", amount: 4200 }, { day: "18 Nov", amount: 1886 },
  { day: "21 Nov", amount: 980 }, { day: "22 Nov", amount: 1699 }, { day: "24 Nov", amount: 1320 },
];

const weeklyData = [
  { day: "Week 1", amount: 26535 }, { day: "Week 2", amount: 13457 }, { day: "Week 3", amount: 5746 }, { day: "Week 4", amount: 3999 },
];

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [trendView, setTrendView] = useState<"daily" | "weekly">("daily");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const { transactions, demo, loading, error, refresh } = useTransactions();

  const expenseTransactions = transactions.filter((item) => item.type === "Expense");
  const totalExpenses = expenseTransactions.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = transactions.filter((item) => item.type === "Income").reduce((sum, item) => sum + item.amount, 0);
  const budget = 40000;
  const remaining = budget - totalExpenses;

  const categoryData = categories.map((category) => ({
    name: category.name,
    value: expenseTransactions.filter((item) => item.category === category.name).reduce((sum, item) => sum + item.amount, 0),
    color: category.color,
  })).filter((item) => item.value > 0);

  const filteredTransactions = expenseTransactions
    .filter((item) => categoryFilter === "All" || item.category === categoryFilter)
    .filter((item) => item.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <div className="page-header">
        <div><p className="eyebrow">Wednesday, 25 November</p><h1>Welcome back, Praful</h1></div>
        <div className="header-actions">
          <label className="month-select"><span>November 2026</span><ChevronDown size={16} /><select aria-label="Select month"><option>November 2026</option><option>October 2026</option></select></label>
          <button className="button primary" onClick={() => setModalOpen(true)}><Plus size={17} />Quick add</button>
        </div>
      </div>

      {demo && <div className="demo-banner"><span>Demo mode</span><p>Using sample data. Connect Notion in Settings to use your real transactions.</p></div>}
      {loading && <div className="empty-state">Loading transactions...</div>}
      {error && <div className="demo-banner"><span>Connection</span><p>{error}</p></div>}

      <section className="summary-grid">
        <article className="summary-card"><div className="summary-top"><span>Total expenses</span><div className="summary-icon indigo"><Wallet size={18} /></div></div><strong>{formatINR(totalExpenses)}</strong><p className="metric-note positive"><ArrowDownRight size={14} /> 8.4% <span>vs last month</span></p></article>
        <article className="summary-card"><div className="summary-top"><span>Total income</span><div className="summary-icon green"><TrendingUp size={18} /></div></div><strong>{formatINR(totalIncome)}</strong><p className="metric-note positive"><ArrowUpRight size={14} /> 12.0% <span>vs last month</span></p></article>
        <article className="summary-card"><div className="summary-top"><span>Remaining budget</span><div className="summary-icon amber">₹</div></div><strong>{formatINR(remaining)}</strong><div className="progress-row"><div className="progress-track"><div style={{ width: `${Math.min((totalExpenses / budget) * 100, 100)}%` }} /></div><span>{Math.round((totalExpenses / budget) * 100)}%</span></div></article>
        <article className="summary-card"><div className="summary-top"><span>Savings</span><div className="summary-icon slate"><ArrowUpRight size={18} /></div></div><strong>{formatINR(totalIncome - totalExpenses)}</strong><p className="metric-note"><b>{Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)}%</b> <span>of income saved</span></p></article>
      </section>

      <section className="dashboard-grid">
        <article className="panel trend-panel">
          <div className="panel-header"><div><p className="eyebrow">Overview</p><h2>Spending trends</h2></div><div className="segmented"><button className={trendView === "daily" ? "selected" : ""} onClick={() => setTrendView("daily")}>Daily</button><button className={trendView === "weekly" ? "selected" : ""} onClick={() => setTrendView("weekly")}>Weekly</button></div></div>
          <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendView === "daily" ? dailyData : weeklyData} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}><defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366F1" stopOpacity={0.18}/><stop offset="100%" stopColor="#6366F1" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#EEF0F4" vertical={false}/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#8B93A7", fontSize: 12 }}/><YAxis axisLine={false} tickLine={false} tick={{ fill: "#8B93A7", fontSize: 12 }} tickFormatter={(value) => `₹${value / 1000}k`}/><Tooltip formatter={(value) => formatINR(Number(value))} contentStyle={{ borderRadius: 8, border: "1px solid #E8EAF0", boxShadow: "0 8px 24px rgba(17,24,39,.08)" }}/><Area type="monotone" dataKey="amount" stroke="#6366F1" strokeWidth={2.5} fill="url(#trendFill)" activeDot={{ r: 5, fill: "#6366F1", strokeWidth: 3, stroke: "#fff" }}/></AreaChart></ResponsiveContainer></div>
        </article>

        <article className="panel category-panel">
          <div className="panel-header"><div><p className="eyebrow">Distribution</p><h2>By category</h2></div></div>
          <div className="donut-layout"><div className="donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3} stroke="none" onClick={(entry) => setCategoryFilter(String(entry.name))}>{categoryData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip formatter={(value) => formatINR(Number(value))}/></PieChart></ResponsiveContainer><div className="donut-center"><strong>{formatINR(totalExpenses)}</strong><span>Total</span></div></div>
          <div className="category-list">{categoryData.slice(0, 5).map((item) => <button key={item.name} className={categoryFilter === item.name ? "category-row selected-row" : "category-row"} onClick={() => setCategoryFilter(categoryFilter === item.name ? "All" : item.name)}><span className="category-name"><i style={{ background: item.color }} />{item.name}</span><span><strong>{formatINR(item.value)}</strong><small>{Math.round((item.value / totalExpenses) * 100)}%</small></span></button>)}</div></div>
        </article>
      </section>

      <section className="panel transactions-panel">
        <div className="panel-header"><div><p className="eyebrow">Latest activity</p><h2>Recent transactions</h2></div><div className="table-tools"><label className="search-box"><Search size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions" /></label><label className="filter-select"><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option>All</option>{categories.map((category) => <option key={category.name}>{category.name}</option>)}</select><ChevronDown size={14}/></label></div></div>
        <div className="table-wrap"><table><thead><tr><th>Description</th><th>Category</th><th>Date</th><th>Payment</th><th className="amount-head">Amount</th></tr></thead><tbody>{filteredTransactions.slice(0, 7).map((item) => { const color = categories.find((category) => category.name === item.category)?.color ?? "#94A3B8"; return <tr key={item.id}><td><strong>{item.description}</strong></td><td><span className="category-pill" style={{ backgroundColor: `${color}18`, borderColor: `${color}55`, color }}><i style={{ background: color }}/>{item.category}</span></td><td>{formatShortDate(item.date)}</td><td>{item.paymentMethod}</td><td className="amount-cell">-{formatINR(item.amount)}</td></tr>; })}</tbody></table>{filteredTransactions.length === 0 && <div className="empty-state">No transactions match your filters.</div>}</div>
      </section>

      <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} onAdded={() => { setModalOpen(false); void refresh(); }} />
    </>
  );
}
