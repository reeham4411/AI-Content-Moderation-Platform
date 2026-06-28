"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle2, MinusCircle } from "lucide-react";
import {
  CategoryBreakdown,
  PolicyCategorySnapshot,
  getCategoryLabel,
} from "@/types";
import { formatConfidence } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CategoryBreakdownList({
  breakdown,
  policySnapshot = [],
}: {
  breakdown: CategoryBreakdown[];
  policySnapshot?: PolicyCategorySnapshot[];
}) {
  if (breakdown.length === 0) {
    return (
      <p className="text-sm text-ink-faint italic">
        No categories were evaluated because all categories were disabled at
        moderation time.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {breakdown.map((item) => {
        const matchedPolicy = policySnapshot.find(
          (policy) => policy.category === item.category,
        );

        const categoryLabel = getCategoryLabel(
          item.category,
          matchedPolicy?.displayName,
        );

        return (
          <CategoryBreakdownRow
            key={item.category}
            item={item}
            categoryLabel={categoryLabel}
            policyDescription={matchedPolicy?.description}
            isCustom={matchedPolicy?.isCustom}
          />
        );
      })}
    </div>
  );
}

function CategoryBreakdownRow({
  item,
  categoryLabel,
  policyDescription,
  isCustom,
}: {
  item: CategoryBreakdown;
  categoryLabel: string;
  policyDescription?: string;
  isCustom?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-xl border transition-colors",
        item.contributedToVerdict
          ? "border-coral-100 bg-coral-50/40"
          : "border-border bg-white",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
      >
        <div className="flex min-w-0 items-center gap-3">
          {item.contributedToVerdict ? (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coral-100 text-coral-700">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          ) : (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <MinusCircle className="h-4 w-4" />
            </span>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-ink">
                {categoryLabel}
              </p>

              {isCustom && (
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700">
                  Custom
                </span>
              )}
            </div>

            <p className="text-xs text-ink-faint">
              {item.contributedToVerdict
                ? "Contributed to verdict"
                : "Below threshold"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="font-mono text-sm font-semibold text-ink">
            {formatConfidence(item.confidenceScore)}
          </span>

          <ChevronDown
            className={cn(
              "h-4 w-4 text-ink-faint transition-transform",
              open && "rotate-180",
            )}
          />
        </div>
      </button>

      {open && (
        <div className="animate-fade-in space-y-2.5 border-t border-border/60 px-4 py-3.5 text-sm">
          {policyDescription && (
            <div className="rounded-lg border border-border bg-surface-muted/50 px-3 py-2">
              <p className="text-xs font-medium text-ink">Policy description</p>
              <p className="mt-1 text-xs leading-5 text-ink-muted">
                {policyDescription}
              </p>
            </div>
          )}

          <p className="text-ink-muted">{item.reasoning}</p>

          <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
            <Detail
              label="Violation"
              value={item.violationDetected ? "Detected" : "Not detected"}
            />
            <Detail
              label="Threshold"
              value={formatConfidence(item.thresholdUsed)}
            />
            <Detail
              label="Enforcement"
              value={
                item.enforcementUsed === "AUTO_BLOCK"
                  ? "Auto-block"
                  : "Flag for review"
              }
            />
            <Detail
              label="Confidence"
              value={formatConfidence(item.confidenceScore)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="mt-0.5 font-mono text-xs font-medium text-ink">{value}</p>
    </div>
  );
}
