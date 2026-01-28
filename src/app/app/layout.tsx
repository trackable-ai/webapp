"use client";

import { useState } from "react";
import { Sidebar, MobileNav } from "@/components/layout";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common";

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
          <Logo size="sm" />
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-56px)] lg:min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
