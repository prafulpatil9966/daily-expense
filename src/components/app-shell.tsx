"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
