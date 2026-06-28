import { apiClient } from "./api";
import {
  AuthResponse,
  User,
  Policy,
  CreatePolicyInput,
  Submission,
  Pagination,
  Appeal,
  AnalyticsOverview,
  Verdict,
  ModerationCategory,
  AppealStatus,
} from "@/types";

// ---------- Auth ----------

export async function registerUser(name: string, email: string, password: string) {
  const res = await apiClient.post<{ success: true; data: AuthResponse }>("/api/auth/register", {
    name,
    email,
    password,
  });
  return res.data.data;
}

export async function loginUser(email: string, password: string) {
  const res = await apiClient.post<{ success: true; data: AuthResponse }>("/api/auth/login", {
    email,
    password,
  });
  return res.data.data;
}

export async function getMe() {
  const res = await apiClient.get<{ success: true; data: { user: User } }>("/api/auth/me");
  return res.data.data.user;
}

// ---------- Policies ----------

export async function getPolicies() {
  const res = await apiClient.get<{ success: true; data: { policies: Policy[] } }>("/api/policies");
  return res.data.data.policies;
}
export async function createPolicy(payload: CreatePolicyInput) {
  const res = await apiClient.post<{ success: true; data: { policy: Policy } }>(
    "/api/admin/policies",
    payload
  );

  return res.data.data.policy;
}
export async function updatePolicy(
  policyId: string,
  payload: Partial<Pick<Policy, "enabled" | "confidenceThreshold" | "enforcementBehavior">>
) {
  const res = await apiClient.patch<{ success: true; data: { policy: Policy } }>(
    `/api/admin/policies/${policyId}`,
    payload
  );
  return res.data.data.policy;
}

// ---------- Submissions ----------

export async function createSubmission(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const res = await apiClient.post<{ success: true; data: { submission: Submission } }>(
    "/api/submissions",
    formData
    // Note: do NOT manually set Content-Type — axios/browser sets the multipart boundary automatically
  );
  return res.data.data.submission;
}
export async function deleteSubmission(id: string) {
  const res = await apiClient.delete(`/api/submissions/${id}`);
  return res.data;
}
export async function deleteSubmissionImage(submissionId: string, imageId: string) {
  const res = await apiClient.delete(`/api/submissions/${submissionId}/images/${imageId}`);
  return res.data;
}
export interface SubmissionFilters {
  outcome?: Verdict;
  category?: ModerationCategory;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export async function getMySubmissions(filters: SubmissionFilters = {}) {
  const res = await apiClient.get<{
    success: true;
    data: { submissions: Submission[]; pagination: Pagination };
  }>("/api/submissions/my", { params: filters });
  return res.data.data;
}

export async function getSubmissionById(id: string) {
  const res = await apiClient.get<{ success: true; data: { submission: Submission } }>(
    `/api/submissions/${id}`
  );
  return res.data.data.submission;
}

// ---------- Appeals ----------

export async function createAppeal(submissionId: string, imageId: string, justification: string) {
  const res = await apiClient.post<{ success: true; data: { appeal: Appeal } }>("/api/appeals", {
    submissionId,
    imageId,
    justification,
  });
  return res.data.data.appeal;
}

export async function getMyAppeals() {
  const res = await apiClient.get<{ success: true; data: { appeals: Appeal[] } }>("/api/appeals/my");
  return res.data.data.appeals;
}

export async function getAllAppeals(status?: AppealStatus) {
  const res = await apiClient.get<{ success: true; data: { appeals: Appeal[] } }>(
    "/api/admin/appeals",
    { params: status ? { status } : {} }
  );
  return res.data.data.appeals;
}

export async function resolveAppeal(
  appealId: string,
  decision: "ACCEPTED" | "REJECTED",
  adminResponse?: string
) {
  const res = await apiClient.patch<{ success: true; data: { appeal: Appeal } }>(
    `/api/admin/appeals/${appealId}/resolve`,
    { decision, adminResponse }
  );
  return res.data.data.appeal;
}

// ---------- Admin Submissions ----------

export interface AdminSubmissionFilters extends SubmissionFilters {
  userId?: string;
}

export async function getAllSubmissions(filters: AdminSubmissionFilters = {}) {
  const res = await apiClient.get<{
    success: true;
    data: { submissions: Submission[]; pagination: Pagination };
  }>("/api/admin/submissions", { params: filters });
  return res.data.data;
}

export async function overrideSubmission(
  submissionId: string,
  imageId: string,
  verdict: Verdict,
  reason: string
) {
  const res = await apiClient.patch<{ success: true; data: { submission: Submission } }>(
    `/api/admin/submissions/${submissionId}/override`,
    { imageId, verdict, reason }
  );
  return res.data.data.submission;
}

// ---------- Analytics ----------

export async function getAnalyticsOverview() {
  const res = await apiClient.get<{ success: true; data: AnalyticsOverview }>(
    "/api/admin/analytics/overview"
  );
  return res.data.data;
}
