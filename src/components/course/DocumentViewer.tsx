import { FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DocumentViewerProps {
  documentUrl: string;
  title?: string;
  className?: string;
}

function getFileNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split("/").pop() || "document";
    const cleanName = fileName.replace(/^\d+-[a-z0-9]+-?/, "");
    return cleanName || fileName;
  } catch {
    return "document";
  }
}

function isPdf(url: string): boolean {
  return url.toLowerCase().endsWith(".pdf");
}

export function DocumentViewer({ documentUrl, title, className }: DocumentViewerProps) {
  const fileName = getFileNameFromUrl(documentUrl);
  const fileType = isPdf(documentUrl) ? "PDF Document" : "Document";

  const handleOpenDocument = () => {
    window.open(documentUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card
        className="flex flex-col items-center justify-center p-12 cursor-pointer hover:bg-accent/50 transition-colors border-2 border-dashed"
        onClick={handleOpenDocument}
      >
        <div className="p-4 bg-primary/10 rounded-full mb-6">
          <FileText className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title || fileName}</h3>
        <p className="text-muted-foreground mb-6 flex items-center gap-2">
          {fileType} — Click to open
          <ExternalLink className="h-4 w-4" />
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
          }}
          asChild
        >
          <a href={documentUrl} download={fileName}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </a>
        </Button>
      </Card>
    </div>
  );
}
