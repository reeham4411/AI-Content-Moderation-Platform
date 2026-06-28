// Central type definitions and enums used across the backend

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum Verdict {
  APPROVED = "APPROVED",
  FLAGGED = "FLAGGED",
  BLOCKED = "BLOCKED",
}

export enum EnforcementBehavior {
  AUTO_BLOCK = "AUTO_BLOCK",
  FLAG_FOR_REVIEW = "FLAG_FOR_REVIEW",
}

export enum ModerationCategory {
  GRAPHIC_VIOLENCE = "GRAPHIC_VIOLENCE",
  HATE_SYMBOLS = "HATE_SYMBOLS",
  SELF_HARM = "SELF_HARM",
  EXTREMIST_PROPAGANDA = "EXTREMIST_PROPAGANDA",
  WEAPONS_CONTRABAND = "WEAPONS_CONTRABAND",
  HARASSMENT_HUMILIATION = "HARASSMENT_HUMILIATION",
}

// This keeps existing enum categories but also allows admin-created custom categories.
export type ModerationCategoryKey = ModerationCategory | string;

export enum AppealStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export interface CategoryProviderResult {
  category: ModerationCategoryKey;
  violationDetected: boolean;
  confidenceScore: number;
  reasoning: string;
}

export interface ProviderModerationResult {
  results: CategoryProviderResult[];
  provider: string;
}

export interface PolicyCategorySnapshot {
  category: ModerationCategoryKey;
  displayName?: string;
  description?: string;
  isCustom?: boolean;
  enabled: boolean;
  confidenceThreshold: number;
  enforcementBehavior: EnforcementBehavior;
}

export interface CategoryBreakdown {
  category: ModerationCategoryKey;
  violationDetected: boolean;
  confidenceScore: number;
  reasoning: string;
  thresholdUsed: number;
  enforcementUsed: EnforcementBehavior;
  contributedToVerdict: boolean;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
}