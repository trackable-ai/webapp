"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/stores/user-store";
import type { User } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Package,
  RotateCcw,
  MessageCircle,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/common";

const navigation = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Orders", href: "/app/orders", icon: Package },
  { name: "Returns", href: "/app/returns", icon: RotateCcw },
  { name: "Chat", href: "/app/chat", icon: MessageCircle },
  { name: "Settings", href: "/app/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useUser();

  const getInitials = (email: string | undefined) => {
    if (!email) return "U";
    const parts = email.split("@")[0].split(/[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getDisplayName = (user: User | null) => {
    if (!user) return "User";
    return (
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User"
    );
  };

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-60 lg:flex-col">
      <div className="flex h-full flex-col justify-between border-r border-[#E8E8E8] bg-white px-4 py-6">
        {/* Top section */}
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <Logo size="md" className="px-2" />

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/app" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#EFF6FF] text-[#3B82F6]"
                      : "text-[#7A7A7A] hover:bg-[#FAFAFA] hover:text-[#0D0D0D]"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-[#3B82F6]" : "text-[#7A7A7A]"
                    )}
                  />
                  <span className={isActive ? "font-medium" : "font-normal"}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col gap-4">
          {/* Agent Status */}
          <div className="flex items-center gap-3 rounded bg-[#ECFDF5] px-3 py-3">
            <div className="h-2 w-2 rounded-full bg-[#10B981]" />
            <span className="text-xs font-medium text-[#10B981]">
              Agent Online
            </span>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
                alt={getDisplayName(user)}
              />
              <AvatarFallback className="bg-[#3B82F6] text-xs font-medium text-white">
                {getInitials(user?.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <span className="font-heading text-[13px] font-medium text-[#0D0D0D]">
                {getDisplayName(user)}
              </span>
              <span className="text-[11px] font-normal text-[#7A7A7A]">
                {user?.email || "Not signed in"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
