import { useRef, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Camera, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useToast } from "@/hooks/use-toast";

interface AvatarEditorProps {
  currentAvatarUrl?: string | null;
  displayName?: string | null;
  accentColor?: string;
  borderStyle?: string;
  onAvatarChange?: (url: string | null) => void;
}

const BORDER_STYLES: Record<string, string> = {
  solid: "border-4",
  double: "border-4 ring-2 ring-offset-2 ring-offset-background",
  dashed: "border-4 border-dashed",
  glow: "border-4 shadow-lg shadow-primary/50 animate-pulse",
};

export function AvatarEditor({
  currentAvatarUrl,
  displayName,
  accentColor = "#D4AF37",
  borderStyle = "solid",
  onAvatarChange,
}: AvatarEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { uploadAvatar, removeAvatar, uploading, progress } = useAvatarUpload();
  const { toast } = useToast();

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

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

    const { url, error } = await uploadAvatar(file);

    if (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    } else if (url) {
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been changed",
      });
      onAvatarChange?.(url);
    }
  }, [uploadAvatar, toast, onAvatarChange]);

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
    const { error } = await removeAvatar();
    if (error) {
      toast({
        variant: "destructive",
        title: "Failed to remove avatar",
        description: error.message,
      });
    } else {
      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed",
      });
      onAvatarChange?.(null);
    }
  };

  const borderClass = BORDER_STYLES[borderStyle] || BORDER_STYLES.solid;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={cn(
          "relative group cursor-pointer transition-all duration-300",
          isDragging && "scale-105"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <Avatar
          className={cn(
            "h-32 w-32 transition-all duration-300",
            borderClass
          )}
          style={{ borderColor: accentColor }}
        >
          <AvatarImage src={currentAvatarUrl || undefined} className="object-cover" />
          <AvatarFallback
            className="text-3xl font-bold"
            style={{ backgroundColor: accentColor, color: "#000" }}
          >
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>

        {/* Hover overlay */}
        <div className={cn(
          "absolute inset-0 rounded-full flex items-center justify-center transition-all duration-300",
          "bg-black/60 opacity-0 group-hover:opacity-100",
          isDragging && "opacity-100 bg-primary/40"
        )}>
          {uploading ? (
            <div className="text-center px-4">
              <Progress value={progress} className="w-20 h-2" />
              <span className="text-xs text-white mt-1">{progress}%</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-white">
              <Camera className="h-8 w-8 mb-1" />
              <span className="text-xs font-medium">
                {isDragging ? "Drop here" : "Change photo"}
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

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-1" />
          Upload
        </Button>
        {currentAvatarUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            disabled={uploading}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
