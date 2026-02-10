import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageSquare, Bookmark, Award, Play, ChevronDown, ChevronUp, GraduationCap, Shield, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommunityPost, CommentPreview } from "@/hooks/useCommunityPosts";
import { motion, AnimatePresence } from "framer-motion";
import { getVideoType, getYouTubeId, getYouTubeEmbedUrl } from "@/lib/videoUtils";
 import { AddFriendButton } from "@/components/friends";
 import { UserProfileLink } from "@/components/profile/UserProfileLink";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ExtendedCommunityPost extends CommunityPost {
  target_profile_id?: string | null;
}

interface TimelinePostProps {
  post: ExtendedCommunityPost;
  onLike: () => void;
  onSave: () => void;
  onClick: () => void;
  onInlineComment?: (postId: string, content: string) => void;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  general: { label: "General", color: "bg-muted text-muted-foreground" },
  course_discussion: { label: "Course", color: "bg-blue-500/20 text-blue-400" },
  project_submission: { label: "Project", color: "bg-green-500/20 text-green-400" },
  feedback_critique: { label: "Critique", color: "bg-purple-500/20 text-purple-400" },
  announcement: { label: "News", color: "bg-primary/20 text-primary" },
};

export function TimelinePost({ 
  post, 
  onLike, 
  onSave, 
  onClick,
  onInlineComment,
}: TimelinePostProps) {
  const previewComments = post.preview_comments || [];
  const [isLiking, setIsLiking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [inlineComment, setInlineComment] = useState("");

  // Fetch target profile info if this is a wall post
  const { data: targetProfile } = useQuery({
    queryKey: ['target-profile', post.target_profile_id],
    queryFn: async () => {
      if (!post.target_profile_id) return null;
      const { data } = await supabase
        .from('profiles_public')
        .select('user_id, display_name')
        .eq('user_id', post.target_profile_id)
        .maybeSingle();
      return data;
    },
    enabled: !!post.target_profile_id,
    staleTime: 5 * 60 * 1000,
  });

  const isWallPost = !!post.target_profile_id;

  const getInitials = (name?: string | null) => {
    if (!name) return "S";
    return name.split(" ").map(n => n.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  const handleLike = () => {
    if (!post.user_has_liked) {
      setIsLiking(true);
      setTimeout(() => setIsLiking(false), 800);
    }
    onLike();
  };

  const hasMedia = post.media_urls.length > 0 || post.video_url;
  const isChallenge = !!(post as any).challenge_id;
  const isLongContent = post.content.length > 200;
  const displayContent = isLongContent && !isExpanded 
    ? post.content.slice(0, 200) + "..." 
    : post.content;

  const categoryInfo = categoryLabels[post.category] || categoryLabels.general;

  // Video handling
  const videoType = getVideoType(post.video_url);
  const youtubeId = videoType === 'youtube' && post.video_url ? getYouTubeId(post.video_url) : null;

  // Image gallery navigation
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : post.media_urls.length - 1);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => prev < post.media_urls.length - 1 ? prev + 1 : 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="relative group">
          <UserProfileLink
            userId={post.user_id}
            displayName={post.author?.display_name || null}
            avatarUrl={post.author?.avatar_url || null}
            accentColor={post.author?.profile_accent_color}
            borderStyle={post.author?.avatar_border_style}
            showName={false}
            size="lg"
          />
          {/* Add friend button on hover */}
          <div className="absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <AddFriendButton 
              userId={post.user_id} 
              size="icon" 
              variant="default"
              showLabel={false}
              className="h-6 w-6 rounded-full shadow-md"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <UserProfileLink
              userId={post.user_id}
              displayName={post.author?.display_name || null}
              avatarUrl={post.author?.avatar_url || null}
              showAvatar={false}
              nameClassName="text-sm truncate"
            />
            {isWallPost && targetProfile && (
              <>
                <span className="text-muted-foreground text-sm">→</span>
                <UserProfileLink
                  userId={targetProfile.user_id}
                  displayName={targetProfile.display_name}
                  avatarUrl={null}
                  showAvatar={false}
                  nameClassName="text-sm truncate text-muted-foreground"
                />
              </>
            )}
            {post.author?.role === 'admin' && (
              <Badge className="bg-destructive/20 text-destructive text-xs">
                <GraduationCap className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            )}
            {post.author?.role === 'professor' && (
              <Badge className="bg-primary/20 text-primary text-xs">
                <GraduationCap className="h-3 w-3 mr-1" />
                Professor
              </Badge>
            )}
            {post.author?.role === 'moderator' && (
              <Badge className="bg-accent/20 text-accent text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Moderator
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isChallenge && (
            <Badge className="bg-primary/20 text-primary border-0 text-xs">
              <Award className="h-3 w-3 mr-1" />
              Challenge
            </Badge>
          )}
          <Badge className={cn("border-0 text-xs", categoryInfo.color)}>
            {categoryInfo.label}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <h3 className="font-bold text-base text-foreground mb-2">{post.title}</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {displayContent}
        </p>
        {isLongContent && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-primary font-medium mt-1 flex items-center gap-1 hover:underline"
          >
            {isExpanded ? (
              <>Show less <ChevronUp className="h-3 w-3" /></>
            ) : (
              <>Read more <ChevronDown className="h-3 w-3" /></>
            )}
          </button>
        )}
      </div>

      {/* Media */}
      {hasMedia && (
        <div 
          className="relative bg-muted cursor-pointer"
          onClick={onClick}
        >
          {post.media_urls.length > 0 ? (
            <>
              <div className="relative aspect-video">
                <img
                  src={post.media_urls[currentImageIndex]}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Image navigation for multiple images */}
                {post.media_urls.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 transition-colors"
                    >
                      <ChevronDown className="h-4 w-4 rotate-90" />
                    </button>
                    <button 
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 transition-colors"
                    >
                      <ChevronDown className="h-4 w-4 -rotate-90" />
                    </button>
                    
                    {/* Dots indicator */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                      {post.media_urls.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(idx);
                          }}
                          className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            idx === currentImageIndex 
                              ? "bg-primary w-4" 
                              : "bg-background/60 hover:bg-background/80"
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : videoType === 'youtube' && youtubeId ? (
            <div className="aspect-video">
              <iframe
                src={getYouTubeEmbedUrl(youtubeId)}
                title={post.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : post.video_url && (
            <div className="aspect-video flex items-center justify-center bg-muted">
              <div className="w-16 h-16 rounded-full bg-background/80 flex items-center justify-center">
                <Play className="h-8 w-8 text-primary ml-1" />
              </div>
            </div>
          )}

          {/* Like animation */}
          <AnimatePresence>
            {isLiking && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="h-24 w-24 text-red-500 fill-red-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Engagement Stats */}
      <div className="px-4 py-2 border-b border-border">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className={cn("h-4 w-4", post.user_has_liked && "fill-red-500 text-red-500")} />
            {post.likes_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            {post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center border-b border-border">
        <Button
          variant="ghost"
          className={cn(
            "flex-1 gap-2 rounded-none h-11",
            post.user_has_liked && "text-red-500"
          )}
          onClick={handleLike}
        >
          <Heart className={cn("h-5 w-5", post.user_has_liked && "fill-current")} />
          <span className="text-sm font-medium">Like</span>
        </Button>
        <Button
          variant="ghost"
          className="flex-1 gap-2 rounded-none h-11"
          onClick={onClick}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-sm font-medium">Comment</span>
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "flex-1 gap-2 rounded-none h-11",
            post.user_is_following && "text-primary"
          )}
          onClick={onSave}
        >
          <Bookmark className={cn("h-5 w-5", post.user_is_following && "fill-current")} />
          <span className="text-sm font-medium">Save</span>
        </Button>
      </div>

      {/* Comment Preview */}
      {(previewComments.length > 0 || post.comments_count > 0) && (
        <div className="p-4 space-y-3">
          {previewComments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2">
              <UserProfileLink
                userId={comment.user_id}
                displayName={comment.author?.display_name || null}
                avatarUrl={comment.author?.avatar_url || null}
                showName={false}
                size="sm"
                avatarClassName="h-7 w-7 border border-border"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <UserProfileLink
                    userId={comment.user_id}
                    displayName={comment.author?.display_name || null}
                    avatarUrl={comment.author?.avatar_url || null}
                    showAvatar={false}
                    nameClassName="text-sm mr-1"
                    className="inline"
                  />
                  <span className="text-muted-foreground line-clamp-2">
                    {comment.content}
                  </span>
                </p>
              </div>
            </div>
          ))}

          {post.comments_count > previewComments.length && (
            <button
              onClick={onClick}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              View all {post.comments_count} comments
            </button>
          )}

          {/* Inline comment input */}
          {onInlineComment && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (inlineComment.trim()) {
                  onInlineComment(post.id, inlineComment.trim());
                  setInlineComment("");
                }
              }}
              className="flex items-center gap-2 mt-2"
            >
              <Input
                placeholder="Write a comment..."
                value={inlineComment}
                onChange={(e) => setInlineComment(e.target.value)}
                className="flex-1 h-9 text-sm border-border bg-muted/30"
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                disabled={!inlineComment.trim()}
                className="h-8 w-8 shrink-0 text-primary"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      )}
    </motion.div>
  );
}
