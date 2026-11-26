"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { BarChart3, LayoutDashboard, Menu, PiggyBank, ReceiptText, Settings, WalletCards, X } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ReceiptText },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Budgets", href: "/budgets", icon: PiggyBank },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void Promise.resolve().then(async () => {
      try {
        const response = await fetch("/api/access", { cache: "no-store" });
        const result = await response.json() as { unlocked?: boolean };
        setUnlocked(Boolean(result.unlocked));
      } finally {
        setChecking(false);
      }
    });
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setLoginError("");

    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json() as { unlocked?: boolean; error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to sign in.");
      setUnlocked(Boolean(result.unlocked));
      setPassword("");
    } catch (issue) {
      setLoginError(issue instanceof Error ? issue.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!unlocked) {
    return (
      <main className="entry-gate">
        <div className="entry-orbit entry-orbit-one" />
        <div className="entry-orbit entry-orbit-two" />
        <form className="entry-content entry-login" onSubmit={login}>
          <div className="entry-login-card">
            <div className="entry-logo-static"><WalletCards size={26} strokeWidth={1.8} /></div>
            <div className="entry-brand">Pocket</div>
            <p className="entry-subtitle">Your personal expense dashboard</p>
            <label className="entry-password-label">
              <span>Password</span>
              <input type="password" inputMode="numeric" pattern="[0-9]*" value={password} onChange={(event) => setPassword(event.target.value.replace(/[^0-9]/g, ""))} placeholder="Enter your PIN" autoComplete="current-password" disabled={checking || submitting} autoFocus />
            </label>
            {loginError && <p className="entry-error" role="alert">{loginError}</p>}
            <button className="entry-login-button" type="submit" disabled={checking || submitting || !password}>{submitting ? "Opening..." : "Open dashboard"}</button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><WalletCards size={20} /></div>
          <span>Pocket</span>
          <button className="icon-button sidebar-close" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`} onClick={() => setOpen(false)}>
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-profile">
          <div className="avatar">PP</div>
          <div><strong>Praful Patil</strong><span>Personal account</span></div>
        </div>
      </aside>
      {open && <button className="sidebar-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />}
      <div className="main-column">
        <header className="mobile-header">
          <button className="icon-button" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={21} /></button>
          <div className="brand-row mobile-brand"><div className="brand-mark"><WalletCards size={18} /></div><span>Pocket</span></div>
        </header>
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
