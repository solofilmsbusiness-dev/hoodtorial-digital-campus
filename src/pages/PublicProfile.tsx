 import { useParams, useNavigate } from "react-router-dom";
 import { ArrowLeft } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { PageLayout } from "@/components/layout";
 import { PublicProfileCard } from "@/components/profile/PublicProfileCard";
 import { usePublicProfile } from "@/hooks/usePublicProfile";
 import { useAuth } from "@/contexts/AuthContext";
 import { useFriendships } from "@/hooks/useFriendships";
 import { useConversations } from "@/hooks/useConversations";
 import { useEffect } from "react";
 
 export default function PublicProfile() {
   const { userId } = useParams<{ userId: string }>();
   const navigate = useNavigate();
   const { user } = useAuth();
   const { profile, role, isOwnProfile, isFriend, isLoading, error } = usePublicProfile(userId ?? null);
   const { sendFriendRequest, hasPendingRequest: checkPendingRequest, loading: friendshipLoading } = useFriendships();
   const { getOrCreateConversation } = useConversations();
 
   // Redirect to own profile page if viewing own profile
   useEffect(() => {
     if (isOwnProfile && !isLoading) {
       navigate("/student/profile", { replace: true });
     }
   }, [isOwnProfile, isLoading, navigate]);
 
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
 
         <PublicProfileCard
           profile={profile}
           role={role}
           isOwnProfile={isOwnProfile}
           isFriend={isFriend}
           onAddFriend={handleAddFriend}
           onMessage={handleMessage}
           isAddingFriend={friendshipLoading}
           hasPendingRequest={hasPendingRequest}
         />
       </div>
     </PageLayout>
   );
 }