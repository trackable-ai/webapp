"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/user-store";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const initialize = useUserStore((s) => s.initialize);

  useEffect(() => {
    const cleanup = initialize();
    return cleanup;
  }, [initialize]);

  return children;
}
