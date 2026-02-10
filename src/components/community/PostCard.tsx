import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Pin, 
  Star,
  MoreVertical,
  Trash2,
  Film,
  Image as ImageIcon,
  GraduationCap,
  Shield
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CommunityPost, PostCategory } from "@/hooks/useCommunityPosts";
import { useAuth } from "@/contexts/AuthContext";
 import { UserProfileLink } from "@/components/profile/UserProfileLink";

interface PostCardProps {
  post: CommunityPost;
  onLike: () => void;
  onFollow: () => void;
  onDelete: () => void;
  onClick: () => void;
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

export function PostCard({ post, onLike, onFollow, onDelete, onClick }: PostCardProps) {
  const { user } = useAuth();
  const isOwner = user?.id === post.user_id;

  const getInitials = (name?: string | null) => {
    if (!name) return "S";
    return name.split(" ").map(n => n.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Card 
      className={cn(
        "card-urban cursor-pointer hover:border-primary/50 transition-all",
        post.is_pinned && "border-primary/50 bg-primary/5",
        post.is_highlighted && "ring-2 ring-primary/30"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
             <UserProfileLink
               userId={post.user_id}
               displayName={post.author?.display_name ?? null}
               avatarUrl={post.author?.avatar_url ?? null}
               accentColor={post.author?.profile_accent_color}
               borderStyle={post.author?.avatar_border_style}
               showName={false}
               size="lg"
             />
            <div>
              <div className="flex items-center gap-2">
                 <UserProfileLink
                   userId={post.user_id}
                   displayName={post.author?.display_name ?? null}
                   avatarUrl={post.author?.avatar_url ?? null}
                   showAvatar={false}
                   nameClassName="text-foreground"
                 />
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
                {post.is_pinned && (
                  <Pin className="h-3 w-3 text-primary" />
                )}
                {post.is_highlighted && (
                  <Star className="h-3 w-3 text-primary fill-primary" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", categoryColors[post.category])}>
              {categoryLabels[post.category]}
            </Badge>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {post.course_code && (
          <Badge variant="outline" className="mb-2 text-xs">
            {post.course_code}
          </Badge>
        )}

        <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
          {post.content}
        </p>

        {/* Image thumbnails */}
        {post.media_urls.length > 0 && (
          <div className="mb-4">
            <div className="flex gap-2 overflow-hidden">
              {post.media_urls.slice(0, 3).map((url, index) => (
                <div key={url} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-border">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 2 && post.media_urls.length > 3 && (
                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                      <span className="text-sm font-bold">+{post.media_urls.length - 3}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media indicators */}
        {post.video_url && (
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              <Film className="h-3 w-3" /> Video
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              className={cn(
                "flex items-center gap-1.5 text-sm transition-colors",
                post.user_has_liked 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Heart 
                className={cn("h-4 w-4", post.user_has_liked && "fill-primary")} 
              />
              <span>{post.likes_count}</span>
            </button>

            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments_count}</span>
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onFollow();
            }}
            className={cn(
              "flex items-center gap-1.5 text-sm transition-colors",
              post.user_is_following 
                ? "text-primary" 
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <Bookmark 
              className={cn("h-4 w-4", post.user_is_following && "fill-primary")} 
            />
            <span className="hidden sm:inline">
              {post.user_is_following ? "Following" : "Follow"}
            </span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
