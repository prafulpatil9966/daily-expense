"use client";

import { useEffect, useState } from "react";
import { Check, Database, Palette, Wallet } from "lucide-react";
import { categories } from "@/lib/categories";

export default function SettingsPage() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "Light";
    return localStorage.getItem("pocket-theme") || "Light";
  });
  const [integration, setIntegration] = useState<{ demo: boolean; error?: string } | null>(null);

  useEffect(() => {
    void Promise.resolve().then(async () => {
      try {
        const response = await fetch("/api/transactions", { cache: "no-store" });
        const result = await response.json() as { demo: boolean; error?: string };
        setIntegration({ demo: result.demo, error: result.error });
      } catch {
        setIntegration({ demo: false, error: "Could not check integration status." });
      }
    });
  }, []);

  function selectTheme(value: string) {
    setTheme(value);
    localStorage.setItem("pocket-theme", value);
  }
  return <><div className="page-header"><div><p className="eyebrow">Preferences</p><h1>Settings</h1></div></div><section className="settings-grid"><article className="panel settings-card"><div className="settings-card-head"><div className="summary-icon indigo"><Database size={18}/></div><div><h2>Notion integration</h2><p>{integration?.demo ? "Demo mode" : integration ? "Connected" : "Checking connection..."}</p></div></div><p className="settings-copy">Set <code>NOTION_API_KEY</code> and <code>NOTION_DATABASE_ID</code>, then restart the development server. Required properties: Spend, Amount, Date, Category, Payment Method, Type, and Notes.</p><div className="integration-state"><span className={integration?.demo ? "warning" : "success"}><i/>{integration?.demo ? "Demo mode - Notion not configured" : integration?.error ? "Connection error" : integration ? "Connected" : "Checking connection..."}</span>{integration?.error && <p className="settings-copy">{integration.error}</p>}</div></article><article className="panel settings-card"><div className="settings-card-head"><div className="summary-icon green"><Wallet size={18}/></div><div><h2>Currency</h2><p>Formatting preference</p></div></div><label className="setting-row"><span>Primary currency</span><strong>Indian Rupee (INR)</strong></label></article><article className="panel settings-card"><div className="settings-card-head"><div className="summary-icon amber"><Palette size={18}/></div><div><h2>Appearance</h2><p>Interface theme</p></div></div><div className="theme-options">{["Light","Dark","System"].map((item) => <button key={item} className={theme === item ? "selected" : ""} onClick={() => selectTheme(item)}>{theme === item && <Check size={14}/>}<span>{item}</span></button>)}</div></article><article className="panel settings-card category-settings"><div className="settings-card-head"><div><h2>Categories</h2><p>{categories.length} categories configured</p></div></div><div className="category-config">{categories.map((item) => <span key={item.name}><i style={{ background: item.color }}/>{item.name}</span>)}</div></article></section></>;
}
