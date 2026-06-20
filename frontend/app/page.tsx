import Link from "next/link";
import {
  ShieldCheck, ArrowRight, PlayCircle, ScanEye, Layers, Gavel, BarChart3,
  UploadCloud, Cpu, FileCheck2, Flame, Skull, HeartCrack, Megaphone, Crosshair,
  MessageSquareWarning, Users, Settings2, LineChart, CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { AmbientBlobs } from "@/components/ui/AmbientBlobs";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { CATEGORY_LABELS, ALL_CATEGORIES } from "@/types";

const CATEGORY_ICONS = {
  GRAPHIC_VIOLENCE: Flame,
  HATE_SYMBOLS: Skull,
  SELF_HARM: HeartCrack,
  EXTREMIST_PROPAGANDA: Megaphone,
  WEAPONS_CONTRABAND: Crosshair,
  HARASSMENT_HUMILIATION: MessageSquareWarning,
} as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <AmbientBlobs />
        <div className="container relative py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            {/* <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-1.5 text-xs font-semibold text-teal-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Policy-driven image moderation
            </span> */}
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-ink text-balance sm:text-6xl">
              Moderation decisions your team can actually <span className="text-teal-600">explain</span>.
            </h1>
            <p className="mt-6 text-lg text-ink-muted text-balance max-w-2xl mx-auto">
              Muhafiz automates image moderation, reduces manual review workload, and keeps every
              policy decision transparent — from the confidence score to the appeal outcome.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/register">
                  Start moderating <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href="#how-it-works">
                  <PlayCircle className="h-4 w-4" />
                  View demo
                </a>
              </Button>
            </div>
          </div>

          {/* Verdict preview strip - signature element showing the platform's real output */}
          <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-border bg-white/80 glass p-2 shadow-lifted">
            <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
              {[
                { name: "product-listing-04.jpg", verdict: "APPROVED" as const, conf: "Reviewed in 1.2s" },
                { name: "user-upload-218.png", verdict: "FLAGGED" as const, conf: "Weapons & Contraband · 71%" },
                { name: "forum-post-img.jpg", verdict: "BLOCKED" as const, conf: "Graphic Violence · 94%" },
              ].map((row) => (
                <div key={row.name} className="flex flex-col gap-2 p-5">
                  <span className="truncate font-mono text-xs text-ink-faint">{row.name}</span>
                  <VerdictBadge verdict={row.verdict} size="sm" />
                  <span className="text-xs text-ink-muted">{row.conf}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-border">
        <div className="container">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold text-ink text-balance">
              Built for teams that enforce policy at scale
            </h2>
            <p className="mt-4 text-ink-muted">
              Every feature exists to make moderation faster for your team and fairer for your users.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={ScanEye}
              title="Six-category detection"
              description="Every image is checked against graphic violence, hate symbols, self-harm, extremist propaganda, weapons, and harassment — with a confidence score per category."
            />
            <FeatureCard
              icon={Layers}
              title="Configurable enforcement"
              description="Admins set thresholds and choose between auto-block or flag-for-review, per category. Changes only ever apply going forward."
            />
            <FeatureCard
              icon={FileCheck2}
              title="Policy snapshotting"
              description="Every verdict stores the exact policy configuration used at the time. Past decisions never silently change when policy is updated."
            />
            <FeatureCard
              icon={Gavel}
              title="Transparent appeals"
              description="Users can appeal flagged or blocked images with a written justification. Admins respond and can override the verdict directly."
            />
            <FeatureCard
              icon={Users}
              title="Human-in-the-loop oversight"
              description="Admins can review any submission, override any verdict, and see exactly why the system made its original decision."
            />
            <FeatureCard
              icon={BarChart3}
              title="Operational analytics"
              description="Track verdict distribution, category violation trends, appeal resolution rates, and the users driving the most activity."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 border-t border-border bg-surface">
        <div className="container">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold text-ink text-balance">How it works</h2>
            <p className="mt-4 text-ink-muted">From upload to verdict in a few transparent steps.</p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-4">
            {[
              { icon: UploadCloud, title: "Upload", body: "Submit one or more images through the dashboard. Drag, drop, and go." },
              { icon: Cpu, title: "Analyze", body: "Each image is scored against every enabled category by the active AI provider." },
              { icon: ShieldCheck, title: "Decide", body: "Policy thresholds and enforcement rules determine an Approved, Flagged, or Blocked verdict." },
              { icon: Gavel, title: "Appeal", body: "Users can contest the outcome. Admins review, respond, and override if needed." },
            ].map((step, i) => (
              <div key={step.title} className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white shadow-glow">
                  <step.icon className="h-5.5 w-5.5" />
                </div>
                <h3 className="mt-5 font-display font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Policy categories */}
      <section id="policies" className="py-24 border-t border-border">
        <div className="container">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold text-ink text-balance">Six moderation categories</h2>
            <p className="mt-4 text-ink-muted">
              Every category is independently configurable — enable or disable it, set its confidence
              threshold, and choose how violations are enforced.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat];
              return (
                <div key={cat} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-coral-50 text-coral-600">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="font-medium text-ink">{CATEGORY_LABELS[cat]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Appeal workflow */}
      <section id="appeals" className="py-24 border-t border-border bg-surface">
        <div className="container grid grid-cols-1 gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold text-ink text-balance">
              Every verdict can be questioned
            </h2>
            <p className="mt-4 text-ink-muted leading-relaxed">
              Automated systems are not infallible. When an image is flagged or blocked, the affected
              user can submit a written appeal. Admins review the original evidence alongside the
              user&apos;s justification, then accept or reject — with accepted appeals automatically
              restoring the verdict to Approved.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Appeals require a clear, written justification",
                "Admins respond with their own written reasoning",
                "Accepted appeals override the verdict immediately",
                "Full appeal history stays attached to the submission",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink-muted">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-white p-7 shadow-lifted">
            <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide">Appeal record</p>
            <div className="mt-4 rounded-xl bg-surface-muted p-4">
              <p className="text-sm text-ink">
                &ldquo;This product photo includes a kitchen knife used for a recipe listing, not a
                weapon — please review.&rdquo;
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-ink-faint">Admin response</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Accepted
              </span>
            </div>
            <div className="mt-2 rounded-xl bg-emerald-50 p-4 border border-emerald-100">
              <p className="text-sm text-emerald-800">
                &ldquo;Confirmed false positive — context is clearly a cooking tool. Verdict overridden
                to Approved.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Admin oversight */}
      <section className="py-24 border-t border-border">
        <div className="container">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold text-ink text-balance">Full administrative oversight</h2>
            <p className="mt-4 text-ink-muted">
              Admins keep complete control over policy, enforcement, and outcomes — nothing happens
              in a black box.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={Settings2} title="Policy configuration" description="Tune thresholds and enforcement per category, with built-in policy snapshotting safeguards." />
            <FeatureCard icon={Users} title="Submission review" description="Browse every submission across the platform, filter by verdict, category, date, or user." />
            <FeatureCard icon={Gavel} title="Appeal resolution" description="Work a clean queue of pending appeals with full context for every decision." />
            <FeatureCard icon={LineChart} title="Live analytics" description="Verdict distribution, category trends, and top users — always current." />
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden border-t border-border py-24">
        <AmbientBlobs />
        <div className="container relative text-center">
          <h2 className="font-display text-3xl font-bold text-ink text-balance sm:text-4xl">
            Ready to bring transparency to your moderation queue?
          </h2>
          <p className="mt-4 text-ink-muted max-w-xl mx-auto">
            Create an account and submit your first image in under a minute.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/register">
                Start moderating <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
