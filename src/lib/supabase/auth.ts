import { createClient } from "./server";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

export async function withAuth(
  handler: (user: User) => Promise<Response>,
): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return handler(user);
}
