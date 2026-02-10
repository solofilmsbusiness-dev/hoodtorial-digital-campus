import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Reply, 
  Trash2, 
  Star,
  Shield,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CommunityComment } from "@/hooks/useCommunityComments";
import { useAuth } from "@/contexts/AuthContext";
import { ImageGallery } from "./ImageGallery";
import { UserProfileLink } from "@/components/profile/UserProfileLink";

interface CommentThreadProps {
  comments: CommunityComment[];
  onLike: (commentId: string) => void;
  onReply: (data: { parent_comment_id: string; content: string }) => void;
  onDelete: (commentId: string) => void;
  isProjectPost?: boolean;
}

interface CommentItemProps {
  comment: CommunityComment;
  onLike: (commentId: string) => void;
  onReply: (data: { parent_comment_id: string; content: string }) => void;
  onDelete: (commentId: string) => void;
  depth?: number;
}

function CommentItem({ comment, onLike, onReply, onDelete, depth = 0 }: CommentItemProps) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const isOwner = user?.id === comment.user_id;
  const maxDepth = 3;

  const getInitials = (name?: string | null) => {
    if (!name) return "S";
    return name.split(" ").map(n => n.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  const getRoleBadge = () => {
    if (comment.user_role === 'admin') {
      return (
        <Badge className="bg-destructive/20 text-destructive text-xs">
          <GraduationCap className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      );
    }
    if (comment.user_role === 'professor') {
      return (
        <Badge className="bg-primary/20 text-primary text-xs">
          <GraduationCap className="h-3 w-3 mr-1" />
          Professor
        </Badge>
      );
    }
    if (comment.user_role === 'moderator') {
      return (
        <Badge className="bg-accent/20 text-accent text-xs">
          <Shield className="h-3 w-3 mr-1" />
          Moderator
        </Badge>
      );
    }
    return null;
  };

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;
    onReply({
      parent_comment_id: comment.id,
      content: replyContent.trim(),
    });
    setReplyContent("");
    setShowReplyForm(false);
  };

  const hasStructuredFeedback = comment.what_works || comment.what_could_improve || comment.actionable_suggestion;

  return (
    <div className={cn("py-4", depth > 0 && "ml-6 pl-4 border-l-2 border-border")}>
      <div className="flex items-start gap-3">
        <UserProfileLink
          userId={comment.user_id}
          displayName={comment.author?.display_name || null}
          avatarUrl={comment.author?.avatar_url || null}
          accentColor={comment.author?.profile_accent_color}
          borderStyle={comment.author?.avatar_border_style}
          showName={false}
          avatarClassName={cn(
            "border-2",
            comment.is_instructor_comment || comment.user_role === 'admin' || comment.user_role === 'professor'
              ? "border-primary"
              : "border-border"
          )}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <UserProfileLink
              userId={comment.user_id}
              displayName={comment.author?.display_name || null}
              avatarUrl={comment.author?.avatar_url || null}
              accentColor={comment.author?.profile_accent_color}
              borderStyle={comment.author?.avatar_border_style}
              showAvatar={false}
              nameClassName={cn(
                "text-sm",
                comment.is_instructor_comment ? "text-primary" : "text-foreground"
              )}
            />
            {getRoleBadge()}
            {comment.is_highlighted && (
              <Star className="h-3 w-3 text-primary fill-primary" />
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Structured feedback */}
          {hasStructuredFeedback && (
            <div className="space-y-2 mb-3 p-3 bg-muted/30 rounded-lg border border-border">
              {comment.what_works && (
                <div>
                  <span className="text-xs font-bold text-green-400 uppercase">What Works:</span>
                  <p className="text-sm text-foreground">{comment.what_works}</p>
                </div>
              )}
              {comment.what_could_improve && (
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase">Could Improve:</span>
                  <p className="text-sm text-foreground">{comment.what_could_improve}</p>
                </div>
              )}
              {comment.actionable_suggestion && (
                <div>
                  <span className="text-xs font-bold text-primary uppercase">Suggestion:</span>
                  <p className="text-sm text-foreground">{comment.actionable_suggestion}</p>
                </div>
              )}
            </div>
          )}

          {/* Regular content */}
          {!hasStructuredFeedback && (
            <p className="text-sm text-foreground mb-2">{comment.content}</p>
          )}

          {/* Comment images */}
          {comment.media_urls && comment.media_urls.length > 0 && (
            <ImageGallery images={comment.media_urls} className="mb-3 max-w-md" />
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLike(comment.id)}
              className={cn(
                "flex items-center gap-1 text-xs transition-colors",
                comment.user_has_liked 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Heart className={cn("h-3 w-3", comment.user_has_liked && "fill-primary")} />
              <span>{comment.likes_count}</span>
            </button>

            {depth < maxDepth && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Reply className="h-3 w-3" />
                Reply
              </button>
            )}

            {isOwner && (
              <button
                onClick={() => onDelete(comment.id)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={2}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim()}
                >
                  Reply
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setShowReplyForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onLike={onLike}
                  onReply={onReply}
                  onDelete={onDelete}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommentThread({ comments, onLike, onReply, onDelete, isProjectPost }: CommentThreadProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No comments yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onLike={onLike}
          onReply={onReply}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
