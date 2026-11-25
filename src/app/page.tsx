"use client";

import { useState } from "react";
import { ArrowDownRight, ChevronDown, Plus, Search, Wallet } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { categories, getCategoryColor } from "@/lib/categories";
import { formatINR, formatShortDate } from "@/lib/format";
import { TransactionModal } from "@/components/transaction-modal";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const { transactions, demo, loading, error, refresh } = useTransactions();

  const expenseTransactions = transactions.filter((item) => item.type === "Expense");
  const totalExpenses = expenseTransactions.reduce((sum, item) => sum + item.amount, 0);
  const budget = 40000;
  const remaining = budget - totalExpenses;

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
        <article className="summary-card"><div className="summary-top"><span>Remaining budget</span><div className="summary-icon amber">₹</div></div><strong>{formatINR(remaining)}</strong><div className="progress-row"><div className="progress-track"><div style={{ width: `${Math.min((totalExpenses / budget) * 100, 100)}%` }} /></div><span>{Math.round((totalExpenses / budget) * 100)}%</span></div></article>
      </section>

      <section className="panel transactions-panel">
        <div className="panel-header"><div><p className="eyebrow">Latest activity</p><h2>Recent transactions</h2></div><div className="table-tools"><label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions" /></label><label className="filter-select"><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option>All</option>{categories.map((category) => <option key={category.name}>{category.name}</option>)}</select><ChevronDown size={14} /></label></div></div>
        <div className="table-wrap"><table className="dashboard-recent-table"><thead><tr><th>Description</th><th>Category</th><th>Date</th><th className="amount-head">Amount</th></tr></thead><tbody>{filteredTransactions.slice(0, 7).map((item) => { const color = getCategoryColor(item.category); return <tr key={item.id}><td><strong>{item.description}</strong></td><td><span className="category-pill" style={{ backgroundColor: `${color}18`, borderColor: `${color}55`, color }}><i style={{ background: color }} />{item.category}</span></td><td>{formatShortDate(item.date)}</td><td className="amount-cell">-{formatINR(item.amount)}</td></tr>; })}</tbody></table>{filteredTransactions.length === 0 && <div className="empty-state">No transactions match your filters.</div>}</div>
      </section>

      <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} onAdded={() => { setModalOpen(false); void refresh(); }} />
    </>
  );
}
