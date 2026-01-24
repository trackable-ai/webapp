"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Bell,
  Shield,
  Trash2,
  CheckCircle,
  ExternalLink,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface GmailStatus {
  connected: boolean;
  email: string | null;
  lastSynced: string | null;
}

export default function SettingsPage() {
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchGmailStatus();
  }, []);

  const fetchGmailStatus = async () => {
    try {
      const response = await fetch("/api/gmail/sync");
      const data = await response.json();
      setGmailStatus(data);
    } catch {
      setGmailStatus({ connected: false, email: null, lastSynced: null });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/app/settings`,
        scopes:
          "openid email profile https://www.googleapis.com/auth/gmail.readonly",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get token and revoke it
      const { data: tokens } = await supabase
        .from("user_gmail_tokens")
        .select("access_token")
        .eq("user_id", user.id)
        .single();

      if (tokens?.access_token) {
        await fetch(
          `https://oauth2.googleapis.com/revoke?token=${tokens.access_token}`,
          { method: "POST" }
        ).catch(() => {});
      }

      // Delete from database
      await supabase.from("user_gmail_tokens").delete().eq("user_id", user.id);

      setGmailStatus({ connected: false, email: null, lastSynced: null });
    } catch (error) {
      console.error("Disconnect error:", error);
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/gmail/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxResults: 20 }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchGmailStatus();
      }
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Gmail Connection */}
        <Card id="gmail">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Gmail Connection
            </CardTitle>
            <CardDescription>
              Connect your Gmail to automatically detect orders from confirmation
              emails.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : gmailStatus?.connected ? (
              <>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-delivered/10">
                      <CheckCircle className="h-5 w-5 text-status-delivered" />
                    </div>
                    <div>
                      <p className="font-medium">{gmailStatus.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Connected
                        {gmailStatus.lastSynced &&
                          ` · Last synced ${formatDistanceToNow(new Date(gmailStatus.lastSynced), { addSuffix: true })}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSync}
                      disabled={syncing}
                    >
                      {syncing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Sync
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDisconnect}
                      disabled={disconnecting}
                    >
                      {disconnecting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Disconnect
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <Mail className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-1">Gmail not connected</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your Gmail to automatically find order confirmation
                  emails.
                </p>
                <Button onClick={handleConnect}>
                  <Mail className="mr-2 h-4 w-4" />
                  Connect Gmail
                </Button>
              </div>
            )}

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                <strong>What we access:</strong> Read-only access to your emails
                to find order confirmations and shipping notifications.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                <strong>What we don&apos;t do:</strong> We never modify, delete,
                or send emails on your behalf.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Choose how and when you want to be notified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Return deadline reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when return windows are closing
                  </p>
                </div>
                <Badge>Email + In-app</Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delivery updates</p>
                  <p className="text-sm text-muted-foreground">
                    Track your packages in real-time
                  </p>
                </div>
                <Badge>In-app</Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Agent recommendations</p>
                  <p className="text-sm text-muted-foreground">
                    Suggestions for returns, exchanges, and more
                  </p>
                </div>
                <Badge>In-app</Badge>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Manage notification preferences
            </Button>
          </CardContent>
        </Card>

        {/* Privacy & Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Data
            </CardTitle>
            <CardDescription>
              Your data is secure and only used to help you manage orders.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-status-delivered mt-0.5" />
                <span>
                  Your email data is never sold or shared with advertisers
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-status-delivered mt-0.5" />
                <span>
                  We only access emails related to shopping and orders
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-status-delivered mt-0.5" />
                <span>You can delete all your data at any time</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href="/privacy" target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Privacy Policy
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/data-export">Export my data</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions that affect your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
              <div>
                <p className="font-medium">Delete all data</p>
                <p className="text-sm text-muted-foreground">
                  Remove all your orders, preferences, and connected accounts
                </p>
              </div>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
