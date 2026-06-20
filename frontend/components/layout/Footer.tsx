import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-bold text-ink">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
                <ShieldCheck className="h-4.5 w-4.5" />
              </span>
              Muhafiz
            </Link>
            <p className="mt-3 text-sm text-ink-muted max-w-xs">
              Automated image moderation for teams that need transparent, policy-driven enforcement.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink">Platform</h4>
            <ul className="mt-4 space-y-3 text-sm text-ink-muted">
              <li><a href="#features" className="hover:text-ink">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-ink">How it works</a></li>
              <li><a href="#policies" className="hover:text-ink">Policy categories</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink">Account</h4>
            <ul className="mt-4 space-y-3 text-sm text-ink-muted">
              <li><Link href="/login" className="hover:text-ink">Log in</Link></li>
              <li><Link href="/register" className="hover:text-ink">Create account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink">Trust</h4>
            <ul className="mt-4 space-y-3 text-sm text-ink-muted">
              <li>Policy snapshotting</li>
              <li>Transparent appeals</li>
              <li>Human-in-the-loop review</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-faint">© {new Date().getFullYear()} Muhafiz. Built for moderation teams.</p>
          <p className="text-xs text-ink-faint">Every verdict is explainable, every policy change is auditable.</p>
        </div>
      </div>
    </footer>
  );
}
