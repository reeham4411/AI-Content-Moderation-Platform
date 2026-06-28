import {
  ModerationCategoryKey,
  ProviderModerationResult,
  PolicyCategorySnapshot,
} from "../types";

// Any moderation provider (Gemini, Mock, Groq, AWS Rekognition, etc) must implement this.
// This is the seam that allows swapping AI backends without touching business logic.
export interface IModerationProvider {
  readonly name: string;

  /**
   * Analyze a single image and return a confidence + reasoning result
   * for each requested category. Implementations should return a result
   * for every category passed in `categories`, even if not violated.
   */
  moderateImage(
    imageBuffer: Buffer,
    mimeType: string,
    categories: ModerationCategoryKey[],
    policyDetails?: PolicyCategorySnapshot[]
  ): Promise<ProviderModerationResult>;
}