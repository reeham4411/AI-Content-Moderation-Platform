"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, X } from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState, Alert } from "@/components/ui/ErrorState";
import { SkeletonCard } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PolicyCard } from "@/components/admin/PolicyCard";
import { getPolicies, updatePolicy, createPolicy } from "@/lib/services";
import { getErrorMessage } from "@/lib/api";
import { Policy, EnforcementBehavior, CreatePolicyInput } from "@/types";

export default function AdminPoliciesPage() {
  return (
    <ProtectedRoute>
      <RoleGuard role="ADMIN">
        <DashboardLayout>
          <AdminPoliciesContent />
        </DashboardLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}

function AdminPoliciesContent() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setPolicies(await getPolicies());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (
    policyId: string,
    updates: {
      enabled: boolean;
      confidenceThreshold: number;
      enforcementBehavior: string;
    },
  ) => {
    const updated = await updatePolicy(policyId, updates as Partial<Policy>);
    setPolicies((prev) => prev.map((p) => (p._id === policyId ? updated : p)));
  };

  const handleCreatePolicy = async (payload: CreatePolicyInput) => {
    setCreating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const created = await createPolicy(payload);
      setPolicies((prev) => [...prev, created]);
      setCreateModalOpen(false);
      setSuccessMsg(
        "New policy created successfully. It will apply to future submissions.",
      );
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Moderation policies"
        description="Configure detection thresholds and enforcement behavior for each category."
        actions={
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add new policy
          </Button>
        }
      />

      <div className="mb-6">
        <Alert tone="info">
          <span className="font-medium">
            Changes only affect future submissions.
          </span>{" "}
          Every moderated image stores a snapshot of the policy configuration
          active at the time it was reviewed — updating a policy here will never
          alter the verdict of an existing submission.
        </Alert>
      </div>

      {successMsg && (
        <div className="mb-6">
          <Alert tone="success">{successMsg}</Alert>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {policies.map((policy) => (
            <PolicyCard
              key={policy._id}
              policy={policy}
              onSave={(updates) => handleSave(policy._id, updates)}
            />
          ))}
        </div>
      )}

      <CreatePolicyModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        loading={creating}
        onSubmit={handleCreatePolicy}
      />
    </div>
  );
}

function CreatePolicyModal({
  open,
  onOpenChange,
  loading,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  onSubmit: (payload: CreatePolicyInput) => Promise<void>;
}) {
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [confidenceThreshold, setConfidenceThreshold] = useState("0.7");
  const [enforcementBehavior, setEnforcementBehavior] =
    useState<EnforcementBehavior>("FLAG_FOR_REVIEW");
  const [enabled, setEnabled] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  if (!open) return null;

  const resetForm = () => {
    setDisplayName("");
    setDescription("");
    setConfidenceThreshold("0.7");
    setEnforcementBehavior("FLAG_FOR_REVIEW");
    setEnabled(true);
    setFormError(null);
  };

  const close = () => {
    if (loading) return;
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    setFormError(null);

    const threshold = Number(confidenceThreshold);

    if (!displayName.trim()) {
      setFormError("Policy name is required.");
      return;
    }

    if (!description.trim() || description.trim().length < 15) {
      setFormError(
        "Description must clearly explain what this policy should detect.",
      );
      return;
    }

    if (Number.isNaN(threshold) || threshold < 0 || threshold > 1) {
      setFormError("Confidence threshold must be between 0 and 1.");
      return;
    }

    await onSubmit({
      displayName: displayName.trim(),
      description: description.trim(),
      confidenceThreshold: threshold,
      enforcementBehavior,
      enabled,
    });

    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-border bg-surface p-6 shadow-card animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Add new policy</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Create a custom moderation category. Gemini will use the
              description to understand what this policy should detect.
            </p>
          </div>

          <button
            type="button"
            onClick={close}
            disabled={loading}
            className="rounded-lg p-1 text-ink-faint transition hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:pointer-events-none disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {formError && (
          <div className="mt-5">
            <Alert tone="error">{formError}</Alert>
          </div>
        )}

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="policy-name">Policy name</Label>
            <Input
              id="policy-name"
              placeholder="Example: Dangerous Drugs"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="policy-description">Description</Label>
            <textarea
              id="policy-description"
              placeholder="Example: Detect illegal drugs, drug use, drug selling, drug packaging, or drug paraphernalia in images."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={4}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink shadow-sm outline-none transition placeholder:text-ink-faint focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="policy-threshold">Confidence threshold</Label>
              <Input
                id="policy-threshold"
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(e.target.value)}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-ink-faint">
                Use a value between 0 and 1. Example: 0.7 means 70%.
              </p>
            </div>

            <div>
              <Label htmlFor="policy-enforcement">Enforcement</Label>
              <Select
                ariaLabel="Select enforcement behavior"
                value={enforcementBehavior}
                onValueChange={(value) =>
                  setEnforcementBehavior(value as EnforcementBehavior)
                }
                options={[
                  { value: "FLAG_FOR_REVIEW", label: "Flag for review" },
                  { value: "AUTO_BLOCK", label: "Auto-block" },
                ]}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-surface-muted/40 px-4 py-3">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 rounded border-border text-teal-600 focus:ring-teal-600"
            />
            <span>
              <span className="block text-sm font-medium text-ink">
                Enable policy immediately
              </span>
              <span className="block text-xs text-ink-muted">
                If enabled, this policy will be included in future image
                moderation.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={close}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button type="button" onClick={handleSubmit} disabled={loading}>
            <Plus className="h-4 w-4" />
            {loading ? "Creating..." : "Create policy"}
          </Button>
        </div>
      </div>
    </div>
  );
}
