 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent } from "@/components/ui/card";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { 
   Camera, 
   Film, 
   Sparkles, 
   Globe, 
   Instagram, 
   Youtube, 
   Twitter,
   GraduationCap,
   Shield,
   FlaskConical,
   UserPlus,
   MessageCircle,
  ExternalLink,
  Pencil,
  Share2
 } from "lucide-react";
 import { PublicProfile, UserRole } from "@/hooks/usePublicProfile";
 import { cn } from "@/lib/utils";
 
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
     className: "bg-destructive/20 text-destructive" 
   },
   professor: { 
     label: "Professor", 
     icon: <GraduationCap className="h-3 w-3 mr-1" />, 
     className: "bg-primary/20 text-primary" 
   },
   moderator: { 
     label: "Moderator", 
     icon: <Shield className="h-3 w-3 mr-1" />, 
     className: "bg-accent/20 text-accent" 
   },
   tester: { 
     label: "Tester", 
     icon: <FlaskConical className="h-3 w-3 mr-1" />, 
     className: "bg-violet-500/20 text-violet-400" 
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
   const getInitials = (name?: string | null) => {
     if (!name) return "?";
     return name
       .split(" ")
       .map((n) => n.charAt(0))
       .join("")
       .toUpperCase()
       .slice(0, 2);
   };
 
   const roleBadge = roleBadges[role];
 
   const socialLinks = [
     { url: profile.portfolio_url, icon: <Globe className="h-4 w-4" />, label: "Portfolio" },
     { url: profile.instagram_url, icon: <Instagram className="h-4 w-4" />, label: "Instagram" },
     { url: profile.youtube_url, icon: <Youtube className="h-4 w-4" />, label: "YouTube" },
     { url: profile.vimeo_url, icon: <Film className="h-4 w-4" />, label: "Vimeo" },
     { url: profile.twitter_url, icon: <Twitter className="h-4 w-4" />, label: "Twitter" },
     { url: profile.imdb_url, icon: <ExternalLink className="h-4 w-4" />, label: "IMDb" },
   ].filter(link => link.url);
 
   return (
     <div className="space-y-6">
       {/* Cover Banner */}
       <div className="relative h-48 md:h-64 rounded-xl overflow-hidden bg-muted">
         {profile.cover_banner_url ? (
           <img
             src={profile.cover_banner_url}
             alt="Cover"
             className="w-full h-full object-cover"
           />
         ) : (
           <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
         )}
       </div>
 
       {/* Profile Header */}
       <div className="flex flex-col md:flex-row gap-6 items-start -mt-20 px-4 md:px-6">
         <Avatar 
           className={cn(
             "h-32 w-32 border-4 border-background shadow-xl",
             profile.avatar_border_style === "gradient" && "ring-2 ring-primary",
             profile.avatar_border_style === "gold" && "ring-2 ring-yellow-500"
           )}
           style={profile.profile_accent_color ? { borderColor: profile.profile_accent_color } : undefined}
         >
           <AvatarImage src={profile.avatar_url || undefined} />
           <AvatarFallback className="bg-primary/10 text-primary font-bold text-3xl">
             {getInitials(profile.display_name)}
           </AvatarFallback>
         </Avatar>
 
         <div className="flex-1 pt-4 md:pt-16">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
               <div className="flex items-center gap-3 flex-wrap">
                 <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                   {profile.display_name || "Anonymous"}
                 </h1>
                 {roleBadge && (
                   <Badge className={cn("text-xs", roleBadge.className)}>
                     {roleBadge.icon}
                     {roleBadge.label}
                   </Badge>
                 )}
               </div>
               {profile.filmmaking_style && (
                 <p className="text-muted-foreground mt-1">
                   🎬 {profile.filmmaking_style}
                 </p>
               )}
             </div>
 
              {isOwnProfile ? (
                <div className="flex gap-2">
                  <Button onClick={onEditProfile} variant="default">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button onClick={onShareProfile} variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              ) : (
               <div className="flex gap-2">
                 {isFriend ? (
                   <Button onClick={onMessage} variant="default">
                     <MessageCircle className="h-4 w-4 mr-2" />
                     Message
                   </Button>
                 ) : (
                   <Button 
                     onClick={onAddFriend} 
                     variant="default"
                     disabled={isAddingFriend || hasPendingRequest}
                   >
                     <UserPlus className="h-4 w-4 mr-2" />
                     {hasPendingRequest ? "Request Sent" : "Add Friend"}
                   </Button>
                 )}
               </div>
             )}
           </div>
         </div>
       </div>
 
       {/* Bio */}
       {profile.bio && (
         <Card className="card-urban">
           <CardContent className="pt-6">
             <p className="text-foreground leading-relaxed">{profile.bio}</p>
           </CardContent>
         </Card>
       )}
 
       {/* Creative Info Grid */}
       <div className="grid md:grid-cols-2 gap-4">
         {/* Camera Gear */}
         {profile.camera_gear && (
           <Card className="card-urban">
             <CardContent className="pt-6">
               <div className="flex items-center gap-2 text-muted-foreground mb-2">
                 <Camera className="h-4 w-4" />
                 <span className="text-sm font-medium">Camera Gear</span>
               </div>
               <p className="text-foreground">{profile.camera_gear}</p>
             </CardContent>
           </Card>
         )}
 
         {/* Current Project */}
         {profile.current_project && (
           <Card className="card-urban">
             <CardContent className="pt-6">
               <div className="flex items-center gap-2 text-muted-foreground mb-2">
                 <Film className="h-4 w-4" />
                 <span className="text-sm font-medium">Current Project</span>
               </div>
               <p className="text-foreground">{profile.current_project}</p>
             </CardContent>
           </Card>
         )}
 
         {/* Influences */}
         {profile.influences && (
           <Card className="card-urban">
             <CardContent className="pt-6">
               <div className="flex items-center gap-2 text-muted-foreground mb-2">
                 <Sparkles className="h-4 w-4" />
                 <span className="text-sm font-medium">Influences</span>
               </div>
               <p className="text-foreground">{profile.influences}</p>
             </CardContent>
           </Card>
         )}
 
         {/* Favorite Films */}
         {profile.favorite_films && profile.favorite_films.length > 0 && (
           <Card className="card-urban">
             <CardContent className="pt-6">
               <div className="flex items-center gap-2 text-muted-foreground mb-3">
                 <Film className="h-4 w-4" />
                 <span className="text-sm font-medium">Favorite Films</span>
               </div>
               <div className="flex flex-wrap gap-2">
                 {profile.favorite_films.map((film, index) => (
                   <Badge key={index} variant="secondary" className="text-xs">
                     {film}
                   </Badge>
                 ))}
               </div>
             </CardContent>
           </Card>
         )}
       </div>
 
       {/* Social Links */}
       {socialLinks.length > 0 && (
         <Card className="card-urban">
           <CardContent className="pt-6">
             <div className="flex items-center gap-2 text-muted-foreground mb-4">
               <Globe className="h-4 w-4" />
               <span className="text-sm font-medium">Connect</span>
             </div>
             <div className="flex flex-wrap gap-3">
               {socialLinks.map((link, index) => (
                 <a
                   key={index}
                   href={link.url!}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                 >
                   {link.icon}
                   <span className="text-sm">{link.label}</span>
                 </a>
               ))}
             </div>
           </CardContent>
         </Card>
       )}
     </div>
   );
 }