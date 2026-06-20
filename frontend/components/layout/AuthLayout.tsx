import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ReactNode } from "react";
import { AmbientBlobs } from "@/components/ui/AmbientBlobs";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas flex items-center justify-center px-4 py-12">
      <AmbientBlobs />
      <div className="relative w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5 font-display text-xl font-bold text-ink mb-8">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-soft">
            <ShieldCheck className="h-5 w-5" />
          </span>
          Muhafiz
        </Link>

        <div className="rounded-2xl border border-border bg-white/90 glass p-8 shadow-lifted">
          <h1 className="font-display text-2xl font-bold text-ink text-center">{title}</h1>
          <p className="mt-2 text-sm text-ink-muted text-center">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}
