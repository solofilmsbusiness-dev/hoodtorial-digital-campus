import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, Award, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommunityPost } from "@/hooks/useCommunityPosts";
import { motion } from "framer-motion";
import { UserProfileLink } from "@/components/profile/UserProfileLink";

interface FeedCardProps {
  post: CommunityPost;
  onLike: () => void;
  onClick: () => void;
  variant?: 'grid' | 'feed';
}

export function FeedCard({ post, onLike, onClick, variant = 'grid' }: FeedCardProps) {
  const [isLiking, setIsLiking] = useState(false);

  const getInitials = (name?: string | null) => {
    if (!name) return "S";
    return name.split(" ").map(n => n.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  const handleDoubleTap = () => {
    if (!post.user_has_liked) {
      setIsLiking(true);
      onLike();
      setTimeout(() => setIsLiking(false), 800);
    }
  };

  const hasMedia = post.media_urls.length > 0 || post.video_url;
  const challengePost = (post as any).challenge_id;

  if (variant === 'feed') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4">
          <UserProfileLink
            userId={post.user_id}
            displayName={post.author?.display_name || null}
            avatarUrl={post.author?.avatar_url || null}
            showName={false}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <UserProfileLink
              userId={post.user_id}
              displayName={post.author?.display_name || null}
              avatarUrl={post.author?.avatar_url || null}
              showAvatar={false}
              nameClassName="text-sm truncate"
            />
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
          {challengePost && (
            <Badge className="bg-primary/20 text-primary border-0">
              <Award className="h-3 w-3 mr-1" />
              Challenge
            </Badge>
          )}
        </div>

        {/* Media */}
        {hasMedia && (
          <div 
            className="relative aspect-[4/5] bg-muted cursor-pointer"
            onClick={onClick}
            onDoubleClick={handleDoubleTap}
          >
            {post.media_urls[0] ? (
              <img
                src={post.media_urls[0]}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : post.video_url && (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <div className="w-16 h-16 rounded-full bg-background/80 flex items-center justify-center">
                  <Play className="h-8 w-8 text-primary ml-1" />
                </div>
              </div>
            )}

            {/* Like animation */}
            {isLiking && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Heart className="h-24 w-24 text-red-500 fill-red-500" />
              </motion.div>
            )}

            {/* Multiple images indicator */}
            {post.media_urls.length > 1 && (
              <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold">
                1/{post.media_urls.length}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              className="flex items-center gap-1.5 transition-transform hover:scale-110"
            >
              <Heart 
                className={cn(
                  "h-6 w-6 transition-colors",
                  post.user_has_liked 
                    ? "text-red-500 fill-red-500" 
                    : "text-foreground hover:text-red-500"
                )} 
              />
            </button>
            <button
              onClick={onClick}
              className="flex items-center gap-1.5 transition-transform hover:scale-110"
            >
              <MessageSquare className="h-6 w-6 text-foreground hover:text-primary" />
            </button>
          </div>

          <p className="font-bold text-sm">
            {post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}
          </p>

          <div onClick={onClick} className="cursor-pointer">
            <p className="text-sm">
              <span className="font-bold mr-2">{post.author?.display_name || "Anonymous"}</span>
              <span className="text-muted-foreground">{post.title}</span>
            </p>
            {post.comments_count > 0 && (
              <button className="text-sm text-muted-foreground mt-1 hover:underline">
                View all {post.comments_count} comments
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid variant
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer group"
      onClick={onClick}
      onDoubleClick={handleDoubleTap}
    >
      {/* Media */}
      {post.media_urls[0] ? (
        <img
          src={post.media_urls[0]}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      ) : post.video_url ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
          <Play className="h-8 w-8 text-foreground/50" />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
          <p className="text-foreground/50 text-sm font-medium px-4 text-center line-clamp-3">
            {post.title}
          </p>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
        <div className="flex items-center gap-2 text-foreground">
          <Heart className={cn("h-5 w-5", post.user_has_liked && "fill-current text-red-500")} />
          <span className="font-bold">{post.likes_count}</span>
        </div>
        <div className="flex items-center gap-2 text-foreground">
          <MessageSquare className="h-5 w-5" />
          <span className="font-bold">{post.comments_count}</span>
        </div>
      </div>

      {/* Like animation */}
      {isLiking && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Heart className="h-16 w-16 text-red-500 fill-red-500" />
        </motion.div>
      )}

      {/* Challenge badge */}
      {challengePost && (
        <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
          <Award className="h-3 w-3" />
          +0.5
        </div>
      )}

      {/* Multiple images indicator */}
      {post.media_urls.length > 1 && (
        <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold">
          +{post.media_urls.length - 1}
        </div>
      )}

      {/* Author overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/90 to-transparent">
          <UserProfileLink
            userId={post.user_id}
            displayName={post.author?.display_name || null}
            avatarUrl={post.author?.avatar_url || null}
            size="sm"
            avatarClassName="h-6 w-6 border border-border"
            nameClassName="text-xs truncate"
          />
      </div>
    </motion.div>
  );
}
