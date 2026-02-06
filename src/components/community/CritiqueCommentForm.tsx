import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Lightbulb, Send } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import { MentionInput } from "./MentionInput";
import { useCommunityUploads } from "@/hooks/useCommunityUploads";
import { useMentions } from "@/hooks/useMentions";

interface CritiqueCommentFormProps {
  postId: string;
  isProjectPost: boolean;
  onSubmit: (data: {
    content: string;
    what_works?: string;
    what_could_improve?: string;
    actionable_suggestion?: string;
    media_urls?: string[];
    mentioned_user_ids?: string[];
  }) => void;
  isSubmitting: boolean;
}

export function CritiqueCommentForm({ 
  postId, 
  isProjectPost, 
  onSubmit, 
  isSubmitting 
}: CritiqueCommentFormProps) {
  const [content, setContent] = useState("");
  const [useStructuredFeedback, setUseStructuredFeedback] = useState(isProjectPost);
  const [whatWorks, setWhatWorks] = useState("");
  const [whatCouldImprove, setWhatCouldImprove] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  
  const { uploadImages, isUploading, uploadProgress } = useCommunityUploads();
  const { parseMentions } = useMentions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (useStructuredFeedback) {
      if (!whatWorks.trim() && !whatCouldImprove.trim() && !suggestion.trim()) return;
      
      const fullContent = `Structured Feedback:\n\nWhat Works: ${whatWorks}\n\nWhat Could Improve: ${whatCouldImprove}\n\nSuggestion: ${suggestion}`;
      const mentionedUserIds = parseMentions(fullContent);
      
      onSubmit({
        content: fullContent,
        what_works: whatWorks.trim() || undefined,
        what_could_improve: whatCouldImprove.trim() || undefined,
        actionable_suggestion: suggestion.trim() || undefined,
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
        mentioned_user_ids: mentionedUserIds.length > 0 ? mentionedUserIds : undefined,
      });
      setWhatWorks("");
      setWhatCouldImprove("");
      setSuggestion("");
    } else {
      if (!content.trim()) return;
      
      const mentionedUserIds = parseMentions(content);
      
      onSubmit({ 
        content: content.trim(),
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
        mentioned_user_ids: mentionedUserIds.length > 0 ? mentionedUserIds : undefined,
      });
      setContent("");
    }
    setMediaUrls([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && content.trim()) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Simple inline form for non-project posts
  if (!isProjectPost) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border border-border rounded-lg bg-card">
        <Input
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          disabled={isSubmitting || !content.trim()}
          className="h-8 w-8 shrink-0 text-primary hover:text-primary"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    );
  }

  // Full structured critique form for project posts
  return (
    <Card className="card-urban">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 p-3 mb-4 bg-primary/10 rounded-lg border border-primary/30">
          <Lightbulb className="h-5 w-5 text-primary flex-shrink-0" />
          <p className="text-sm text-primary">
            <strong>Critique Prompt:</strong> Help your peer by providing structured, professional feedback.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <Label htmlFor="structured" className="text-sm font-medium">
              Use structured feedback format
            </Label>
            <Switch
              id="structured"
              checked={useStructuredFeedback}
              onCheckedChange={setUseStructuredFeedback}
            />
          </div>

          {useStructuredFeedback ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="what-works" className="text-sm font-bold text-green-400">
                  ✓ What Works Well
                </Label>
                <Textarea
                  id="what-works"
                  placeholder="What aspects are successful or effective?"
                  value={whatWorks}
                  onChange={(e) => setWhatWorks(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="improve" className="text-sm font-bold text-amber-400">
                  ⚡ What Could Improve
                </Label>
                <Textarea
                  id="improve"
                  placeholder="What areas need more work or attention?"
                  value={whatCouldImprove}
                  onChange={(e) => setWhatCouldImprove(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="suggestion" className="text-sm font-bold text-primary">
                  💡 One Actionable Suggestion
                </Label>
                <Textarea
                  id="suggestion"
                  placeholder="Give one specific, actionable suggestion to try..."
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <MentionInput
                placeholder="Share your thoughts, feedback, or questions... Use @username to mention someone"
                value={content}
                onChange={setContent}
                rows={3}
              />
            </div>
          )}

          {/* Image uploader */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Attach images (optional)</Label>
            <ImageUploader
              images={mediaUrls}
              onImagesChange={setMediaUrls}
              onUpload={uploadImages}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              maxImages={3}
            />
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting || isUploading || (useStructuredFeedback 
                ? (!whatWorks.trim() && !whatCouldImprove.trim() && !suggestion.trim())
                : !content.trim()
              )}
              className="btn-brutal"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
