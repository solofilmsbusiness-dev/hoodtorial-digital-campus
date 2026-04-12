import { useState, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { X, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function PDFViewerModal({ url, title, onClose }: PDFViewerModalProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const measureContainer = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setContainerWidth(node.clientWidth);
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
      });
      observer.observe(node);
      containerRef.current = node;
    }
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(false);
  }

  function onDocumentLoadError() {
    setLoading(false);
    setError(true);
  }

  function previousPage() {
    setPageNumber((p) => Math.max(1, p - 1));
  }

  function nextPage() {
    setPageNumber((p) => Math.min(numPages, p + 1));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex flex-col w-full sm:max-w-4xl h-full bg-zinc-950 sm:border-x border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-zinc-900 shrink-0">
          <h2 className="text-sm font-bold text-primary truncate pr-4">{title}</h2>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors shrink-0"
            aria-label="Close PDF viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-y-auto">
          <div ref={measureContainer} className="w-full px-2 sm:px-4 py-4">
            {loading && !error && (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-sm">Loading PDF…</span>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
                <AlertCircle className="w-8 h-8 text-destructive" />
                <span className="text-sm font-bold text-destructive">Failed to load PDF</span>
                <span className="text-xs text-muted-foreground">The file may be unavailable or your browser blocked it.</span>
              </div>
            )}

            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
              className={loading || error ? "hidden" : undefined}
            >
              {containerWidth > 0 && (
                <Page
                  pageNumber={pageNumber}
                  width={containerWidth}
                  renderAnnotationLayer={true}
                  renderTextLayer={true}
                />
              )}
            </Document>
          </div>
        </div>

        {/* Footer navigation */}
        {!loading && !error && numPages > 0 && (
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border bg-zinc-900 shrink-0">
            <button
              onClick={previousPage}
              disabled={pageNumber <= 1}
              className="flex items-center gap-2 min-h-[44px] px-5 sm:px-3 py-2 sm:py-1.5 text-sm sm:text-xs font-bold border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-1 sm:flex-none justify-center sm:justify-start"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <span className="text-xs text-muted-foreground font-mono text-center">
              {pageNumber} / {numPages}
            </span>
            <button
              onClick={nextPage}
              disabled={pageNumber >= numPages}
              className="flex items-center gap-2 min-h-[44px] px-5 sm:px-3 py-2 sm:py-1.5 text-sm sm:text-xs font-bold border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-1 sm:flex-none justify-center sm:justify-end"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
