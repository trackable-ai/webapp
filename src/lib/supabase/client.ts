import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Use placeholder values during SSR/build to prevent errors.
  // The actual client will only be used on the browser where real env vars are available.
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createBrowserClient(url, key);
}
