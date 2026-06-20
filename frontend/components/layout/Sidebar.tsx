"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  History,
  Gavel,
  ShieldCheck,
  Settings2,
  BarChart3,
  Users,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const USER_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload images", icon: Upload },
  { href: "/submissions", label: "Submission history", icon: History },
  { href: "/appeals", label: "My appeals", icon: Gavel },
];

const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/submissions", label: "All submissions", icon: Users },
  { href: "/admin/appeals", label: "Appeals queue", icon: Gavel },
  { href: "/admin/policies", label: "Policies", icon: Settings2 },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const navItems = user?.role === "ADMIN" ? ADMIN_NAV : USER_NAV;

  return (
    <aside className={cn("flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface", className)}>
      <div className="flex h-18 items-center gap-2.5 border-b border-border px-6">
        <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-bold text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-soft">
            <ShieldCheck className="h-5 w-5" />
          </span>
          Muhafiz
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-teal-50 text-teal-700"
                  : "text-ink-muted hover:bg-surface-muted hover:text-ink"
              )}
            >
              <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
            {user?.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
            <p className="truncate text-xs text-ink-faint">{user?.role === "ADMIN" ? "Administrator" : "Member"}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-muted hover:bg-coral-50 hover:text-coral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          <LogOut className="h-4.5 w-4.5" aria-hidden="true" />
          Log out
        </button>
      </div>
    </aside>
  );
}
