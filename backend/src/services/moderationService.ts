import { getModerationProvider } from "../providers";
import { getPolicySnapshot } from "./policyService";
import {
  Verdict,
  EnforcementBehavior,
  CategoryBreakdown,
  PolicyCategorySnapshot,
} from "../types";

export interface ModerationOutcome {
  verdict: Verdict;
  categoryBreakdown: CategoryBreakdown[];
  policySnapshot: PolicyCategorySnapshot[];
  provider: string;
}

/**
 * Moderates a single image:
 * 1. Takes a fresh policy snapshot
 * 2. Calls active AI provider only for ENABLED categories
 * 3. Applies verdict logic:
 *    - disabled categories are skipped
 *    - violationDetected must be true
 *    - confidence below threshold does not contribute
 *    - violation + threshold + AUTO_BLOCK -> BLOCKED
 *    - violation + threshold + FLAG_FOR_REVIEW -> FLAGGED
 *    - BLOCKED takes priority over FLAGGED
 *    - no violation crossing threshold -> APPROVED
 */
export async function moderateImage(
  imageBuffer: Buffer,
  mimeType: string
): Promise<ModerationOutcome> {
  const policySnapshot = await getPolicySnapshot();
  const enabledPolicies = policySnapshot.filter((p) => p.enabled);

  const provider = getModerationProvider();
  const enabledCategories = enabledPolicies.map((p) => p.category);

  let providerResult = { results: [] as any[], provider: provider.name };

  if (enabledCategories.length > 0) {
    providerResult = await provider.moderateImage(
      imageBuffer,
      mimeType,
      enabledCategories
    );
  }

  const policyByCategory = new Map(enabledPolicies.map((p) => [p.category, p]));

  let hasAutoBlock = false;
  let hasFlag = false;

  const categoryBreakdown: CategoryBreakdown[] = providerResult.results.map((result) => {
    const policy = policyByCategory.get(result.category);

    if (!policy) {
      return {
        category: result.category,
        violationDetected: result.violationDetected,
        confidenceScore: result.confidenceScore,
        reasoning: result.reasoning || "No active policy found for this category.",
        thresholdUsed: 1,
        enforcementUsed: EnforcementBehavior.FLAG_FOR_REVIEW,
        contributedToVerdict: false,
      };
    }

    const crossedThreshold =
      result.violationDetected === true &&
      result.confidenceScore >= policy.confidenceThreshold;

    let contributedToVerdict = false;

    if (crossedThreshold) {
      contributedToVerdict = true;

      if (policy.enforcementBehavior === EnforcementBehavior.AUTO_BLOCK) {
        hasAutoBlock = true;
      }

      if (policy.enforcementBehavior === EnforcementBehavior.FLAG_FOR_REVIEW) {
        hasFlag = true;
      }
    }

    return {
      category: result.category,
      violationDetected: result.violationDetected,
      confidenceScore: result.confidenceScore,
      reasoning: result.reasoning,
      thresholdUsed: policy.confidenceThreshold,
      enforcementUsed: policy.enforcementBehavior,
      contributedToVerdict,
    };
  });

  let verdict: Verdict;

  if (hasAutoBlock) {
    verdict = Verdict.BLOCKED;
  } else if (hasFlag) {
    verdict = Verdict.FLAGGED;
  } else {
    verdict = Verdict.APPROVED;
  }

  return {
    verdict,
    categoryBreakdown,
    policySnapshot,
    provider: providerResult.provider,
  };
}