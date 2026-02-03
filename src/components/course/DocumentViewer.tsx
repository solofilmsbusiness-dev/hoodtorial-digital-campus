import { FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    // Remove the timestamp prefix if present (e.g., "1234567890-abc123.pdf" -> "document.pdf")
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
  const showEmbed = isPdf(documentUrl);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with download option */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{title || fileName}</p>
            <p className="text-sm text-muted-foreground">
              {showEmbed ? "PDF Document" : "Document"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={documentUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={documentUrl} download={fileName}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>
          </Button>
        </div>
      </div>

      {/* PDF Embed */}
      {showEmbed && (
        <div className="border rounded-lg overflow-hidden bg-muted">
          <iframe
            src={`${documentUrl}#toolbar=1&navpanes=0`}
            className="w-full h-[600px] md:h-[800px]"
            title={title || "Document viewer"}
          />
        </div>
      )}

      {/* Non-PDF fallback */}
      {!showEmbed && (
        <div className="border rounded-lg p-8 bg-muted/30 text-center">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            This document type cannot be previewed in the browser.
          </p>
          <Button asChild>
            <a href={documentUrl} download={fileName}>
              <Download className="h-4 w-4 mr-2" />
              Download to View
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
