"use client";

import Link from "next/link";
import { ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#policies", label: "Policies" },
  { href: "#appeals", label: "Appeals" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const dashboardHref = user?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/80 backdrop-blur-md">
      <nav className="container flex h-18 items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-bold text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-soft">
            <ShieldCheck className="h-5 w-5" />
          </span>
          Muhafiz
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-muted hover:text-ink transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Button asChild size="md">
              <Link href={dashboardHref}>Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="md">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="md">
                <Link href="/register">Start moderating</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 text-ink"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-border bg-canvas px-6 py-5 space-y-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-ink-muted"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2.5 pt-2">
            {isAuthenticated ? (
              <Button asChild>
                <Link href={dashboardHref}>Go to dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="secondary">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Start moderating</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
