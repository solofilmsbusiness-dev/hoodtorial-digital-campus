 import { useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { formatDistanceToNow } from "date-fns";
 import { motion } from "framer-motion";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Textarea } from "@/components/ui/textarea";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Badge } from "@/components/ui/badge";
 import { MessageSquare, Heart, Trash2, Send, GraduationCap, Shield, Sparkles } from "lucide-react";
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
   const [isFocused, setIsFocused] = useState(false);
 
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
     return user.id === postUserId || user.id === profileUserId;
   };
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 30 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.5, delay: 0.6 }}
     >
       <Card className="bg-charcoal border-2 border-border overflow-hidden">
         {/* Header with decorative element */}
         <CardHeader className="relative border-b border-border">
           <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
           <CardTitle className="flex items-center gap-3 text-lg font-black uppercase tracking-wider">
             <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/20 border border-primary/30">
               <MessageSquare className="h-4 w-4 text-primary" />
             </div>
             Wall
           </CardTitle>
         </CardHeader>
         
         <CardContent className="space-y-6 pt-6">
           {/* Wall Post Composer - Enhanced */}
           {user && (
             <form onSubmit={handleSubmit} className="space-y-4">
               <div className="flex gap-4">
                 <Avatar className="h-12 w-12 border-2 border-border flex-shrink-0 ring-2 ring-transparent transition-all duration-300"
                   style={isFocused ? { borderColor: "hsl(var(--primary))", boxShadow: "0 0 15px hsl(var(--primary) / 0.3)" } : undefined}
                 >
                   <AvatarImage src={profile?.avatar_url || undefined} />
                   <AvatarFallback className="bg-charcoal-light text-primary font-bold">
                     {getInitials(profile?.display_name)}
                   </AvatarFallback>
                 </Avatar>
                 
                 <div className="flex-1 space-y-3">
                   <div className={cn(
                     "relative rounded-lg transition-all duration-300",
                     isFocused && "ring-2 ring-primary/50"
                   )}>
                     <Textarea
                       value={content}
                       onChange={(e) => setContent(e.target.value)}
                       onFocus={() => setIsFocused(true)}
                       onBlur={() => setIsFocused(false)}
                       placeholder={isOwnProfile 
                         ? "Write something on your wall..." 
                         : `Write something on ${profileDisplayName || "their"}'s wall...`
                       }
                       className={cn(
                         "min-h-[100px] resize-none bg-charcoal-dark border-2 border-border",
                         "placeholder:text-muted-foreground/50 transition-all duration-300",
                         "focus:border-primary focus:ring-0"
                       )}
                       maxLength={500}
                     />
                   </div>
                   
                   <div className="flex justify-between items-center">
                     <span className="text-xs text-muted-foreground font-mono">
                       {content.length}/500
                     </span>
                     <Button 
                       type="submit" 
                       disabled={!content.trim() || isSubmitting}
                       className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6"
                     >
                       <Send className="h-4 w-4 mr-2" />
                       Post
                     </Button>
                   </div>
                 </div>
               </div>
             </form>
           )}
 
           {/* Divider */}
           <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
 
           {/* Wall Posts List */}
           {isLoading ? (
             <div className="space-y-4">
               {[1, 2].map((i) => (
                 <div key={i} className="animate-pulse flex gap-4">
                   <div className="h-12 w-12 bg-charcoal-light rounded-full" />
                   <div className="flex-1 space-y-3">
                     <div className="h-4 bg-charcoal-light rounded w-1/4" />
                     <div className="h-16 bg-charcoal-light rounded" />
                   </div>
                 </div>
               ))}
             </div>
           ) : wallPosts.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">
               <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-light flex items-center justify-center">
                 <Sparkles className="h-8 w-8 text-primary/50" />
               </div>
               <p className="text-sm font-medium">No wall posts yet</p>
               <p className="text-xs mt-1 text-muted-foreground/70">Be the first to leave a message!</p>
             </div>
           ) : (
             <div className="space-y-4">
               {wallPosts.map((post, index) => (
                 <motion.div
                   key={post.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.4, delay: index * 0.05 }}
                   className={cn(
                     "group relative border-2 border-border rounded-lg p-4",
                     "bg-charcoal-dark/50 transition-all duration-300",
                     "hover:border-primary/30 hover:bg-charcoal/80"
                   )}
                 >
                   {/* Glow effect on hover */}
                   <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                     style={{ boxShadow: "inset 0 0 30px hsl(var(--primary) / 0.05)" }}
                   />
                   
                   <div className="flex gap-4 relative z-10">
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
                           nameClassName="text-sm font-bold"
                         />
                         {post.author?.role === 'admin' && (
                           <Badge className="bg-destructive/20 text-destructive text-xs px-1.5 border border-destructive/30">
                             <GraduationCap className="h-3 w-3" />
                           </Badge>
                         )}
                         {post.author?.role === 'professor' && (
                           <Badge className="bg-primary/20 text-primary text-xs px-1.5 border border-primary/30">
                             <GraduationCap className="h-3 w-3" />
                           </Badge>
                         )}
                         {post.author?.role === 'moderator' && (
                           <Badge className="bg-accent/20 text-accent text-xs px-1.5 border border-accent/30">
                             <Shield className="h-3 w-3" />
                           </Badge>
                         )}
                         <span className="text-xs text-muted-foreground font-mono">
                           {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                         </span>
                       </div>
                       
                       <p className="text-sm text-foreground mt-2 whitespace-pre-wrap leading-relaxed">
                         {post.content}
                       </p>
                       
                       {/* Post Actions - Enhanced */}
                       <div className="flex items-center gap-5 mt-4 pt-3 border-t border-border/50">
                         <button
                           onClick={() => toggleLike.mutate(post.id)}
                           className={cn(
                             "flex items-center gap-1.5 text-xs font-medium transition-all duration-300",
                             post.user_has_liked 
                               ? "text-red-500" 
                               : "text-muted-foreground hover:text-red-500"
                           )}
                         >
                           <Heart className={cn(
                             "h-4 w-4 transition-transform duration-300",
                             post.user_has_liked && "fill-current scale-110"
                           )} />
                           <span>{post.likes_count > 0 ? post.likes_count : "Like"}</span>
                         </button>
                         
                         <button
                           onClick={() => handlePostClick(post.id)}
                           className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                         >
                           <MessageSquare className="h-4 w-4" />
                           <span>{post.comments_count > 0 ? post.comments_count : "Comment"}</span>
                         </button>
                         
                         {canDeletePost(post.user_id) && (
                           <button
                             onClick={() => deleteWallPost.mutate(post.id)}
                             className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors ml-auto opacity-0 group-hover:opacity-100"
                           >
                             <Trash2 className="h-4 w-4" />
                           </button>
                         )}
                       </div>
                     </div>
                   </div>
                 </motion.div>
               ))}
             </div>
           )}
         </CardContent>
       </Card>
     </motion.div>
   );
 }