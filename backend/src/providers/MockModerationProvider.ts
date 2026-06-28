import crypto from "crypto";
import { IModerationProvider } from "./IModerationProvider";
import {
  ModerationCategoryKey,
  ProviderModerationResult,
  CategoryProviderResult,
  PolicyCategorySnapshot,
} from "../types";

/**
 * Deterministic mock provider. Used automatically when GEMINI_API_KEY is missing,
 * so the whole backend remains runnable/testable without any external AI key.
 *
 * Determinism approach: derive a pseudo-confidence score per (image hash, category)
 * pair using a hash function. Same image -> same result every time, which makes
 * the verdict logic testable and predictable in demos.
 */
export class MockModerationProvider implements IModerationProvider {
  public readonly name = "mock-provider";

  async moderateImage(
    imageBuffer: Buffer,
    _mimeType: string,
    categories: ModerationCategoryKey[],
    _policyDetails?: PolicyCategorySnapshot[]
  ): Promise<ProviderModerationResult> {
    const imageHash = crypto
      .createHash("sha256")
      .update(imageBuffer)
      .digest("hex");

    const results: CategoryProviderResult[] = categories.map((category) => {
      const categoryText = String(category);
      const seed = `${imageHash}:${categoryText}`;
      const hash = crypto.createHash("md5").update(seed).digest("hex");

      // take first 8 hex chars -> integer -> normalize to 0..1
      const intVal = parseInt(hash.slice(0, 8), 16);
      const confidenceScore = Number((intVal / 0xffffffff).toFixed(4));
      const violationDetected = confidenceScore >= 0.5;

      return {
        category,
        violationDetected,
        confidenceScore,
        reasoning: violationDetected
          ? `Mock provider deterministically flagged potential ${categoryText
              .replace(/_/g, " ")
              .toLowerCase()} signal based on image hash heuristic.`
          : `Mock provider found no significant ${categoryText
              .replace(/_/g, " ")
              .toLowerCase()} signal.`,
      };
    });

    return { results, provider: this.name };
  }
}