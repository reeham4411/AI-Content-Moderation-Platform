import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Submission, ModeratedImage, CATEGORY_LABELS } from "@/types";
import { formatDate, formatConfidence, formatFileSize } from "./format";

function getVerdictColor(verdict: string): [number, number, number] {
  if (verdict === "APPROVED") return [5, 150, 105];
  if (verdict === "FLAGGED") return [217, 119, 6];
  if (verdict === "BLOCKED") return [220, 38, 38];
  return [71, 85, 105];
}

function getOverallVerdict(images: ModeratedImage[]) {
  if (images.some((img) => img.verdict === "BLOCKED")) return "BLOCKED";
  if (images.some((img) => img.verdict === "FLAGGED")) return "FLAGGED";
  return "APPROVED";
}

function addSectionTitle(doc: jsPDF, title: string, y: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(17, 24, 39);
  doc.text(title, 14, y);

  doc.setDrawColor(20, 184, 166);
  doc.setLineWidth(0.5);
  doc.line(14, y + 3, 196, y + 3);
}

function addFooter(doc: jsPDF) {
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Muhafiz Moderation Report · Page ${i} of ${totalPages}`, 14, 287);
  }
}

export function downloadSubmissionReport(submission: Submission): void {
  const doc = new jsPDF("p", "mm", "a4");

  const overallVerdict = getOverallVerdict(submission.images);
  const verdictColor = getVerdictColor(overallVerdict);

  // Header
  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, 210, 44, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Muhafiz", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("AI Content Moderation Report", 14, 29);

  // Verdict badge
  doc.setFillColor(verdictColor[0], verdictColor[1], verdictColor[2]);
  doc.roundedRect(148, 14, 45, 12, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(overallVerdict, 156, 22);

  // Summary card
  doc.setFillColor(250, 250, 248);
  doc.roundedRect(14, 54, 182, 42, 4, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(17, 24, 39);
  doc.text("Submission Summary", 20, 66);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);

  doc.text(`Submission ID: ${submission._id}`, 20, 76);
  doc.text(`Submitted: ${formatDate(submission.createdAt)}`, 20, 84);
  doc.text(`Total Images: ${submission.images.length}`, 125, 76);
  doc.text(`Overall Verdict: ${overallVerdict}`, 125, 84);

  // Image summary table
  addSectionTitle(doc, "Image Results", 112);

  autoTable(doc, {
    startY: 119,
    head: [["File Name", "Size", "Verdict", "Provider", "Overridden"]],
    body: submission.images.map((image) => [
      image.fileName,
      formatFileSize(image.sizeBytes),
      image.verdict,
      image.provider,
      image.overridden ? "Yes" : "No",
    ]),
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  let finalY = (doc as any).lastAutoTable.finalY + 14;

  // Detailed image breakdowns
  submission.images.forEach((image, index) => {
    if (finalY > 230) {
      doc.addPage();
      finalY = 20;
    }

    addSectionTitle(doc, `Image ${index + 1}: ${image.fileName}`, finalY);
    finalY += 9;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);

    doc.text(`Verdict: ${image.verdict}`, 14, finalY);
    doc.text(`Uploaded: ${formatDate(image.createdAt)}`, 65, finalY);
    doc.text(`Size: ${formatFileSize(image.sizeBytes)}`, 145, finalY);

    finalY += 6;
    doc.text(`Provider: ${image.provider}`, 14, finalY);
    doc.text(`Overridden: ${image.overridden ? "Yes" : "No"}`, 65, finalY);

    finalY += 7;

    if (image.overridden && image.overrideReason) {
      doc.setTextColor(180, 83, 9);
      doc.setFont("helvetica", "bold");
      doc.text("Override reason:", 14, finalY);
      doc.setFont("helvetica", "normal");
      doc.text(image.overrideReason, 45, finalY);
      finalY += 8;
    }

    if (!image.categoryBreakdown || image.categoryBreakdown.length === 0) {
      doc.setTextColor(75, 85, 99);
      doc.text("No categories were evaluated.", 14, finalY);
      finalY += 10;
      return;
    }

    autoTable(doc, {
      startY: finalY,
      head: [
        [
          "Category",
          "Violation",
          "Confidence",
          "Threshold",
          "Enforcement",
          "Contributed",
          "Reasoning",
        ],
      ],
      body: image.categoryBreakdown.map((c) => [
        CATEGORY_LABELS[c.category] || c.category,
        c.violationDetected ? "Detected" : "Not detected",
        formatConfidence(c.confidenceScore),
        formatConfidence(c.thresholdUsed),
        c.enforcementUsed,
        c.contributedToVerdict ? "Yes" : "No",
        c.reasoning || "No reasoning provided",
      ]),
      styles: {
        font: "helvetica",
        fontSize: 7.8,
        cellPadding: 2.2,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [20, 184, 166],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 20 },
        2: { cellWidth: 19 },
        3: { cellWidth: 19 },
        4: { cellWidth: 24 },
        5: { cellWidth: 22 },
        6: { cellWidth: 50 },
      },
    });

    finalY = (doc as any).lastAutoTable.finalY + 13;
  });

  // Policy snapshot section
  const policySnapshot = submission.images[0]?.policySnapshot;

  if (policySnapshot && policySnapshot.length > 0) {
    if (finalY > 225) {
      doc.addPage();
      finalY = 20;
    }

    addSectionTitle(doc, "Policy Snapshot", finalY);
    finalY += 8;

    autoTable(doc, {
      startY: finalY,
      head: [["Category", "Enabled", "Threshold", "Enforcement"]],
      body: policySnapshot.map((policy) => [
        CATEGORY_LABELS[policy.category] || policy.category,
        policy.enabled ? "Yes" : "No",
        formatConfidence(policy.confidenceThreshold),
        policy.enforcementBehavior,
      ]),
      styles: {
        font: "helvetica",
        fontSize: 8.5,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [15, 118, 110],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    finalY = (doc as any).lastAutoTable.finalY + 14;
  }

  // Audit note
  if (finalY > 250) {
    doc.addPage();
    finalY = 22;
  }

  doc.setFillColor(240, 253, 250);
  doc.roundedRect(14, finalY, 182, 25, 4, 4, "F");

  doc.setTextColor(15, 118, 110);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Audit Note", 20, finalY + 8);

  doc.setTextColor(75, 85, 99);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "This report was generated from the stored moderation result and policy snapshot for this submission.",
    20,
    finalY + 16
  );

  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.text(`Report generated: ${new Date().toLocaleString()}`, 20, finalY + 21);

  addFooter(doc);

  doc.save(`muhafiz-report-${submission._id}.pdf`);
}