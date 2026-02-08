import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UserState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  initialize: () => {
    if (get().initialized) return () => {};

    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      set({ user, loading: false, initialized: true });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null });
    });

    return () => subscription.unsubscribe();
  },
}));

export function useUser() {
  return useUserStore((s) => s.user);
}

export function useUserLoading() {
  return useUserStore((s) => s.loading);
}

export function useUserAvatarUrl() {
  return useUserStore(
    (s) =>
      s.user?.user_metadata?.avatar_url ||
      s.user?.user_metadata?.picture ||
      null,
  );
}

export function useUserDisplayName() {
  return useUserStore((s) => {
    const user = s.user;
    if (!user) return "User";
    return (
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User"
    );
  });
}
