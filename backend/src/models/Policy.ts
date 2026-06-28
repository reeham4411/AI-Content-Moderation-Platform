import { Schema, model, Document, Types } from "mongoose";
import { EnforcementBehavior, ModerationCategoryKey } from "../types";

export interface IPolicy extends Document {
  _id: Types.ObjectId;
  category: ModerationCategoryKey;
  displayName?: string;
  description?: string;
  isCustom: boolean;
  enabled: boolean;
  confidenceThreshold: number;
  enforcementBehavior: EnforcementBehavior;
  createdAt: Date;
  updatedAt: Date;
}

const policySchema = new Schema<IPolicy>(
  {
    category: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    confidenceThreshold: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      default: 0.7,
    },
    enforcementBehavior: {
      type: String,
      enum: Object.values(EnforcementBehavior),
      default: EnforcementBehavior.FLAG_FOR_REVIEW,
    },
  },
  { timestamps: true }
);

export const Policy = model<IPolicy>("Policy", policySchema);