

export type UserRole = "USER" | "ADMIN";

export type Verdict = "APPROVED" | "FLAGGED" | "BLOCKED";

export type EnforcementBehavior = "AUTO_BLOCK" | "FLAG_FOR_REVIEW";

export type DefaultModerationCategory =
  | "GRAPHIC_VIOLENCE"
  | "HATE_SYMBOLS"
  | "SELF_HARM"
  | "EXTREMIST_PROPAGANDA"
  | "WEAPONS_CONTRABAND"
  | "HARASSMENT_HUMILIATION";

// Allows both default categories and admin-created custom policies
export type ModerationCategory = DefaultModerationCategory | string;

export type AppealStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PolicyCategorySnapshot {
  category: ModerationCategory;
  displayName?: string;
  description?: string;
  isCustom?: boolean;
  enabled: boolean;
  confidenceThreshold: number;
  enforcementBehavior: EnforcementBehavior;
}

export interface Policy extends PolicyCategorySnapshot {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePolicyInput {
  displayName: string;
  description: string;
  enabled: boolean;
  confidenceThreshold: number;
  enforcementBehavior: EnforcementBehavior;
}

export interface CategoryBreakdown {
  category: ModerationCategory;
  violationDetected: boolean;
  confidenceScore: number;
  reasoning: string;
  thresholdUsed: number;
  enforcementUsed: EnforcementBehavior;
  contributedToVerdict: boolean;
}

export interface ModeratedImage {
  _id: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  verdict: Verdict;
  categoryBreakdown: CategoryBreakdown[];
  policySnapshot: PolicyCategorySnapshot[];
  provider: string;
  overridden: boolean;
  overriddenBy?: string;
  overrideReason?: string;
  createdAt: string;
}

export interface Submission {
  _id: string;
  user: string | User;
  images: ModeratedImage[];
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Appeal {
  _id: string;
  user: string | User;
  submission: string;
  imageId: string;
  justification: string;
  status: AppealStatus;
  adminResponse?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsOverview {
  totalSubmissions: number;
  totalImages: number;
  verdictDistribution: Record<string, number>;
  categoryViolationDistribution: Record<string, number>;
  appealStats: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  topUsersBySubmissionCount: Array<{ userId: string; name: string; email: string; count: number }>;
  topUsersByViolationCount: Array<{ userId: string; name: string; email: string; count: number }>;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
}

export const CATEGORY_LABELS: Record<DefaultModerationCategory, string> = {
  GRAPHIC_VIOLENCE: "Graphic Violence",
  HATE_SYMBOLS: "Hate Symbols",
  SELF_HARM: "Self-Harm",
  EXTREMIST_PROPAGANDA: "Extremist Propaganda",
  WEAPONS_CONTRABAND: "Weapons & Contraband",
  HARASSMENT_HUMILIATION: "Harassment & Humiliation",
};

export function getCategoryLabel(category: ModerationCategory, displayName?: string) {
  if (displayName) return displayName;

  const knownLabel = CATEGORY_LABELS[category as DefaultModerationCategory];
  if (knownLabel) return knownLabel;

  return category
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const ALL_CATEGORIES: DefaultModerationCategory[] = [
  "GRAPHIC_VIOLENCE",
  "HATE_SYMBOLS",
  "SELF_HARM",
  "EXTREMIST_PROPAGANDA",
  "WEAPONS_CONTRABAND",
  "HARASSMENT_HUMILIATION",
];