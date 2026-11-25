"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { categories } from "@/lib/categories";

export function TransactionModal({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get("amount"));
    if (!form.get("description") || !amount || amount <= 0 || !form.get("date")) {
      setError("Add a description, positive amount, and date.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save transaction.");
      onAdded();
      onClose();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Could not save transaction.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="expense-title">
      <div className="modal">
        <div className="modal-header">
          <div><p className="eyebrow">New transaction</p><h2 id="expense-title">Quick add</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <form className="transaction-form" onSubmit={submit}>
          <label>Description<input name="description" placeholder="e.g. Grocery run" autoFocus /></label>
          <div className="form-grid">
            <label>Amount (₹)<input name="amount" type="number" min="1" step="1" placeholder="0" /></label>
            <label>Date<input name="date" type="date" defaultValue="2026-11-25" /></label>
          </div>
          <div className="form-grid">
            <label>Category<select name="category" defaultValue="Food & Dining">{categories.map((category) => <option key={category.name}>{category.name}</option>)}</select></label>
            <label>Payment method<select name="paymentMethod"><option>UPI</option><option>Credit card</option><option>Debit card</option><option>Cash</option><option>Net banking</option><option>Bank transfer</option></select></label>
          </div>
          <label>Transaction type<select name="type"><option>Expense</option><option>Income</option></select></label>
          <label>Notes<textarea name="notes" placeholder="Optional note" rows={3} /></label>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" disabled={submitting}>{submitting ? "Saving..." : "Save transaction"}</button></div>
        </form>
      </div>
    </div>
  );
}
