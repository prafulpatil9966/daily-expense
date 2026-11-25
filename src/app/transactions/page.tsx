"use client";

import { useState } from "react";
import { ChevronDown, Plus, Search } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { categories } from "@/lib/categories";
import { formatINR, formatShortDate } from "@/lib/format";
import { TransactionModal } from "@/components/transaction-modal";

export default function TransactionsPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [payment, setPayment] = useState("All");
  const [sort, setSort] = useState("date");
  const { transactions: liveTransactions, demo, loading, error, refresh } = useTransactions();
  const transactions = liveTransactions.filter((item) =>
    item.description.toLowerCase().includes(search.toLowerCase()) &&
    (category === "All" || item.category === category) &&
    (payment === "All" || item.paymentMethod === payment)
  ).sort((a, b) => sort === "amount" ? b.amount - a.amount : b.date.localeCompare(a.date));

  return (
    <>
      <div className="page-header"><div><p className="eyebrow">Money movement</p><h1>Transactions</h1></div><button className="button primary" onClick={() => setOpen(true)}><Plus size={17}/>Add transaction</button></div>
      {demo && <div className="demo-banner"><span>Demo mode</span><p>Using sample data until Notion access is configured.</p></div>}
      {loading && <div className="empty-state">Loading transactions...</div>}
      {error && <div className="demo-banner"><span>Connection</span><p>{error}</p></div>}
      <section className="panel transactions-panel">
        <div className="panel-header transaction-toolbar"><div className="table-tools"><label className="search-box"><Search size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search description" /></label><label className="filter-select"><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option>{categories.map((item) => <option key={item.name}>{item.name}</option>)}</select><ChevronDown size={14}/></label><label className="filter-select"><select value={payment} onChange={(event) => setPayment(event.target.value)}><option>All</option>{["UPI","Credit card","Debit card","Cash","Net banking","Bank transfer"].map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14}/></label></div><label className="filter-select"><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="date">Newest first</option><option value="amount">Highest amount</option></select><ChevronDown size={14}/></label></div>
        <div className="table-wrap"><table><thead><tr><th>Description</th><th>Category</th><th>Date</th><th>Payment</th><th>Type</th><th className="amount-head">Amount</th></tr></thead><tbody>{transactions.map((item) => <tr key={item.id}><td><strong>{item.description}</strong></td><td>{item.category}</td><td>{formatShortDate(item.date)}</td><td>{item.paymentMethod}</td><td>{item.type}</td><td className="amount-cell">{item.type === "Income" ? "+" : "-"}{formatINR(item.amount)}</td></tr>)}</tbody></table>{transactions.length === 0 && <div className="empty-state">No transactions match your filters.</div>}</div>
      </section>
      <TransactionModal open={open} onClose={() => setOpen(false)} onAdded={() => { setOpen(false); void refresh(); }} />
    </>
  );
}
