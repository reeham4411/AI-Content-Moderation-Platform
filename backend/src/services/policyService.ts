import { Policy } from "../models/Policy";
import {
  ModerationCategory,
  EnforcementBehavior,
  PolicyCategorySnapshot,
  ModerationCategoryKey,
} from "../types";

const DEFAULT_POLICIES: Array<{
  category: ModerationCategory;
  displayName: string;
  description: string;
  enabled: boolean;
  confidenceThreshold: number;
  enforcementBehavior: EnforcementBehavior;
}> = [
  {
    category: ModerationCategory.GRAPHIC_VIOLENCE,
    displayName: "Graphic Violence",
    description: "Detect graphic violence, gore, blood, severe injury, or violent physical harm.",
    enabled: true,
    confidenceThreshold: 0.75,
    enforcementBehavior: EnforcementBehavior.AUTO_BLOCK,
  },
  {
    category: ModerationCategory.HATE_SYMBOLS,
    displayName: "Hate Symbols",
    description: "Detect hate symbols, extremist hate imagery, or symbols promoting hatred against protected groups.",
    enabled: true,
    confidenceThreshold: 0.7,
    enforcementBehavior: EnforcementBehavior.AUTO_BLOCK,
  },
  {
    category: ModerationCategory.SELF_HARM,
    displayName: "Self-Harm",
    description: "Detect self-harm, suicide-related imagery, or visual content encouraging self-injury.",
    enabled: true,
    confidenceThreshold: 0.6,
    enforcementBehavior: EnforcementBehavior.AUTO_BLOCK,
  },
  {
    category: ModerationCategory.EXTREMIST_PROPAGANDA,
    displayName: "Extremist Propaganda",
    description: "Detect extremist propaganda, terrorist imagery, recruitment material, or violent ideological promotion.",
    enabled: true,
    confidenceThreshold: 0.7,
    enforcementBehavior: EnforcementBehavior.AUTO_BLOCK,
  },
  {
    category: ModerationCategory.WEAPONS_CONTRABAND,
    displayName: "Weapons & Contraband",
    description: "Detect weapons, illegal contraband, firearm display, weapon trafficking, or dangerous restricted objects.",
    enabled: true,
    confidenceThreshold: 0.65,
    enforcementBehavior: EnforcementBehavior.FLAG_FOR_REVIEW,
  },
  {
    category: ModerationCategory.HARASSMENT_HUMILIATION,
    displayName: "Harassment & Humiliation",
    description: "Detect visual harassment, humiliation, bullying, intimidation, or degrading treatment of a person.",
    enabled: true,
    confidenceThreshold: 0.65,
    enforcementBehavior: EnforcementBehavior.FLAG_FOR_REVIEW,
  },
];

export async function seedDefaultPolicies(): Promise<void> {
  for (const def of DEFAULT_POLICIES) {
    const exists = await Policy.findOne({ category: def.category });

    if (!exists) {
      await Policy.create({
        ...def,
        isCustom: false,
      });

      console.log(`[policy-seed] created default policy for ${def.category}`);
    } else {
      // Keep existing behavior/settings, but backfill new fields if missing.
      let changed = false;

      if (!exists.displayName) {
        exists.displayName = def.displayName;
        changed = true;
      }

      if (!exists.description) {
        exists.description = def.description;
        changed = true;
      }

      if (exists.isCustom === undefined) {
        exists.isCustom = false;
        changed = true;
      }

      if (changed) {
        await exists.save();
      }
    }
  }
}

export async function getAllPolicies() {
  return Policy.find().sort({ isCustom: 1, category: 1 });
}

export async function getPolicyByCategory(category: ModerationCategoryKey) {
  return Policy.findOne({ category });
}

export async function getPolicySnapshot(): Promise<PolicyCategorySnapshot[]> {
  const policies = await Policy.find();

  return policies.map((p) => ({
    category: p.category,
    displayName: p.displayName,
    description: p.description,
    isCustom: p.isCustom,
    enabled: p.enabled,
    confidenceThreshold: p.confidenceThreshold,
    enforcementBehavior: p.enforcementBehavior,
  }));
}