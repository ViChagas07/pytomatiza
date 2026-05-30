/* ═══════════════════════════════════════════════════════════════════
   Pytomatiza+ Dashboard Layout
   Shell for all authenticated pages: aura background + navbar +
   content area. The aura reflects the user's chosen accent color
   and uses a UNIQUE random animation pattern per section — every
   page gets its own distinct motion, and the pattern changes
   whenever the user navigates between tabs.
   ═══════════════════════════════════════════════════════════════════ */

import { type ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AuraBackground } from "@/components/layout/AuraBackground";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Aurora background — fixed behind content, reflects accent color */}
      <AuraBackground />

      {/* Navbar — z-50 (defined in Navbar), always on top */}
      <Navbar />

      {/* Main content — z-[1] ensures it paints above the aura */}
      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-[1] flex-1 p-4 pt-[calc(14*4px+1rem)] lg:p-6 lg:pt-[calc(14*4px+1.5rem)]"
      >
        {children}
      </main>
    </div>
  );
}
