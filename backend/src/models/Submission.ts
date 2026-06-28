import { Schema, model, Document, Types } from "mongoose";
import {
  Verdict,
  CategoryBreakdown,
  PolicyCategorySnapshot,
  EnforcementBehavior,
} from "../types";

// One image within a submission
export interface IModeratedImage extends Types.Subdocument {
  fileName: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  verdict: Verdict;
  categoryBreakdown: CategoryBreakdown[];
  policySnapshot: PolicyCategorySnapshot[];
  provider: string;
  overridden: boolean;
  overriddenBy?: Types.ObjectId;
  overrideReason?: string;
  createdAt: Date;
}

export interface ISubmission extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  images: Types.DocumentArray<IModeratedImage>;
  createdAt: Date;
  updatedAt: Date;
}

const categoryBreakdownSchema = new Schema<CategoryBreakdown>(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    violationDetected: {
      type: Boolean,
      required: true,
    },
    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    reasoning: {
      type: String,
      required: true,
    },
    thresholdUsed: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    enforcementUsed: {
      type: String,
      enum: Object.values(EnforcementBehavior),
      required: true,
    },
    contributedToVerdict: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false }
);

const policySnapshotSchema = new Schema<PolicyCategorySnapshot>(
  {
    category: {
      type: String,
      required: true,
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
      required: true,
    },
    confidenceThreshold: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    enforcementBehavior: {
      type: String,
      enum: Object.values(EnforcementBehavior),
      required: true,
    },
  },
  { _id: false }
);

const moderatedImageSchema = new Schema<IModeratedImage>(
  {
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    sizeBytes: {
      type: Number,
      required: true,
    },
    verdict: {
      type: String,
      enum: Object.values(Verdict),
      required: true,
    },
    categoryBreakdown: {
      type: [categoryBreakdownSchema],
      default: [],
    },
    policySnapshot: {
      type: [policySnapshotSchema],
      default: [],
    },
    provider: {
      type: String,
      required: true,
    },
    overridden: {
      type: Boolean,
      default: false,
    },
    overriddenBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    overrideReason: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const submissionSchema = new Schema<ISubmission>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    images: {
      type: [moderatedImageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

submissionSchema.index({ "images.verdict": 1 });
submissionSchema.index({ createdAt: -1 });

export const Submission = model<ISubmission>("Submission", submissionSchema);