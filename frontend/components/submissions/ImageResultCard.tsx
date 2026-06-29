"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ImageOff,
  Calendar,
  Cpu,
  RotateCcw,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { ModeratedImage } from "@/types";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatFileSize, getImageUrl } from "@/lib/format";
import { CategoryBreakdownList } from "./CategoryBreakdownCard";
import { cn } from "@/lib/utils";

export function ImageResultCard({
  image,
  onAppeal,
  appealDisabled,
  appealLabel = "File appeal",
  onDelete,
  deleting = false,
  onOverride,
}: {
  image: ModeratedImage;
  onAppeal?: () => void;
  appealDisabled?: boolean;
  appealLabel?: string;
  onDelete?: () => void;
  deleting?: boolean;
  onOverride?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const canAppeal = image.verdict === "FLAGGED" || image.verdict === "BLOCKED";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-48 w-full shrink-0 bg-surface-muted sm:h-auto sm:w-48">
          {!imgError ? (
            <Image
              src={getImageUrl(image.filePath)}
              alt={image.fileName}
              fill
              sizes="192px"
              className="object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageOff className="h-7 w-7 text-ink-faint" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{image.fileName}</p>
              <p className="mt-0.5 text-xs text-ink-faint">
                {formatFileSize(image.sizeBytes)}
              </p>
            </div>

            <VerdictBadge verdict={image.verdict} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(image.createdAt)}
            </span>

            <span className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5" aria-hidden="true" />
              {image.provider}
            </span>

            {image.overridden && (
              <span className="flex items-center gap-1.5 font-medium text-amber-700">
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Manually overridden
              </span>
            )}
          </div>

          {image.overridden && image.overrideReason && (
            <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {image.overrideReason}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              className="inline-flex items-center gap-1.5 rounded-lg px-1 -mx-1 text-sm font-medium text-teal-700 hover:text-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              {expanded ? "Hide" : "View"} category breakdown
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  expanded && "rotate-180"
                )}
              />
            </button>

            {onAppeal && canAppeal && (
              <Button
                size="sm"
                variant="secondary"
                onClick={onAppeal}
                disabled={appealDisabled}
              >
                {appealLabel}
              </Button>
            )}

            {onOverride && (
              <Button size="sm" variant="secondary" onClick={onOverride}>
                <RotateCcw className="h-4 w-4" />
                Override
              </Button>
            )}

            {onDelete && (
              <Button
                size="sm"
                variant="outlineDanger"
                onClick={onDelete}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Deleting..." : "Delete image"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="animate-fade-in border-t border-border bg-surface-muted/40 p-5">
          <CategoryBreakdownList
            breakdown={image.categoryBreakdown}
            policySnapshot={image.policySnapshot}
          />
        </div>
      )}
    </div>
  );
}