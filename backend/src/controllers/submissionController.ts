import { Request, Response } from "express";
import fs from "fs/promises";
import { Submission } from "../models/Submission";
import { Appeal } from "../models/Appeal";
import { asyncHandler } from "../utils/asyncHandler";
import { BadRequestError, NotFoundError, ForbiddenError } from "../utils/errors";
import { moderateImage } from "../services/moderationService";
import { UserRole, Verdict, ModerationCategory } from "../types";

export const createSubmission = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    throw new BadRequestError("At least one image file is required (field name: images)");
  }

  const moderatedImages = [];

  for (const file of files) {
    const buffer = await fs.readFile(file.path);
    const outcome = await moderateImage(buffer, file.mimetype);

    moderatedImages.push({
      fileName: file.originalname,
      filePath: file.path,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      verdict: outcome.verdict,
      categoryBreakdown: outcome.categoryBreakdown,
      policySnapshot: outcome.policySnapshot,
      provider: outcome.provider,
      overridden: false,
      createdAt: new Date(),
    });
  }

  const submission = await Submission.create({
    user: req.user!.userId,
    images: moderatedImages,
  });

  res.status(201).json({ success: true, data: { submission } });
});

export const getMySubmissions = asyncHandler(async (req: Request, res: Response) => {
  const { outcome, category, from, to, page = "1", limit = "20" } = req.query;

  const match: Record<string, any> = { user: req.user!.userId };

  if (from || to) {
    match.createdAt = {};

    if (from) match.createdAt.$gte = new Date(from as string);
    if (to) match.createdAt.$lte = new Date(to as string);
  }

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));

  let submissions = await Submission.find(match).sort({ createdAt: -1 });

  if (outcome && Object.values(Verdict).includes(outcome as Verdict)) {
    submissions = submissions
      .map((s) => {
        const filteredImages = s.images.filter((img) => img.verdict === outcome);
        return { ...s.toObject(), images: filteredImages };
      })
      .filter((s) => s.images.length > 0) as any;
  }

  if (category && Object.values(ModerationCategory).includes(category as ModerationCategory)) {
    submissions = submissions
      .map((s: any) => {
        const filteredImages = s.images.filter((img: any) =>
          img.categoryBreakdown.some(
            (c: any) => c.category === category && c.contributedToVerdict === true
          )
        );

        return { ...(s.toObject ? s.toObject() : s), images: filteredImages };
      })
      .filter((s: any) => s.images.length > 0) as any;
  }

  const total = submissions.length;
  const paginated = submissions.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: {
      submissions: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    },
  });
});

export const getSubmissionById = asyncHandler(async (req: Request, res: Response) => {
  const submission = await Submission.findById(req.params.id);

  if (!submission) {
    throw new NotFoundError("Submission not found");
  }

  const isOwner = submission.user.toString() === req.user!.userId;
  const isAdmin = req.user!.role === UserRole.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new ForbiddenError("You do not have access to this submission");
  }

  res.json({ success: true, data: { submission } });
});

export const deleteSubmission = asyncHandler(async (req: Request, res: Response) => {
  const submission = await Submission.findById(req.params.id);

  if (!submission) {
    throw new NotFoundError("Submission not found");
  }

  const isOwner = submission.user.toString() === req.user!.userId;
  const isAdmin = req.user!.role === UserRole.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new ForbiddenError("You do not have permission to delete this submission");
  }

  // Delete uploaded image files from local uploads folder
  for (const image of submission.images) {
    if (image.filePath) {
      try {
        await fs.unlink(image.filePath);
      } catch (error: any) {
        // Ignore missing file errors so DB deletion still succeeds
        if (error.code !== "ENOENT") {
          console.warn(`Failed to delete file: ${image.filePath}`, error.message);
        }
      }
    }
  }

  // Delete all appeals linked to this submission
  await Appeal.deleteMany({ submission: submission._id });

  // Delete submission document
  await Submission.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Submission deleted successfully",
  });
});

export const deleteSubmissionImage = asyncHandler(async (req: Request, res: Response) => {
  const { id, imageId } = req.params;

  const submission = await Submission.findById(id);

  if (!submission) {
    throw new NotFoundError("Submission not found");
  }

  const isOwner = submission.user.toString() === req.user!.userId;
  const isAdmin = req.user!.role === UserRole.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new ForbiddenError("You do not have permission to delete this image");
  }

  const image = submission.images.id(imageId);

  if (!image) {
    throw new NotFoundError("Image not found in submission");
  }

  if (image.filePath) {
    try {
      await fs.unlink(image.filePath);
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        console.warn(`Failed to delete file: ${image.filePath}`, error.message);
      }
    }
  }

  // Delete appeals linked only to this image
  await Appeal.deleteMany({
    submission: submission._id,
    imageId,
  });

  submission.images.pull(imageId);

  if (submission.images.length === 0) {
    // Safety cleanup: if this was the last image, remove any remaining appeals for this submission
    await Appeal.deleteMany({ submission: submission._id });

    await Submission.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Image deleted successfully. Submission was removed because it had no images left.",
      data: { submissionDeleted: true },
    });
  }

  await submission.save();

  res.json({
    success: true,
    message: "Image deleted successfully",
    data: {
      submissionDeleted: false,
      submission,
    },
  });
});