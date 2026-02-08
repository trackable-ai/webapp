"use client";

import { useCallback } from "react";
import useSWR from "swr";
import type { Order } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  return res.json();
});

interface OrdersResponse {
  orders: Order[];
  total: number;
}

export function useOrders() {
  const { data, error, isLoading, mutate } = useSWR<OrdersResponse>(
    "/api/orders",
    fetcher,
    { dedupingInterval: 5000 },
  );

  const refetch = useCallback(() => { mutate(); }, [mutate]);

  return {
    orders: data?.orders ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

export function useOrder(id: string) {
  const { data, error, isLoading } = useSWR<Order>(
    `/api/orders/${id}`,
    fetcher,
    { dedupingInterval: 5000 },
  );

  return {
    order: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
  };
}
