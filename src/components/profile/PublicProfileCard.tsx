 import { motion } from "framer-motion";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { 
   Camera, 
   Film, 
   Sparkles, 
   Clapperboard,
   GraduationCap,
   Shield,
   FlaskConical,
   UserPlus,
   MessageCircle,
   Pencil,
   Share2
 } from "lucide-react";
 import { PublicProfile, UserRole } from "@/hooks/usePublicProfile";
 import { cn } from "@/lib/utils";
 import { ProfileCoverBanner } from "./ProfileCoverBanner";
 import { ProfileAvatar } from "./ProfileAvatar";
 import { ProfileInfoCard } from "./ProfileInfoCard";
 import { ProfileSocialLinks } from "./ProfileSocialLinks";
 
 interface PublicProfileCardProps {
   profile: PublicProfile;
   role: UserRole;
   isOwnProfile: boolean;
   isFriend: boolean;
   onAddFriend?: () => void;
   onMessage?: () => void;
   isAddingFriend?: boolean;
   hasPendingRequest?: boolean;
   onEditProfile?: () => void;
   onShareProfile?: () => void;
 }
 
 const roleBadges: Record<UserRole, { label: string; icon: React.ReactNode; className: string } | null> = {
   admin: { 
     label: "Admin", 
     icon: <GraduationCap className="h-3 w-3 mr-1" />, 
     className: "bg-destructive/20 text-destructive border-destructive/30" 
   },
   professor: { 
     label: "Professor", 
     icon: <GraduationCap className="h-3 w-3 mr-1" />, 
     className: "bg-primary/20 text-primary border-primary/30" 
   },
   moderator: { 
     label: "Moderator", 
     icon: <Shield className="h-3 w-3 mr-1" />, 
     className: "bg-accent/20 text-accent border-accent/30" 
   },
   tester: { 
     label: "Tester", 
     icon: <FlaskConical className="h-3 w-3 mr-1" />, 
     className: "bg-neon-purple/20 text-neon-purple border-neon-purple/30" 
   },
   student: null,
 };
 
 export function PublicProfileCard({
   profile,
   role,
   isOwnProfile,
   isFriend,
   onAddFriend,
   onMessage,
   isAddingFriend,
   hasPendingRequest,
   onEditProfile,
   onShareProfile,
 }: PublicProfileCardProps) {
   const roleBadge = roleBadges[role];
   const isSpecialRole = role === "admin" || role === "professor";
 
   // Collect info cards data
   const infoCards = [
     profile.camera_gear && {
       icon: <Camera className="h-5 w-5" />,
       label: "Camera Gear",
       content: profile.camera_gear
     },
     profile.current_project && {
       icon: <Clapperboard className="h-5 w-5" />,
       label: "Current Project",
       content: profile.current_project
     },
     profile.influences && {
       icon: <Sparkles className="h-5 w-5" />,
       label: "Influences",
       content: profile.influences
     },
     profile.favorite_films && profile.favorite_films.length > 0 && {
       icon: <Film className="h-5 w-5" />,
       label: "Favorite Films",
       content: profile.favorite_films
     }
   ].filter(Boolean);
 
   return (
     <div className="space-y-8">
       {/* Cover Banner */}
       <ProfileCoverBanner 
         coverUrl={profile.cover_banner_url} 
         accentColor={profile.profile_accent_color}
       />
 
       {/* Profile Header - Avatar & Identity */}
       <div className="relative -mt-24 px-4 md:px-6">
         <div className="flex flex-col items-center md:items-start md:flex-row gap-6">
           {/* Avatar with glow effects */}
           <ProfileAvatar
             avatarUrl={profile.avatar_url}
             displayName={profile.display_name}
             accentColor={profile.profile_accent_color}
             borderStyle={profile.avatar_border_style}
           />
 
           {/* Identity & Actions */}
           <div className="flex-1 text-center md:text-left pt-4 md:pt-12">
             {/* Role sticker badge - floating style */}
             {roleBadge && (
               <motion.div
                 initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                 animate={{ opacity: 1, scale: 1, rotate: -2 }}
                 transition={{ duration: 0.3, delay: 0.4 }}
                 className="inline-block mb-3"
               >
                 <Badge className={cn(
                   "text-xs font-black uppercase tracking-wider border px-3 py-1",
                   roleBadge.className
                 )}>
                   {roleBadge.icon}
                   {roleBadge.label}
                 </Badge>
               </motion.div>
             )}
 
             {/* Name with optional gold gradient */}
             <motion.h1
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.5, delay: 0.3 }}
               className={cn(
                 "text-3xl md:text-4xl font-black tracking-tight",
                 isSpecialRole ? "text-gold-gradient" : "text-foreground"
               )}
             >
               {profile.display_name || "Anonymous"}
             </motion.h1>
 
             {/* Filmmaking style */}
             {profile.filmmaking_style && (
               <motion.p
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ duration: 0.5, delay: 0.4 }}
                 className="text-muted-foreground mt-2 flex items-center justify-center md:justify-start gap-2"
               >
                 <span className="text-primary">🎬</span> {profile.filmmaking_style}
               </motion.p>
             )}
 
             {/* Action buttons */}
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.4, delay: 0.5 }}
               className="mt-5"
             >
               {isOwnProfile ? (
                 <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                   <Button 
                     onClick={onEditProfile} 
                     className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                   >
                     <Pencil className="h-4 w-4 mr-2" />
                     Edit Profile
                   </Button>
                   <Button 
                     onClick={onShareProfile} 
                     variant="outline"
                     className="border-2 border-border hover:border-primary hover:bg-primary/10"
                   >
                     <Share2 className="h-4 w-4 mr-2" />
                     Share
                   </Button>
                 </div>
               ) : (
                 <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                   {isFriend ? (
                     <Button 
                       onClick={onMessage}
                       className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                     >
                       <MessageCircle className="h-4 w-4 mr-2" />
                       Message
                     </Button>
                   ) : (
                     <Button 
                       onClick={onAddFriend}
                       disabled={isAddingFriend || hasPendingRequest}
                       className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold disabled:opacity-50"
                     >
                       <UserPlus className="h-4 w-4 mr-2" />
                       {hasPendingRequest ? "Request Sent" : "Add Friend"}
                     </Button>
                   )}
                 </div>
               )}
             </motion.div>
           </div>
         </div>
       </div>
 
       {/* Bio Section - Quote style */}
       {profile.bio && (
         <motion.div
           initial={{ opacity: 0, x: -30 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, delay: 0.4 }}
           className="relative px-4 md:px-6"
         >
           <div className={cn(
             "relative p-6 rounded-lg",
             "bg-charcoal/50 border-l-4 border-primary"
           )}>
             {/* Decorative quote mark */}
             <span className="absolute -top-2 -left-1 text-4xl text-primary/30 font-serif">❝</span>
             <p className="text-foreground leading-relaxed text-lg italic pl-4">
               {profile.bio}
             </p>
             <span className="absolute -bottom-4 right-4 text-4xl text-primary/30 font-serif">❞</span>
           </div>
         </motion.div>
       )}
 
       {/* Creative Info Cards - 3D Tilt Grid */}
       {infoCards.length > 0 && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 md:px-6">
           {infoCards.map((card, index) => (
             <ProfileInfoCard
               key={card.label}
               icon={card.icon}
               label={card.label}
               delay={0.4 + (index * 0.1)}
               accentColor={profile.profile_accent_color || undefined}
             >
               {Array.isArray(card.content) ? (
                 <div className="flex flex-wrap gap-2">
                   {card.content.map((item, i) => (
                     <Badge 
                       key={i} 
                       variant="secondary" 
                       className="bg-charcoal-light border border-border text-xs font-medium hover:border-primary/50 transition-colors"
                     >
                       {item}
                     </Badge>
                   ))}
                 </div>
               ) : (
                 <p>{card.content}</p>
               )}
             </ProfileInfoCard>
           ))}
         </div>
       )}
 
       {/* Social Links - Circular icons with glow */}
       <div className="px-4 md:px-6">
         <ProfileSocialLinks
           portfolioUrl={profile.portfolio_url}
           instagramUrl={profile.instagram_url}
           youtubeUrl={profile.youtube_url}
           vimeoUrl={profile.vimeo_url}
           twitterUrl={profile.twitter_url}
           imdbUrl={profile.imdb_url}
         />
       </div>
     </div>
   );
 }