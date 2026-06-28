import { Request, Response } from "express";
import { Policy } from "../models/Policy";
import { asyncHandler } from "../utils/asyncHandler";
import { NotFoundError, BadRequestError } from "../utils/errors";
import { getAllPolicies } from "../services/policyService";
import { EnforcementBehavior } from "../types";

function normalizeCategoryKey(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export const listPolicies = asyncHandler(async (_req: Request, res: Response) => {
  const policies = await getAllPolicies();
  res.json({ success: true, data: { policies } });
});

export const createPolicy = asyncHandler(async (req: Request, res: Response) => {
  const {
    category,
    displayName,
    description,
    enabled = true,
    confidenceThreshold = 0.7,
    enforcementBehavior = EnforcementBehavior.FLAG_FOR_REVIEW,
  } = req.body;

  if (!displayName || typeof displayName !== "string") {
    throw new BadRequestError("displayName is required");
  }

  if (!description || typeof description !== "string") {
    throw new BadRequestError("description is required");
  }

  if (description.trim().length < 15) {
    throw new BadRequestError("description must clearly explain what this policy should detect");
  }

  const categoryKey = category
    ? normalizeCategoryKey(String(category))
    : normalizeCategoryKey(displayName);

  if (!categoryKey) {
    throw new BadRequestError("Valid category or displayName is required");
  }

  if (typeof confidenceThreshold !== "number" || confidenceThreshold < 0 || confidenceThreshold > 1) {
    throw new BadRequestError("confidenceThreshold must be a number between 0 and 1");
  }

  if (typeof enabled !== "boolean") {
    throw new BadRequestError("enabled must be a boolean");
  }

  if (!Object.values(EnforcementBehavior).includes(enforcementBehavior)) {
    throw new BadRequestError(
      `enforcementBehavior must be one of: ${Object.values(EnforcementBehavior).join(", ")}`
    );
  }

  const exists = await Policy.findOne({ category: categoryKey });

  if (exists) {
    throw new BadRequestError("A policy with this category already exists");
  }

  const policy = await Policy.create({
    category: categoryKey,
    displayName: displayName.trim(),
    description: description.trim(),
    isCustom: true,
    enabled,
    confidenceThreshold,
    enforcementBehavior,
  });

  res.status(201).json({ success: true, data: { policy } });
});

export const updatePolicy = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    enabled,
    confidenceThreshold,
    enforcementBehavior,
    displayName,
    description,
  } = req.body;

  const policy = await Policy.findById(id);

  if (!policy) {
    throw new NotFoundError("Policy not found");
  }

  if (confidenceThreshold !== undefined) {
    if (typeof confidenceThreshold !== "number" || confidenceThreshold < 0 || confidenceThreshold > 1) {
      throw new BadRequestError("confidenceThreshold must be a number between 0 and 1");
    }

    policy.confidenceThreshold = confidenceThreshold;
  }

  if (enabled !== undefined) {
    if (typeof enabled !== "boolean") {
      throw new BadRequestError("enabled must be a boolean");
    }

    policy.enabled = enabled;
  }

  if (enforcementBehavior !== undefined) {
    if (!Object.values(EnforcementBehavior).includes(enforcementBehavior)) {
      throw new BadRequestError(
        `enforcementBehavior must be one of: ${Object.values(EnforcementBehavior).join(", ")}`
      );
    }

    policy.enforcementBehavior = enforcementBehavior;
  }

  // Allow name/description edits only for custom policies.
  // Default system categories stay stable.
  if (displayName !== undefined) {
    if (!policy.isCustom) {
      throw new BadRequestError("Default policy names cannot be edited");
    }

    if (typeof displayName !== "string" || !displayName.trim()) {
      throw new BadRequestError("displayName must be a non-empty string");
    }

    policy.displayName = displayName.trim();
  }

  if (description !== undefined) {
    if (!policy.isCustom) {
      throw new BadRequestError("Default policy descriptions cannot be edited");
    }

    if (typeof description !== "string" || description.trim().length < 15) {
      throw new BadRequestError("description must clearly explain what this policy should detect");
    }

    policy.description = description.trim();
  }

  await policy.save();

  res.json({ success: true, data: { policy } });
});