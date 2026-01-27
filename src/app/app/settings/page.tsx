"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
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
    <div className="flex flex-col gap-6 px-10 py-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[28px] font-semibold text-[#0D0D0D]">
          Settings
        </h1>
        <p className="text-sm font-normal text-[#7A7A7A]">
          Manage your account and preferences
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Gmail Connection */}
        <div
          id="gmail"
          className="flex flex-col gap-4 rounded-lg border border-[#E8E8E8] bg-white p-6"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#0D0D0D]" />
              <h2 className="font-heading text-base font-semibold text-[#0D0D0D]">
                Gmail Connection
              </h2>
            </div>
            <p className="text-sm font-normal text-[#7A7A7A]">
              Connect your Gmail to automatically detect orders from confirmation
              emails.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#7A7A7A]" />
            </div>
          ) : gmailStatus?.connected ? (
            <div className="flex items-center justify-between rounded-lg border border-[#E8E8E8] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ECFDF5]">
                  <CheckCircle className="h-5 w-5 text-[#10B981]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-heading text-sm font-medium text-[#0D0D0D]">
                    {gmailStatus.email}
                  </span>
                  <span className="text-xs font-normal text-[#7A7A7A]">
                    Connected
                    {gmailStatus.lastSynced &&
                      ` · Last synced ${formatDistanceToNow(new Date(gmailStatus.lastSynced), { addSuffix: true })}`}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-2 rounded border border-[#E8E8E8] bg-white px-4 py-2 text-[13px] font-medium text-[#0D0D0D] transition-colors hover:bg-[#FAFAFA] disabled:opacity-50"
                >
                  {syncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Sync
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="flex items-center gap-2 rounded border border-[#E8E8E8] bg-white px-4 py-2 text-[13px] font-medium text-[#0D0D0D] transition-colors hover:bg-[#FAFAFA] disabled:opacity-50"
                >
                  {disconnecting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#E8E8E8] p-8">
              <Mail className="mb-4 h-10 w-10 text-[#B0B0B0]" />
              <h3 className="font-heading text-sm font-medium text-[#0D0D0D]">
                Gmail not connected
              </h3>
              <p className="mb-4 text-center text-xs font-normal text-[#7A7A7A]">
                Connect your Gmail to automatically find order confirmation emails.
              </p>
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 rounded bg-[#3B82F6] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2563EB]"
              >
                <Mail className="h-4 w-4" />
                Connect Gmail
              </button>
            </div>
          )}

          <div className="rounded-lg bg-[#FAFAFA] p-4">
            <p className="text-sm font-normal text-[#7A7A7A]">
              <strong className="text-[#0D0D0D]">What we access:</strong>{" "}
              Read-only access to your emails to find order confirmations and
              shipping notifications.
            </p>
            <p className="mt-2 text-sm font-normal text-[#7A7A7A]">
              <strong className="text-[#0D0D0D]">What we don&apos;t do:</strong>{" "}
              We never modify, delete, or send emails on your behalf.
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="flex flex-col gap-4 rounded-lg border border-[#E8E8E8] bg-white p-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#0D0D0D]" />
              <h2 className="font-heading text-base font-semibold text-[#0D0D0D]">
                Notifications
              </h2>
            </div>
            <p className="text-sm font-normal text-[#7A7A7A]">
              Choose how and when you want to be notified.
            </p>
          </div>

          <div className="flex flex-col divide-y divide-[#E8E8E8]">
            <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-sm font-medium text-[#0D0D0D]">
                  Return deadline reminders
                </span>
                <span className="text-xs font-normal text-[#7A7A7A]">
                  Get notified when return windows are closing
                </span>
              </div>
              <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-medium text-[#3B82F6]">
                Email + In-app
              </span>
            </div>

            <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-sm font-medium text-[#0D0D0D]">
                  Delivery updates
                </span>
                <span className="text-xs font-normal text-[#7A7A7A]">
                  Track your packages in real-time
                </span>
              </div>
              <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-medium text-[#3B82F6]">
                In-app
              </span>
            </div>

            <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-sm font-medium text-[#0D0D0D]">
                  Agent recommendations
                </span>
                <span className="text-xs font-normal text-[#7A7A7A]">
                  Suggestions for returns, exchanges, and more
                </span>
              </div>
              <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-medium text-[#3B82F6]">
                In-app
              </span>
            </div>
          </div>

          <button className="w-full rounded border border-[#E8E8E8] bg-white py-2.5 text-[13px] font-medium text-[#0D0D0D] transition-colors hover:bg-[#FAFAFA]">
            Manage notification preferences
          </button>
        </div>

        {/* Privacy & Data */}
        <div className="flex flex-col gap-4 rounded-lg border border-[#E8E8E8] bg-white p-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#0D0D0D]" />
              <h2 className="font-heading text-base font-semibold text-[#0D0D0D]">
                Privacy & Data
              </h2>
            </div>
            <p className="text-sm font-normal text-[#7A7A7A]">
              Your data is secure and only used to help you manage orders.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 text-[#10B981]" />
              <span className="text-sm font-normal text-[#7A7A7A]">
                Your email data is never sold or shared with advertisers
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 text-[#10B981]" />
              <span className="text-sm font-normal text-[#7A7A7A]">
                We only access emails related to shopping and orders
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 text-[#10B981]" />
              <span className="text-sm font-normal text-[#7A7A7A]">
                You can delete all your data at any time
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href="/privacy"
              target="_blank"
              className="flex items-center gap-2 rounded border border-[#E8E8E8] bg-white px-4 py-2.5 text-[13px] font-medium text-[#0D0D0D] transition-colors hover:bg-[#FAFAFA]"
            >
              <ExternalLink className="h-4 w-4" />
              Privacy Policy
            </a>
            <a
              href="/data-export"
              className="flex items-center gap-2 rounded border border-[#E8E8E8] bg-white px-4 py-2.5 text-[13px] font-medium text-[#0D0D0D] transition-colors hover:bg-[#FAFAFA]"
            >
              Export my data
            </a>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="flex flex-col gap-4 rounded-lg border border-[#EF4444]/50 bg-white p-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
              <h2 className="font-heading text-base font-semibold text-[#EF4444]">
                Danger Zone
              </h2>
            </div>
            <p className="text-sm font-normal text-[#7A7A7A]">
              Irreversible actions that affect your account.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[#EF4444]/20 p-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-heading text-sm font-medium text-[#0D0D0D]">
                Delete all data
              </span>
              <span className="text-xs font-normal text-[#7A7A7A]">
                Remove all your orders, preferences, and connected accounts
              </span>
            </div>
            <button className="flex items-center gap-2 rounded bg-[#EF4444] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#DC2626]">
              <Trash2 className="h-4 w-4" />
              Delete Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
