"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState, Alert } from "@/components/ui/ErrorState";
import { ImageResultCard } from "@/components/submissions/ImageResultCard";
import { FileAppealModal } from "@/components/upload/FileAppealModal";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import { OverrideModal } from "@/components/admin/AdminActionModal";
import { useAuth } from "@/lib/auth";
import {
  getSubmissionById,
  createAppeal,
  deleteSubmission,
  deleteSubmissionImage,
  getMyAppeals,
  overrideSubmission,
} from "@/lib/services";
import { getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { downloadSubmissionReport } from "@/lib/report";
import { Submission, ModeratedImage, Verdict } from "@/types";

export default function SubmissionDetailPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <SubmissionDetailContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function SubmissionDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [deleteSubmissionModalOpen, setDeleteSubmissionModalOpen] =
    useState(false);

  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [imageDeleteTarget, setImageDeleteTarget] =
    useState<ModeratedImage | null>(null);

  const [appealTarget, setAppealTarget] = useState<ModeratedImage | null>(null);
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [appealedIds, setAppealedIds] = useState<Set<string>>(new Set());

  const [overrideTarget, setOverrideTarget] = useState<ModeratedImage | null>(
    null,
  );
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const sub = await getSubmissionById(id);
      setSubmission(sub);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadAppeals = useCallback(async () => {
    if (isAdmin) return;

    try {
      const appeals = await getMyAppeals();

      const appealedImageIds = appeals
        .filter((appeal) => appeal.submission === id)
        .map((appeal) => appeal.imageId);

      setAppealedIds(new Set(appealedImageIds));
    } catch (err) {
      console.error("Failed to load appeals", err);
    }
  }, [id, isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadAppeals();
  }, [loadAppeals]);

  const handleDeleteSubmission = async () => {
    if (!submission) return;

    setDeleting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await deleteSubmission(submission._id);
      setDeleteSubmissionModalOpen(false);
      router.push("/submissions");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!submission || !imageDeleteTarget) return;

    setDeletingImageId(imageDeleteTarget._id);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await deleteSubmissionImage(
        submission._id,
        imageDeleteTarget._id,
      );

      if (res.data?.submissionDeleted) {
        setImageDeleteTarget(null);
        router.push("/submissions");
        return;
      }

      setSubmission((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          images: prev.images.filter(
            (img) => img._id !== imageDeleteTarget._id,
          ),
        };
      });

      setSuccessMsg("Image deleted successfully.");
      setTimeout(() => setSuccessMsg(null), 4000);
      setImageDeleteTarget(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleAppealRequest = (image: ModeratedImage) => {
    setAppealTarget(image);
    setAppealModalOpen(true);
  };

  const handleAppealSubmit = async (justification: string) => {
    if (!submission || !appealTarget) return;

    await createAppeal(submission._id, appealTarget._id, justification);

    setAppealedIds((prev) => new Set(prev).add(appealTarget._id));
    setSuccessMsg(
      "Appeal submitted successfully. You can track its status on the My Appeals page.",
    );
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleOverrideSubmit = async (verdict: Verdict, reason: string) => {
    if (!submission || !overrideTarget) return;

    const updatedSubmission = await overrideSubmission(
      submission._id,
      overrideTarget._id,
      verdict,
      reason,
    );

    setSubmission(updatedSubmission);
    setSuccessMsg(
      `Verdict updated to ${verdict} for "${overrideTarget.fileName}".`,
    );
    setTimeout(() => setSuccessMsg(null), 4000);

    setOverrideModalOpen(false);
    setOverrideTarget(null);
  };

  if (loading) return <LoadingState label="Loading submission…" />;
  if (error) return <ErrorState description={error} onRetry={load} />;
  if (!submission) return null;

  return (
    <div>
      <button
        onClick={() =>
          router.push(isAdmin ? "/admin/submissions" : "/submissions")
        }
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded px-1"
      >
        <ArrowLeft className="h-4 w-4" />
        {isAdmin ? "Back to all submissions" : "Back to submission history"}
      </button>

      <PageHeader
        title="Submission details"
        description={`Submitted ${formatDate(submission.createdAt)} · ${
          submission.images.length
        } ${submission.images.length === 1 ? "image" : "images"}`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => downloadSubmissionReport(submission)}
            >
              <Download className="h-4 w-4" />
              Download report
            </Button>

            {!isAdmin && (
              <Button
                variant="outlineDanger"
                onClick={() => setDeleteSubmissionModalOpen(true)}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Deleting..." : "Delete submission"}
              </Button>
            )}
          </div>
        }
      />

      {successMsg && (
        <div className="mb-6">
          <Alert tone="success">{successMsg}</Alert>
        </div>
      )}

      <div className="space-y-4">
        {submission.images.map((image) => (
          <ImageResultCard
            key={image._id}
            image={image}
            onAppeal={!isAdmin ? () => handleAppealRequest(image) : undefined}
            appealDisabled={appealedIds.has(image._id)}
            appealLabel={
              appealedIds.has(image._id) ? "Appeal pending" : "File appeal"
            }
            onOverride={
              isAdmin
                ? () => {
                    setOverrideTarget(image);
                    setOverrideModalOpen(true);
                  }
                : undefined
            }
           onDelete={!isAdmin ? () => setImageDeleteTarget(image) : undefined}
            deleting={deletingImageId === image._id}
          />
        ))}
      </div>

      <DeleteConfirmModal
        open={!!imageDeleteTarget}
        onOpenChange={(open) => {
          if (!open) setImageDeleteTarget(null);
        }}
        title={
          submission.images.length === 1
            ? "Delete last image?"
            : "Delete this image?"
        }
        description={
          submission.images.length === 1
            ? "This is the last image in this submission. Deleting it will remove the entire submission."
            : `This will permanently delete "${imageDeleteTarget?.fileName}" from this submission. Other images will be kept.`
        }
        confirmLabel={
          submission.images.length === 1 ? "Delete submission" : "Delete image"
        }
        loading={!!deletingImageId}
        onConfirm={handleDeleteImage}
      />

      <DeleteConfirmModal
        open={deleteSubmissionModalOpen}
        onOpenChange={setDeleteSubmissionModalOpen}
        title="Delete entire submission?"
        description={`This will permanently delete this submission and all ${
          submission.images.length
        } ${submission.images.length === 1 ? "image" : "images"} inside it.`}
        confirmLabel="Delete submission"
        loading={deleting}
        onConfirm={handleDeleteSubmission}
      />

      <FileAppealModal
        open={appealModalOpen}
        onOpenChange={setAppealModalOpen}
        image={appealTarget}
        onSubmit={handleAppealSubmit}
      />

      <OverrideModal
        open={overrideModalOpen}
        onOpenChange={setOverrideModalOpen}
        image={overrideTarget}
        onSubmit={handleOverrideSubmit}
      />
    </div>
  );
}
