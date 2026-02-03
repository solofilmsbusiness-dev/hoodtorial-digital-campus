import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Video, FileText, Dumbbell, Info, Play } from "lucide-react";
import type { DbLesson } from "@/hooks/useAdminCourseContent";

interface LessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson?: DbLesson | null;
  onSave: (data: {
    title: string;
    type: string;
    duration?: string;
    video_url?: string;
    content?: string;
    description?: string;
  }) => void;
  isPending?: boolean;
}

const lessonTypes = [
  { value: "video", label: "Video", icon: Video },
  { value: "reading", label: "Reading", icon: FileText },
  { value: "practice", label: "Practice", icon: Dumbbell },
];

// Extract video ID from various URL formats
function getVideoEmbed(url: string): { type: "youtube" | "vimeo" | "direct" | null; embedUrl: string | null } {
  if (!url) return { type: null, embedUrl: null };

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }

  // Vimeo
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch) {
    return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  // Direct video files
  if (url.match(/\.(mp4|webm|ogg)(\?|$)/i)) {
    return { type: "direct", embedUrl: url };
  }

  return { type: null, embedUrl: null };
}

export function LessonDialog({
  open,
  onOpenChange,
  lesson,
  onSave,
  isPending,
}: LessonDialogProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("video");
  const [duration, setDuration] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title);
      setType(lesson.type);
      setDuration(lesson.duration || "");
      setVideoUrl(lesson.video_url || "");
      setDescription(lesson.description || "");
      setContent(lesson.content || "");
    } else {
      setTitle("");
      setType("video");
      setDuration("");
      setVideoUrl("");
      setDescription("");
      setContent("");
    }
  }, [lesson, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      type,
      duration: duration || undefined,
      video_url: videoUrl || undefined,
      description: description || undefined,
      content: content || undefined,
    });
  };

  const isEdit = !!lesson;

  const videoEmbed = useMemo(() => getVideoEmbed(videoUrl), [videoUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Lesson" : "Add Lesson"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Title</Label>
            <Input
              id="lesson-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Introduction to Lighting"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lessonTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2">
                        <t.icon className="h-4 w-4" />
                        {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-duration">Duration</Label>
              <Input
                id="lesson-duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="12 min"
              />
            </div>
          </div>

          {type === "video" && (
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Supports YouTube, Vimeo, or direct .mp4/.webm URLs
              </p>

              {/* Video Preview */}
              {videoEmbed.embedUrl && (
                <div className="mt-3 border rounded-lg overflow-hidden bg-black aspect-video">
                  {videoEmbed.type === "direct" ? (
                    <video
                      src={videoEmbed.embedUrl}
                      controls
                      className="w-full h-full"
                    />
                  ) : (
                    <iframe
                      src={videoEmbed.embedUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              )}

              {videoUrl && !videoEmbed.embedUrl && (
                <div className="mt-3 border rounded-lg p-4 bg-muted/50 flex items-center justify-center gap-2 text-muted-foreground">
                  <Play className="h-4 w-4" />
                  <span className="text-sm">Preview not available for this URL format</span>
                </div>
              )}
            </div>
          )}

          {(type === "reading" || type === "practice") && (
            <div className="space-y-2">
              <Label htmlFor="lesson-content">Content</Label>
              <Textarea
                id="lesson-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the lesson content here. Supports markdown formatting..."
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Supports markdown formatting for rich text
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="lesson-description">Description (optional)</Label>
            <Textarea
              id="lesson-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the lesson content..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? "Saving..." : isEdit ? "Update Lesson" : "Add Lesson"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
