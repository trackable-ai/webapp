import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";

  if (code) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // Store the provider tokens for Gmail API access
      const providerToken = data.session.provider_token;
      const providerRefreshToken = data.session.provider_refresh_token;

      if (providerToken) {
        // Store tokens in database for later Gmail API use
        const { error: upsertError } = await supabase
          .from("user_gmail_tokens")
          .upsert(
            {
              user_id: data.session.user.id,
              access_token: providerToken,
              refresh_token: providerRefreshToken,
              expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
              scope: "https://www.googleapis.com/auth/gmail.readonly",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

        if (upsertError) {
          console.error("Failed to store Gmail tokens:", upsertError);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("Auth callback error:", error);
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
