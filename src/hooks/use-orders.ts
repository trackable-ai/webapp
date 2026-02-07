"use client";

import { useState, useEffect, useCallback } from "react";
import type { Order } from "@/types";

interface UseOrdersResult {
  orders: Order[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOrders(): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) {
        throw new Error(`Failed to fetch orders: ${res.status}`);
      }
      const data = await res.json();
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { orders, total, loading, error, refetch: fetchData };
}

interface UseOrderResult {
  order: Order | null;
  loading: boolean;
  error: string | null;
}

export function useOrder(id: string): UseOrderResult {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch order: ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) setOrder(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { order, loading, error };
}
