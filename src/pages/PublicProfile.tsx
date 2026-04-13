import { Helmet } from "react-helmet-async";
import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, Pencil, Home, MoreHorizontal, ShieldOff, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageLayout } from "@/components/layout";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { PublicProfileCard } from "@/components/profile/PublicProfileCard";
import { ProfileWall } from "@/components/profile/ProfileWall";
import { ProfileAcademicStats, ProfileAchievements, ProfileGallery, FeaturedProjectShowcase } from "@/components/profile";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { useProfileAchievements } from "@/hooks/useProfileAchievements";
import { useAuth } from "@/contexts/AuthContext";
import { useFriendships } from "@/hooks/useFriendships";
import { useConversations } from "@/hooks/useConversations";
import { useUserSafety } from "@/hooks/useUserSafety";
import { BlockUserDialog } from "@/components/safety/BlockUserDialog";
import { ReportUserDialog } from "@/components/safety/ReportUserDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
 
 export default function PublicProfile() {
   const { userId } = useParams<{ userId: string }>();
   const navigate = useNavigate();
   const { user } = useAuth();
   const { profile, role, isOwnProfile, isFriend, isLoading, error } = usePublicProfile(userId ?? null);
  const { achievements, stats, isLoading: achievementsLoading } = useProfileAchievements(userId ?? null);
   const { sendFriendRequest, hasPendingRequest: checkPendingRequest, loading: friendshipLoading } = useFriendships();
   const { getOrCreateConversation } = useConversations();
 
    const { blockUser, unblockUser, reportUser, isBlocked } = useUserSafety();
    const [showBlockDialog, setShowBlockDialog] = useState(false);
    const [showReportDialog, setShowReportDialog] = useState(false);

    const hasPendingRequest = userId ? checkPendingRequest(userId) : false;
    const userIsBlocked = userId ? isBlocked(userId) : false;
  
   const handleAddFriend = async () => {
     if (userId) {
       await sendFriendRequest(userId);
     }
   };
 
   const handleMessage = async () => {
     if (userId) {
       const conversationId = await getOrCreateConversation(userId);
       if (conversationId) {
         navigate(`/messages?conversation=${conversationId}`);
       }
     }
   };
 
  const handleEditProfile = () => {
    navigate("/student/profile");
  };

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${userId}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

   const handleGoBack = () => {
     if (isOwnProfile) {
       navigate("/student");
     } else {
       navigate(-1);
     }
   };
 
  // Get section order with fallback
  const sectionOrder = useMemo(() => {
    return profile?.profile_section_order ?? ["stats", "achievements", "gallery", "wall"];
  }, [profile?.profile_section_order]);

  // Render sections dynamically based on order
  const renderSection = (sectionId: string, index: number) => {
    const delay = 0.3 + index * 0.1;
    
    switch (sectionId) {
      case "stats":
        return (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="mb-8"
          >
            <ProfileAcademicStats stats={stats} isLoading={achievementsLoading} />
          </motion.div>
        );
      case "achievements":
        return (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="mb-8"
          >
            <ProfileAchievements achievements={achievements} isLoading={achievementsLoading} />
          </motion.div>
        );
      case "gallery":
        return (
          <motion.div
            key="gallery"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="mb-8"
          >
            <ProfileGallery 
              gallery={profile?.portfolio_gallery || []} 
              isOwnProfile={isOwnProfile}
              profileUserId={userId}
            />
          </motion.div>
        );
      case "wall":
        return (
          <motion.div
            key="wall"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
          >
            <ProfileWall 
              profileUserId={userId!}
              profileDisplayName={profile?.display_name || ""}
              isOwnProfile={isOwnProfile}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

   if (!user) {
     return (
       <PageLayout>
         <div className="container max-w-5xl py-8">
           <div className="text-center py-12">
             <p className="text-muted-foreground mb-4">Please log in to view profiles.</p>
             <Button onClick={() => navigate("/auth")}>Log In</Button>
           </div>
         </div>
       </PageLayout>
     );
   }
 
   if (isLoading) {
     return (
       <PageLayout>
         <div className="container max-w-5xl py-8">
           {/* Enhanced loading skeleton with shimmer */}
           <div className="space-y-8">
             <div className="relative h-56 md:h-72 bg-charcoal rounded-xl overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-charcoal-light/30 to-transparent animate-shimmer" 
                 style={{ 
                   backgroundSize: "200% 100%",
                   animation: "shimmer 1.5s infinite"
                 }} 
               />
             </div>
             <div className="flex flex-col items-center md:items-start md:flex-row gap-6 -mt-20 px-6">
               <div className="h-36 w-36 bg-charcoal-light rounded-full animate-pulse ring-4 ring-background" />
               <div className="flex-1 space-y-4 pt-12 text-center md:text-left">
                 <div className="h-8 bg-charcoal-light rounded w-1/3 mx-auto md:mx-0 animate-pulse" />
                 <div className="h-4 bg-charcoal-light rounded w-1/4 mx-auto md:mx-0 animate-pulse" />
               </div>
             </div>
             <div className="grid md:grid-cols-2 gap-4 px-6">
               {[1, 2].map((i) => (
                 <div key={i} className="h-32 bg-charcoal rounded-lg animate-pulse" />
               ))}
             </div>
           </div>
         </div>
       </PageLayout>
     );
   }
 
   if (error || !profile) {
     return (
       <PageLayout>
         <div className="container max-w-5xl py-8">
           <Button
             variant="ghost"
             onClick={() => navigate("/student")}
             className="mb-6"
           >
             <ArrowLeft className="h-4 w-4 mr-2" />
             Back to Student Hub
           </Button>
           <div className="text-center py-12">
             <p className="text-muted-foreground">Profile not found or you don't have permission to view it.</p>
           </div>
         </div>
       </PageLayout>
     );
   }
 
   return (
     <PageLayout>
      <Helmet>
        <title>Student Profile | Hoodtorial University</title>
        <meta name="description" content="View student academic profiles, achievements, and progress at Hoodtorial University." />
        <meta property="og:title" content="Student Profile | Hoodtorial University" />
        <meta property="og:description" content="View student academic profiles, achievements, and progress at Hoodtorial University." />
        <meta property="og:image" content="https://hoodtorialuniversity.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
       {/* Background effects */}
       <div className="fixed inset-0 pointer-events-none overflow-hidden">
         {/* Animated orbs */}
         <motion.div
           className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
           animate={{ 
             x: [0, 50, 0],
             y: [0, 30, 0],
             opacity: [0.3, 0.5, 0.3]
           }}
           transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
         />
         <motion.div
           className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-neon-purple/5 blur-3xl"
           animate={{ 
             x: [0, -40, 0],
             y: [0, -30, 0],
             opacity: [0.2, 0.4, 0.2]
           }}
           transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
         />
         {/* Grid overlay */}
         <div className="absolute inset-0 bg-grid opacity-30" />
       </div>

       <div className="container max-w-5xl py-8 relative z-10">
          {/* Breadcrumb navigation */}
          {isOwnProfile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
            >
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/student" className="hover:text-primary transition-colors">Student Hub</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>My Profile</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </motion.div>
          )}
 
         <motion.div
           initial={{ opacity: 0, x: -10 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.3 }}
            className="flex items-center justify-between mb-6"
         >
           <Button
             variant="ghost"
             onClick={handleGoBack}
             className="hover:bg-charcoal-light"
           >
             <ArrowLeft className="h-4 w-4 mr-2" />
             {isOwnProfile ? "Student Hub" : "Back"}
           </Button>
            
             {isOwnProfile ? (
               <Button
                 variant="outline"
                 size="sm"
                 onClick={handleEditProfile}
                 className="gap-2"
               >
                 <Pencil className="h-4 w-4" />
                 Edit Profile
               </Button>
             ) : (
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon">
                     <MoreHorizontal className="h-5 w-5" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end">
                   <DropdownMenuItem onClick={() => setShowBlockDialog(true)}>
                     <ShieldOff className="h-4 w-4 mr-2" />
                     {userIsBlocked ? "Unblock User" : "Block User"}
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="text-destructive">
                     <Flag className="h-4 w-4 mr-2" />
                     Report User
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
             )}
          </motion.div>
 
         {/* Own profile indicator */}
         {isOwnProfile && (
           <motion.div
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.4, delay: 0.2 }}
           >
             <Alert className="mb-6 bg-charcoal/80 border-2 border-primary/30 backdrop-blur-sm">
               <Eye className="h-4 w-4 text-primary" />
               <AlertDescription className="text-foreground">
                 This is how others see your profile. Edit your profile to make changes.
               </AlertDescription>
             </Alert>
           </motion.div>
         )}

         <PublicProfileCard
           profile={profile}
           role={role}
           isOwnProfile={isOwnProfile}
           isFriend={isFriend}
           onAddFriend={handleAddFriend}
           onMessage={handleMessage}
           isAddingFriend={friendshipLoading}
           hasPendingRequest={hasPendingRequest}
           onEditProfile={handleEditProfile}
           onShareProfile={handleShareProfile}
         />
 
         <div className="px-4 md:px-6 mt-8">
          {/* Dynamic sections based on user's order preference */}
          {sectionOrder.map((sectionId, index) => renderSection(sectionId, index))}
         </div>
        </div>

        {userId && !isOwnProfile && (
          <>
            <BlockUserDialog
              open={showBlockDialog}
              onOpenChange={setShowBlockDialog}
              userName={profile?.display_name || "this user"}
              isBlocked={userIsBlocked}
              onConfirm={() => {
                if (userIsBlocked) {
                  unblockUser(userId);
                } else {
                  blockUser(userId);
                }
                setShowBlockDialog(false);
              }}
            />
            <ReportUserDialog
              open={showReportDialog}
              onOpenChange={setShowReportDialog}
              userName={profile?.display_name || "this user"}
              onSubmit={(reason, details) => reportUser(userId, reason, details)}
            />
          </>
        )}
      </PageLayout>
    );
  }