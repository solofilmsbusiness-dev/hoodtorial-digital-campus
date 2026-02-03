import { useState } from "react";
import { FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
  const [isOpen, setIsOpen] = useState(false);
  const fileName = getFileNameFromUrl(documentUrl);
  const fileType = isPdf(documentUrl) ? "PDF Document" : "Document";
  
  // Use Google Docs Viewer to embed the PDF
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(documentUrl)}&embedded=true`;

  const handleOpenInNewTab = () => {
    window.open(documentUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card
        className="flex flex-col items-center justify-center p-12 cursor-pointer hover:bg-accent/50 transition-colors border-2 border-dashed"
        onClick={() => setIsOpen(true)}
      >
        <div className="p-4 bg-primary/10 rounded-full mb-6">
          <FileText className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title || fileName}</h3>
        <p className="text-muted-foreground mb-6 flex items-center gap-2">
          {fileType} — Click to view
        </p>
        <div className="flex gap-3">
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            View Document
          </Button>
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
        </div>
      </Card>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-4xl p-0">
          <SheetHeader className="p-6 pb-4">
            <SheetTitle>{title || fileName}</SheetTitle>
            <SheetDescription>{fileType}</SheetDescription>
          </SheetHeader>
          
          <div className="px-6 pb-6 h-[calc(100vh-180px)]">
            <iframe
              src={viewerUrl}
              className="w-full h-full border rounded-md bg-muted"
              title={title || "Document Viewer"}
            />
          </div>
          
          <div className="flex gap-3 px-6 pb-6">
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href={documentUrl} download={fileName}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
