import { useState } from "react";
import jsPDF from "jspdf";
import { Download, X, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CertificateGeneratorProps {
  studentName: string;
  courseTitle: string;
  department: string;
  completionDate: string;
  courseCode: string;
  onClose: () => void;
}

const GOLD = "#C9A84C";
const DARK_GOLD = "#A0782A";
const BLACK = "#0A0A0A";
const WHITE = "#FFFFFF";
const LIGHT_GOLD = "#F0D98A";

function formatDepartment(dept: string): string {
  if (!dept) return "Creative Arts";
  return dept
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function generateCertificatePDF(
  studentName: string,
  courseTitle: string,
  department: string,
  completionDate: string
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;

  // ── Background ──────────────────────────────────────────────
  doc.setFillColor(WHITE);
  doc.rect(0, 0, W, H, "F");

  // ── Outer gold border ────────────────────────────────────────
  doc.setDrawColor(GOLD);
  doc.setLineWidth(4);
  doc.rect(8, 8, W - 16, H - 16, "S");

  // ── Inner thin border ─────────────────────────────────────────
  doc.setLineWidth(0.8);
  doc.setDrawColor(DARK_GOLD);
  doc.rect(13, 13, W - 26, H - 26, "S");

  // ── Corner ornaments ──────────────────────────────────────────
  const corners = [
    [8, 8],
    [W - 8, 8],
    [8, H - 8],
    [W - 8, H - 8],
  ];
  doc.setFillColor(GOLD);
  corners.forEach(([cx, cy]) => {
    doc.circle(cx, cy, 4, "F");
  });

  // ── Top gold band ─────────────────────────────────────────────
  doc.setFillColor(BLACK);
  doc.rect(13, 13, W - 26, 22, "F");

  // ── University name in band ───────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(GOLD);
  doc.text("HOODTORIAL UNIVERSITY", W / 2, 27, { align: "center" });

  // ── Gold accent line below band ───────────────────────────────
  doc.setDrawColor(GOLD);
  doc.setLineWidth(1.5);
  doc.line(18, 35, W - 18, 35);

  // ── "CERTIFICATE OF COMPLETION" ───────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(BLACK);
  doc.text("CERTIFICATE OF COMPLETION", W / 2, 58, { align: "center" });

  // ── Decorative divider ────────────────────────────────────────
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.5);
  const divW = 80;
  doc.line(W / 2 - divW / 2, 63, W / 2 - 6, 63);
  doc.line(W / 2 + 6, 63, W / 2 + divW / 2, 63);
  // Centre diamond
  doc.setFillColor(GOLD);
  const dx = W / 2;
  const dy = 63;
  doc.lines(
    [
      [4, -3],
      [4, 3],
      [-4, 3],
      [-4, -3],
    ],
    dx - 4,
    dy,
    [1, 1],
    "F",
    true
  );

  // ── "This is to certify that" ─────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor("#555555");
  doc.text("This is to certify that", W / 2, 77, { align: "center" });

  // ── Student name ──────────────────────────────────────────────
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(34);
  doc.setTextColor(DARK_GOLD);
  doc.text(studentName || "Student Name", W / 2, 97, { align: "center" });

  // ── Underline for name ────────────────────────────────────────
  const nameWidth = doc.getTextWidth(studentName || "Student Name");
  const nameLineStart = W / 2 - nameWidth / 2 - 5;
  const nameLineEnd = W / 2 + nameWidth / 2 + 5;
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.5);
  doc.line(nameLineStart, 100, nameLineEnd, 100);

  // ── "has successfully completed" ──────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor("#555555");
  doc.text("has successfully completed the course", W / 2, 111, {
    align: "center",
  });

  // ── Course title ──────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(BLACK);
  const truncatedTitle =
    courseTitle.length > 50 ? courseTitle.slice(0, 47) + "..." : courseTitle;
  doc.text(truncatedTitle, W / 2, 124, { align: "center" });

  // ── Department ────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(DARK_GOLD);
  doc.text(
    `Department of ${formatDepartment(department)}`,
    W / 2,
    134,
    { align: "center" }
  );

  // ── Bottom section: signature area + date ─────────────────────
  const sigY = 162;

  // Left signature block
  doc.setDrawColor("#CCCCCC");
  doc.setLineWidth(0.4);
  doc.line(40, sigY, 120, sigY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(BLACK);
  doc.text("Hoodtorial University", 80, sigY + 6, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor("#777777");
  doc.text("Authorized Signature", 80, sigY + 12, { align: "center" });

  // Right block: date
  doc.setDrawColor("#CCCCCC");
  doc.line(177, sigY, 257, sigY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(BLACK);
  doc.text(completionDate, 217, sigY + 6, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor("#777777");
  doc.text("Date of Completion", 217, sigY + 12, { align: "center" });

  // ── Bottom gold band ──────────────────────────────────────────
  doc.setFillColor(BLACK);
  doc.rect(13, H - 35, W - 26, 22, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(LIGHT_GOLD);
  doc.text(
    "Hoodtorial University · Digital Campus · hoodtorial.com",
    W / 2,
    H - 21,
    { align: "center" }
  );

  return doc;
}

const CertificateGenerator = ({
  studentName,
  courseTitle,
  department,
  completionDate,
  courseCode,
  onClose,
}: CertificateGeneratorProps) => {
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const doc = generateCertificatePDF(
        studentName,
        courseTitle,
        department,
        completionDate
      );
      const safeTitle = courseTitle.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40);
      doc.save(`HU_Certificate_${safeTitle}.pdf`);

      // Record certificate issuance (best-effort, graceful failure)
      if (user) {
        await supabase
          .from("certificates" as never)
          .upsert(
            { user_id: user.id, course_id: courseCode },
            { onConflict: "user_id,course_id" }
          )
          .then(() => {});
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg border-2 border-primary bg-card p-8 text-center shadow-xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center border-2 border-primary bg-primary/10">
          <Award className="h-10 w-10 text-primary" />
        </div>

        {/* Heading */}
        <h2 className="heading-3 mb-1 text-foreground">
          Course Complete!
        </h2>
        <p className="mb-1 text-sm font-semibold text-primary uppercase tracking-widest">
          Certificate of Completion
        </p>

        {/* Details */}
        <div className="my-6 space-y-2 border border-border bg-muted/30 p-4 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Student</span>
            <span className="font-semibold text-foreground">{studentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Course</span>
            <span className="max-w-[60%] text-right font-semibold text-foreground">
              {courseTitle}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Department</span>
            <span className="font-semibold text-foreground">
              {formatDepartment(department)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="font-semibold text-foreground">{completionDate}</span>
          </div>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="btn-brutal w-full"
        >
          {isDownloading ? (
            "Generating PDF…"
          ) : (
            <>
              <Download className="mr-2 h-5 w-5" />
              Download Certificate
            </>
          )}
        </button>

        <p className="mt-3 text-xs text-muted-foreground">
          Your certificate is a PDF you can share, print, or attach to your portfolio.
        </p>
      </div>
    </div>
  );
};

export default CertificateGenerator;
