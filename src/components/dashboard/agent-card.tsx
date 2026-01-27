"use client";

import Link from "next/link";
import { Sparkles, MessageCircle, Package } from "lucide-react";

interface AgentCardProps {
  message: string;
}

export function AgentCard({ message }: AgentCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-[#3B82F6] bg-[#EFF6FF] p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3B82F6]">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-heading text-base font-semibold text-[#3B82F6]">
            Your AI Agent
          </span>
          <span className="text-xs font-normal text-[#7A7A7A]">
            Ready to help
          </span>
        </div>
      </div>

      {/* Message */}
      <p className="text-sm font-normal leading-relaxed text-[#0D0D0D]">
        {message}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/app/chat"
          className="flex items-center gap-2 rounded bg-[#3B82F6] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2563EB]"
        >
          <MessageCircle className="h-4 w-4" />
          Ask Agent
        </Link>
        <Link
          href="/app/orders"
          className="flex items-center gap-2 rounded border border-[#E8E8E8] bg-white px-5 py-2.5 text-[13px] font-medium text-[#0D0D0D] transition-colors hover:bg-[#FAFAFA]"
        >
          <Package className="h-4 w-4 text-[#7A7A7A]" />
          Track Orders
        </Link>
      </div>
    </div>
  );
}
