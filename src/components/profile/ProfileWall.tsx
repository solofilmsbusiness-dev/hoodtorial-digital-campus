 import { useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { formatDistanceToNow } from "date-fns";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Textarea } from "@/components/ui/textarea";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Badge } from "@/components/ui/badge";
 import { MessageSquare, Heart, Trash2, Send, GraduationCap, Shield } from "lucide-react";
 import { useProfileWall } from "@/hooks/useProfileWall";
 import { useAuth } from "@/contexts/AuthContext";
 import { useProfile } from "@/hooks/useProfile";
 import { UserProfileLink } from "@/components/profile/UserProfileLink";
 import { cn } from "@/lib/utils";
 import { useCommunityPosts } from "@/hooks/useCommunityPosts";
 
 interface ProfileWallProps {
   profileUserId: string;
   profileDisplayName: string | null;
   isOwnProfile: boolean;
 }
 
 export function ProfileWall({ profileUserId, profileDisplayName, isOwnProfile }: ProfileWallProps) {
   const { user } = useAuth();
   const navigate = useNavigate();
   const { profile } = useProfile();
   const { wallPosts, isLoading, createWallPost, deleteWallPost } = useProfileWall(profileUserId);
   const { toggleLike } = useCommunityPosts();
   const [content, setContent] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);
 
   const getInitials = (name?: string | null) => {
     if (!name) return "?";
     return name.split(" ").map(n => n.charAt(0)).join("").toUpperCase().slice(0, 2);
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!content.trim() || !user) return;
 
     setIsSubmitting(true);
     try {
       await createWallPost.mutateAsync({
         content: content.trim(),
         target_profile_id: profileUserId,
       });
       setContent("");
     } finally {
       setIsSubmitting(false);
     }
   };
 
   const handlePostClick = (postId: string) => {
     navigate(`/community?post=${postId}`);
   };
 
   const canDeletePost = (postUserId: string) => {
     if (!user) return false;
     // Can delete if you're the post author OR the profile owner
     return user.id === postUserId || user.id === profileUserId;
   };
 
   return (
     <Card className="card-urban mt-6">
       <CardHeader>
         <CardTitle className="flex items-center gap-2 text-lg">
           <MessageSquare className="h-5 w-5 text-primary" />
           Wall
         </CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         {/* Wall Post Composer */}
         {user && (
           <form onSubmit={handleSubmit} className="space-y-3">
             <div className="flex gap-3">
               <Avatar className="h-10 w-10 border-2 border-border flex-shrink-0">
                 <AvatarImage src={profile?.avatar_url || undefined} />
                 <AvatarFallback className="bg-primary/10 text-primary font-bold">
                   {getInitials(profile?.display_name)}
                 </AvatarFallback>
               </Avatar>
               <div className="flex-1 space-y-2">
                 <Textarea
                   value={content}
                   onChange={(e) => setContent(e.target.value)}
                   placeholder={isOwnProfile 
                     ? "Write something on your wall..." 
                     : `Write something on ${profileDisplayName || "their"}'s wall...`
                   }
                   className="min-h-[80px] resize-none"
                   maxLength={500}
                 />
                 <div className="flex justify-between items-center">
                   <span className="text-xs text-muted-foreground">
                     {content.length}/500
                   </span>
                   <Button 
                     type="submit" 
                     size="sm"
                     disabled={!content.trim() || isSubmitting}
                   >
                     <Send className="h-4 w-4 mr-2" />
                     Post
                   </Button>
                 </div>
               </div>
             </div>
           </form>
         )}
 
         {/* Wall Posts List */}
         {isLoading ? (
           <div className="space-y-4">
             {[1, 2].map((i) => (
               <div key={i} className="animate-pulse flex gap-3">
                 <div className="h-10 w-10 bg-muted rounded-full" />
                 <div className="flex-1 space-y-2">
                   <div className="h-4 bg-muted rounded w-1/4" />
                   <div className="h-12 bg-muted rounded" />
                 </div>
               </div>
             ))}
           </div>
         ) : wallPosts.length === 0 ? (
           <div className="text-center py-8 text-muted-foreground">
             <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
             <p className="text-sm">
               {isOwnProfile 
                 ? "No wall posts yet. Be the first to write something!" 
                 : "No wall posts yet. Be the first to write something!"
               }
             </p>
           </div>
         ) : (
           <div className="space-y-4">
             {wallPosts.map((post) => (
               <div
                 key={post.id}
                 className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
               >
                 <div className="flex gap-3">
                   <UserProfileLink
                     userId={post.user_id}
                     displayName={post.author?.display_name || null}
                     avatarUrl={post.author?.avatar_url || null}
                     showName={false}
                     size="md"
                   />
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 flex-wrap">
                       <UserProfileLink
                         userId={post.user_id}
                         displayName={post.author?.display_name || null}
                         avatarUrl={post.author?.avatar_url || null}
                         showAvatar={false}
                         nameClassName="text-sm"
                       />
                       {post.author?.role === 'admin' && (
                         <Badge className="bg-destructive/20 text-destructive text-xs px-1.5">
                           <GraduationCap className="h-3 w-3" />
                         </Badge>
                       )}
                       {post.author?.role === 'professor' && (
                         <Badge className="bg-primary/20 text-primary text-xs px-1.5">
                           <GraduationCap className="h-3 w-3" />
                         </Badge>
                       )}
                       {post.author?.role === 'moderator' && (
                         <Badge className="bg-accent/20 text-accent text-xs px-1.5">
                           <Shield className="h-3 w-3" />
                         </Badge>
                       )}
                       <span className="text-xs text-muted-foreground">
                         {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                       </span>
                     </div>
                     <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">
                       {post.content}
                     </p>
                     
                     {/* Post Actions */}
                     <div className="flex items-center gap-4 mt-3">
                       <button
                         onClick={() => toggleLike.mutate(post.id)}
                         className={cn(
                           "flex items-center gap-1 text-xs transition-colors",
                           post.user_has_liked 
                             ? "text-red-500" 
                             : "text-muted-foreground hover:text-red-500"
                         )}
                       >
                         <Heart className={cn("h-4 w-4", post.user_has_liked && "fill-current")} />
                         {post.likes_count > 0 && post.likes_count}
                       </button>
                       <button
                         onClick={() => handlePostClick(post.id)}
                         className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                       >
                         <MessageSquare className="h-4 w-4" />
                         {post.comments_count > 0 && post.comments_count}
                       </button>
                       {canDeletePost(post.user_id) && (
                         <button
                           onClick={() => deleteWallPost.mutate(post.id)}
                           className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors ml-auto"
                         >
                           <Trash2 className="h-4 w-4" />
                         </button>
                       )}
                     </div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         )}
       </CardContent>
     </Card>
   );
 }