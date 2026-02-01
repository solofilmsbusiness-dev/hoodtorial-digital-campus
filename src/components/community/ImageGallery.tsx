import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  className?: string;
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const openImage = (index: number) => setSelectedIndex(index);
  const closeImage = () => setSelectedIndex(null);

  const goToPrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  // Grid layout based on image count
  const getGridClass = () => {
    switch (images.length) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-2 sm:grid-cols-3";
      case 4:
        return "grid-cols-2";
      default:
        return "grid-cols-2 sm:grid-cols-3";
    }
  };

  return (
    <>
      <div className={cn("grid gap-2", getGridClass(), className)}>
        {images.slice(0, 5).map((url, index) => (
          <div
            key={url}
            className={cn(
              "relative cursor-pointer overflow-hidden rounded-lg border border-border",
              images.length === 3 && index === 0 && "sm:row-span-2",
              images.length === 1 ? "aspect-video" : "aspect-square"
            )}
            onClick={() => openImage(index)}
          >
            <img
              src={url}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            {index === 4 && images.length > 5 && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground">
                  +{images.length - 5}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => closeImage()}>
        <DialogContent className="max-w-4xl p-0 bg-background/95 backdrop-blur border-border">
          <div className="relative">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10"
              onClick={closeImage}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
                  onClick={goToPrev}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Image */}
            {selectedIndex !== null && (
              <div className="flex items-center justify-center p-4 min-h-[400px]">
                <img
                  src={images[selectedIndex]}
                  alt={`Image ${selectedIndex + 1}`}
                  className="max-w-full max-h-[70vh] object-contain rounded"
                />
              </div>
            )}

            {/* Counter */}
            {images.length > 1 && selectedIndex !== null && (
              <div className="text-center pb-4 text-sm text-muted-foreground">
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
