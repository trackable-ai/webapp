"use client";

import { useState } from "react";
import { Sidebar, MobileNav } from "@/components/layout";
import { Menu, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar for desktop */}
      <Sidebar />

      {/* Mobile navigation */}
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

      {/* Main content area */}
      <div className="lg:pl-60">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-[#E8E8E8] bg-white px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open sidebar</span>
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#3B82F6]">
              <PackageCheck className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading text-base font-semibold text-[#0D0D0D]">
              Trackable
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-56px)] lg:min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
