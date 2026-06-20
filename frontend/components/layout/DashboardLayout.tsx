import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar className="hidden md:flex" />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-surface px-5 md:hidden">
          <MobileSidebar />
          <span className="font-display text-base font-bold text-ink">Muhafiz</span>
        </header>
        <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
