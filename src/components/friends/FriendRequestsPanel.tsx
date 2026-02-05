 import { Bell } from "lucide-react";
 import { useFriendships } from "@/hooks/useFriendships";
 import { FriendRequestCard } from "./FriendRequestCard";
 import { Skeleton } from "@/components/ui/skeleton";
 
 export function FriendRequestsPanel() {
   const { incomingRequests, loading } = useFriendships();
 
   if (loading) {
     return (
       <div className="space-y-3">
         {[1, 2].map((i) => (
           <Skeleton key={i} className="h-20 w-full" />
         ))}
       </div>
     );
   }
 
   if (incomingRequests.length === 0) {
     return (
       <div className="text-center py-8">
         <Bell className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
         <p className="text-muted-foreground">No pending friend requests</p>
       </div>
     );
   }
 
   return (
     <div className="space-y-3">
       {incomingRequests.map((request) => (
         <FriendRequestCard key={request.id} request={request} />
       ))}
     </div>
   );
 }