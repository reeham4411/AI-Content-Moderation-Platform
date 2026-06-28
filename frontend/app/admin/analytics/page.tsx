"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { DistributionBar } from "@/components/dashboard/DistributionBar";
import { TopUsersList } from "@/components/dashboard/TopUsersList";
import { getAnalyticsOverview } from "@/lib/services";
import { getErrorMessage } from "@/lib/api";
import { AnalyticsOverview, getCategoryLabel } from "@/types";

export default function AdminAnalyticsPage() {
  return (
    <ProtectedRoute>
      <RoleGuard role="ADMIN">
        <DashboardLayout>
          <AdminAnalyticsContent />
        </DashboardLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}

function AdminAnalyticsContent() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setData(await getAnalyticsOverview());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingState label="Loading analytics…" />;
  if (error) return <ErrorState description={error} onRetry={load} />;
  if (!data) return null;

  const verdictTotal = Object.values(data.verdictDistribution).reduce(
    (a, b) => a + b,
    0,
  );

  const categoryTotal = Object.values(
    data.categoryViolationDistribution,
  ).reduce((a, b) => a + b, 0);

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Platform-wide trends across verdicts, categories, and appeals."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Verdict distribution</CardTitle>
          </CardHeader>

          <CardContent>
            <DistributionBar
              total={verdictTotal}
              items={[
                {
                  label: "Approved",
                  value: data.verdictDistribution.APPROVED ?? 0,
                  colorClass: "bg-emerald-500",
                },
                {
                  label: "Flagged",
                  value: data.verdictDistribution.FLAGGED ?? 0,
                  colorClass: "bg-amber-500",
                },
                {
                  label: "Blocked",
                  value: data.verdictDistribution.BLOCKED ?? 0,
                  colorClass: "bg-coral-500",
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category violation distribution</CardTitle>
          </CardHeader>

          <CardContent>
            {categoryTotal === 0 ? (
              <p className="py-4 text-sm text-ink-faint">
                No category violations recorded yet.
              </p>
            ) : (
              <DistributionBar
                total={categoryTotal}
                items={Object.entries(data.categoryViolationDistribution).map(
                  ([category, value]) => ({
                    label: getCategoryLabel(category),
                    value,
                    colorClass: "bg-teal-600",
                  }),
                )}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <h2 className="mb-4 mt-10 font-display text-lg font-semibold text-ink">
        Appeal statistics
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label="Pending"
          value={data.appealStats.pending}
          icon={Clock}
          tone="slate"
        />

        <StatCard
          label="Accepted"
          value={data.appealStats.accepted}
          icon={CheckCircle2}
          tone="emerald"
        />

        <StatCard
          label="Rejected"
          value={data.appealStats.rejected}
          icon={XCircle}
          tone="coral"
        />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top users by submissions</CardTitle>
          </CardHeader>

          <CardContent>
            <TopUsersList
              users={data.topUsersBySubmissionCount}
              countLabel="submissions"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top users by violations</CardTitle>
          </CardHeader>

          <CardContent>
            <TopUsersList
              users={data.topUsersByViolationCount}
              countLabel="violations"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
