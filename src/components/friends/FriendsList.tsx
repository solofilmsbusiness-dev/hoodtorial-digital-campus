 import { Users } from "lucide-react";
 import { useFriendships } from "@/hooks/useFriendships";
 import { FriendCard } from "./FriendCard";
 import { Skeleton } from "@/components/ui/skeleton";
 
 export function FriendsList() {
   const { friends, loading } = useFriendships();
 
   if (loading) {
     return (
       <div className="space-y-3">
         {[1, 2, 3].map((i) => (
           <Skeleton key={i} className="h-20 w-full" />
         ))}
       </div>
     );
   }
 
   if (friends.length === 0) {
     return (
       <div className="text-center py-12">
         <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
         <h3 className="text-lg font-semibold mb-2">No Friends Yet</h3>
         <p className="text-muted-foreground">
           Start connecting with other students in the community!
         </p>
       </div>
     );
   }
 
   return (
     <div className="space-y-3">
       {friends.map((friend) => (
         <FriendCard key={friend.user_id} friend={friend} />
       ))}
     </div>
   );
 }