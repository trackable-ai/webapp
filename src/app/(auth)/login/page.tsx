"use client";

import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Shield, Package } from "lucide-react";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        scopes:
          "openid email profile https://www.googleapis.com/auth/gmail.readonly",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle>Welcome to Trackable</CardTitle>
          <CardDescription>
            Connect your Gmail to automatically track your orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              Authentication failed. Please try again.
            </div>
          )}

          <Button onClick={handleGoogleLogin} className="w-full" size="lg">
            <Mail className="mr-2 h-5 w-5" />
            Continue with Gmail
          </Button>

          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Read-only access to find order emails</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>We never send or modify emails</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Disconnect anytime in settings</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
