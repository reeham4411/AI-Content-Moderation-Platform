"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ImageIcon, ExternalLink } from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState, Alert } from "@/components/ui/ErrorState";
import { SkeletonRow } from "@/components/ui/LoadingState";
import {
  SubmissionFilters,
  FilterState,
} from "@/components/submissions/SubmissionFilters";
import { Pagination } from "@/components/ui/Pagination";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { Button } from "@/components/ui/Button";
import { getAllSubmissions } from "@/lib/services";
import { getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Submission, Pagination as PaginationType, User } from "@/types";

export default function AdminSubmissionsPage() {
  return (
    <ProtectedRoute>
      <RoleGuard role="ADMIN">
        <DashboardLayout>
          <AdminSubmissionsContent />
        </DashboardLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}

function userLabel(user: string | User): string {
  if (typeof user === "string") return user;
  return user.name || user.email || "Unknown user";
}

function getSubmissionId(submission: Submission): string {
  return submission._id || (submission as any).id || "";
}

function AdminSubmissionsContent() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<FilterState>({
    outcome: "ALL",
    category: "ALL",
    from: "",
    to: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getAllSubmissions({
        outcome: filters.outcome === "ALL" ? undefined : filters.outcome,
        category: filters.category === "ALL" ? undefined : filters.category,
        from: filters.from || undefined,
        to: filters.to || undefined,
        page,
        limit: 10,
      });

      setSubmissions(res.submissions);
      setPagination(res.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFiltersChange = (next: FilterState) => {
    setFilters(next);
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="All submissions"
        description="Review submitted images and inspect category-level moderation decisions."
      />

      {successMsg && (
        <div className="mb-6">
          <Alert tone="success">{successMsg}</Alert>
        </div>
      )}

      <div className="mb-6">
        <SubmissionFilters filters={filters} onChange={handleFiltersChange} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No submissions found"
          description="Try adjusting your filters."
        />
      ) : (
        <div className="space-y-5">
          {submissions.map((submission) => {
            const submissionId = getSubmissionId(submission);

            return (
              <div
                key={submissionId || Math.random()}
                className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-muted/50 px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {userLabel(submission.user)}
                    </p>

                    <p className="mt-0.5 text-xs text-ink-faint">
                      {submissionId
                        ? `Submission ID: ${submissionId}`
                        : "Submission ID unavailable"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-ink-faint">
                      {formatDate(submission.createdAt)}
                    </span>

                    {/* {submissionId && (
                      <Button asChild size="sm" variant="secondary">
                        <Link href={`/submissions/${submissionId}`}>
                          <ExternalLink className="h-4 w-4" />
                          View full details
                        </Link>
                      </Button>
                    )} */}
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {submission.images.map((image) => {
                    const contributingCategories =
                      image.categoryBreakdown.filter(
                        (category) => category.contributedToVerdict,
                      );

                    return (
                      <div
                        key={image._id}
                        className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          {submissionId ? (
                            <Link
                              href={`/submissions/${submissionId}`}
                              className="truncate text-sm font-semibold text-ink hover:text-teal-700 hover:underline"
                            >
                              {image.fileName}
                            </Link>
                          ) : (
                            <p className="truncate text-sm font-semibold text-ink">
                              {image.fileName}
                            </p>
                          )}

                          <p className="mt-0.5 text-xs text-ink-faint">
                            {image.provider}
                            {image.overridden && " · Manually overridden"}
                          </p>

                          {contributingCategories.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {contributingCategories.map((category) => (
                                <CategoryBadge
                                  key={category.category}
                                  category={category.category}
                                  active
                                />
                              ))}
                            </div>
                          ) : (
                            <p className="mt-2 text-xs text-ink-faint">
                              No category contributed to the verdict.
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-3">
                          <VerdictBadge verdict={image.verdict} size="sm" />

                          {submissionId && (
                            <Button asChild size="sm" variant="secondary">
                              <Link href={`/submissions/${submissionId}`}>
                                View details
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination && (
        <div className="mt-6">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
