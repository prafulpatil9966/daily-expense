"use client";

import { useCallback, useEffect, useState } from "react";
import type { Transaction } from "@/types/transaction";

interface TransactionsResponse {
  data: Transaction[];
  demo: boolean;
  error?: string;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [demo, setDemo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/transactions", { cache: "no-store" });
      const result = await response.json() as TransactionsResponse;
      if (!response.ok) throw new Error(result.error ?? "Could not load transactions.");
      setTransactions(result.data);
      setDemo(result.demo);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Could not load transactions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refresh);

    const intervalId = window.setInterval(() => {
      void refresh();
    }, 30_000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refresh]);

  return { transactions, demo, loading, error, refresh };
}
