import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ImagePlus, Trash2, Move } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useToast } from "@/hooks/use-toast";

interface CoverBannerProps {
  currentBannerUrl?: string | null;
  currentPosition?: number | null;
  onBannerChange?: (url: string | null) => void;
  onPositionChange?: (position: number) => void;
  onUploadComplete?: () => void;
}

export function CoverBanner({ currentBannerUrl, currentPosition, onBannerChange, onPositionChange, onUploadComplete }: CoverBannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(currentPosition ?? 50);
  const { uploadCoverBanner, removeCoverBanner, uploading, progress } = useAvatarUpload();
  const { toast } = useToast();

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, WebP, or GIF)",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
      });
      return;
    }

    const { url, error } = await uploadCoverBanner(file);

    if (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    } else if (url) {
      toast({
        title: "Banner updated",
        description: "Your cover banner has been changed",
      });
      onBannerChange?.(url);
      onUploadComplete?.();
    }
  }, [uploadCoverBanner, toast, onBannerChange, onUploadComplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = async () => {
    const { error } = await removeCoverBanner();
    if (error) {
      toast({
        variant: "destructive",
        title: "Failed to remove banner",
        description: error.message,
      });
    } else {
      toast({
        title: "Banner removed",
        description: "Your cover banner has been removed",
      });
      onBannerChange?.(null);
      onUploadComplete?.();
    }
  };

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "relative w-full h-48 md:h-64 rounded-xl overflow-hidden transition-all duration-300",
          "border-2 border-dashed cursor-pointer group",
          isDragging ? "border-primary bg-primary/10" : "border-border",
          currentBannerUrl && "border-solid"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        {currentBannerUrl ? (
          <>
            <img
              src={currentBannerUrl}
              alt="Cover banner"
              className="w-full h-full object-cover"
              style={{ objectPosition: `center ${position}%` }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <ImagePlus className="h-12 w-12 mb-2 opacity-50" />
            <span className="text-sm font-medium">Add cover banner</span>
            <span className="text-xs opacity-70">Recommended: 1920 × 480px</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-300",
          "bg-black/60 opacity-0 group-hover:opacity-100"
        )}>
          {uploading ? (
            <div className="text-center px-8">
              <Progress value={progress} className="w-32 h-2 mb-2" />
              <span className="text-sm text-white">Uploading... {progress}%</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-white">
              <ImagePlus className="h-10 w-10 mb-2" />
              <span className="text-sm font-medium">
                {isDragging ? "Drop image here" : "Change banner"}
              </span>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleInputChange}
          disabled={uploading}
        />
      </div>

      {/* Remove button */}
      {currentBannerUrl && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          disabled={uploading}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Remove
        </Button>
      )}
    </div>
  );
}
