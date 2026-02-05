 import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
 import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
 import { PageLayout } from "@/components/layout";
 import { PublicProfileCard } from "@/components/profile/PublicProfileCard";
import { ProfileWall } from "@/components/profile/ProfileWall";
 import { usePublicProfile } from "@/hooks/usePublicProfile";
 import { useAuth } from "@/contexts/AuthContext";
 import { useFriendships } from "@/hooks/useFriendships";
 import { useConversations } from "@/hooks/useConversations";
import { toast } from "sonner";
 
 export default function PublicProfile() {
   const { userId } = useParams<{ userId: string }>();
   const navigate = useNavigate();
   const { user } = useAuth();
   const { profile, role, isOwnProfile, isFriend, isLoading, error } = usePublicProfile(userId ?? null);
   const { sendFriendRequest, hasPendingRequest: checkPendingRequest, loading: friendshipLoading } = useFriendships();
   const { getOrCreateConversation } = useConversations();
 
   const hasPendingRequest = userId ? checkPendingRequest(userId) : false;
 
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

   if (!user) {
     return (
       <PageLayout>
         <div className="container max-w-4xl py-8">
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
         <div className="container max-w-4xl py-8">
           <div className="animate-pulse space-y-6">
             <div className="h-48 bg-muted rounded-xl" />
             <div className="flex gap-6">
               <div className="h-32 w-32 bg-muted rounded-full" />
               <div className="flex-1 space-y-4 pt-16">
                 <div className="h-8 bg-muted rounded w-1/3" />
                 <div className="h-4 bg-muted rounded w-1/4" />
               </div>
             </div>
           </div>
         </div>
       </PageLayout>
     );
   }
 
   if (error || !profile) {
     return (
       <PageLayout>
         <div className="container max-w-4xl py-8">
           <Button
             variant="ghost"
             onClick={() => navigate(-1)}
             className="mb-6"
           >
             <ArrowLeft className="h-4 w-4 mr-2" />
             Back
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
       <div className="container max-w-4xl py-8">
         <Button
           variant="ghost"
           onClick={() => navigate(-1)}
           className="mb-6"
         >
           <ArrowLeft className="h-4 w-4 mr-2" />
           Back
         </Button>

          {isOwnProfile && (
            <Alert className="mb-6 bg-muted/50 border-primary/20">
              <Eye className="h-4 w-4" />
              <AlertDescription>
                This is how others see your profile. Edit your profile to make changes.
              </AlertDescription>
            </Alert>
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

          <ProfileWall 
            profileUserId={userId!}
            profileDisplayName={profile.display_name}
            isOwnProfile={isOwnProfile}
          />
       </div>
     </PageLayout>
   );
 }