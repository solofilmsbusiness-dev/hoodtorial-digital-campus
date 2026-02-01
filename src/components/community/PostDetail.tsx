import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Pin, 
  Star,
  ArrowLeft,
  Film,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CommunityPost, PostCategory } from "@/hooks/useCommunityPosts";
import { useCommunityComments } from "@/hooks/useCommunityComments";
import { CommentThread } from "./CommentThread";
import { CritiqueCommentForm } from "./CritiqueCommentForm";
import { ImageGallery } from "./ImageGallery";
import { useAuth } from "@/contexts/AuthContext";

interface PostDetailProps {
  post: CommunityPost;
  onBack: () => void;
  onLike: () => void;
  onFollow: () => void;
}

const categoryLabels: Record<PostCategory, string> = {
  general: "General Discussion",
  course_discussion: "Course Discussion",
  project_submission: "Project Submission",
  feedback_critique: "Feedback & Critique",
  announcement: "Announcement",
};

const categoryColors: Record<PostCategory, string> = {
  general: "bg-muted text-muted-foreground",
  course_discussion: "bg-accent/20 text-accent",
  project_submission: "bg-primary/20 text-primary",
  feedback_critique: "bg-purple-500/20 text-purple-400",
  announcement: "bg-destructive/20 text-destructive",
};

export function PostDetail({ post, onBack, onLike, onFollow }: PostDetailProps) {
  const { user } = useAuth();
  const { comments, isLoading, createComment, toggleCommentLike, deleteComment } = useCommunityComments(post.id);

  const getInitials = (name?: string | null) => {
    if (!name) return "S";
    return name.split(" ").map(n => n.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  const handleCreateComment = (data: {
    content: string;
    what_works?: string;
    what_could_improve?: string;
    actionable_suggestion?: string;
    media_urls?: string[];
  }) => {
    createComment.mutate({
      post_id: post.id,
      content: data.content,
      what_works: data.what_works,
      what_could_improve: data.what_could_improve,
      actionable_suggestion: data.actionable_suggestion,
      media_urls: data.media_urls,
    });
  };

  const handleReply = (data: { parent_comment_id: string; content: string }) => {
    createComment.mutate({
      post_id: post.id,
      parent_comment_id: data.parent_comment_id,
      content: data.content,
    });
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Community
      </Button>

      {/* Main post */}
      <Card className={cn(
        "card-urban",
        post.is_pinned && "border-primary/50 bg-primary/5",
        post.is_highlighted && "ring-2 ring-primary/30"
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-border">
                <AvatarImage src={post.author?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {getInitials(post.author?.display_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    {post.author?.display_name || "Anonymous Student"}
                  </span>
                  <Badge variant="outline" className="text-xs">Student</Badge>
                  {post.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                  {post.is_highlighted && <Star className="h-3 w-3 text-primary fill-primary" />}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>

            <Badge className={cn("text-xs", categoryColors[post.category])}>
              {categoryLabels[post.category]}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {post.course_code && (
            <Badge variant="outline" className="text-sm">
              {post.course_code}
            </Badge>
          )}

          <h1 className="text-2xl font-black text-foreground">
            {post.title}
          </h1>
          
          <div className="prose prose-sm prose-invert max-w-none">
            <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Video embed */}
          {post.video_url && (
            <div className="mt-4">
              {getYouTubeEmbedUrl(post.video_url) ? (
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                  <iframe
                    src={getYouTubeEmbedUrl(post.video_url)!}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : (
                <a 
                  href={post.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-muted rounded-lg text-primary hover:underline"
                >
                  <Film className="h-4 w-4" />
                  View Video
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          {/* Media images with lightbox */}
          {post.media_urls.length > 0 && (
            <ImageGallery images={post.media_urls} className="mt-4" />
          )}

          <Separator className="my-4" />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={onLike}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  post.user_has_liked 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <Heart className={cn("h-5 w-5", post.user_has_liked && "fill-primary")} />
                <span>{post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}</span>
              </button>

              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-5 w-5" />
                <span>{post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}</span>
              </span>
            </div>

            <button
              onClick={onFollow}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors",
                post.user_is_following 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Bookmark className={cn("h-5 w-5", post.user_is_following && "fill-primary")} />
              <span>{post.user_is_following ? "Following" : "Follow Thread"}</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Comment form */}
      <CritiqueCommentForm
        postId={post.id}
        isProjectPost={post.is_project_post}
        onSubmit={handleCreateComment}
        isSubmitting={createComment.isPending}
      />

      {/* Comments section */}
      <Card className="card-urban">
        <CardHeader>
          <h3 className="font-bold text-lg">
            Comments ({post.comments_count})
          </h3>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading comments...
            </div>
          ) : (
            <CommentThread
              comments={comments}
              onLike={(commentId) => toggleCommentLike.mutate(commentId)}
              onReply={handleReply}
              onDelete={(commentId) => deleteComment.mutate(commentId)}
              isProjectPost={post.is_project_post}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
