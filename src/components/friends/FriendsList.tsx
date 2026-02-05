 import { useState, useMemo } from "react";
 import { Users, Search, X } from "lucide-react";
 import { useFriendships } from "@/hooks/useFriendships";
 import { FriendCard } from "./FriendCard";
 import { Skeleton } from "@/components/ui/skeleton";
 import { Input } from "@/components/ui/input";
 import { Button } from "@/components/ui/button";
 
 export function FriendsList() {
   const { friends, loading } = useFriendships();
   const [searchQuery, setSearchQuery] = useState("");
 
   const filteredFriends = useMemo(() => {
     if (!searchQuery.trim()) return friends;
     return friends.filter((friend) =>
       friend.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
     );
   }, [friends, searchQuery]);
 
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
     <div className="space-y-4">
       {/* Search Input */}
       <div className="relative">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
         <Input
           placeholder="Search friends..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="pl-9 pr-9"
         />
         {searchQuery && (
           <Button
             variant="ghost"
             size="icon"
             className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
             onClick={() => setSearchQuery("")}
           >
             <X className="h-4 w-4" />
           </Button>
         )}
       </div>
 
       {/* Friends List */}
       {filteredFriends.length === 0 ? (
         <div className="text-center py-8">
           <Search className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
           <p className="text-muted-foreground">
             No friends matching "{searchQuery}"
           </p>
         </div>
       ) : (
         <div className="space-y-3">
           {filteredFriends.map((friend) => (
             <FriendCard key={friend.user_id} friend={friend} />
           ))}
         </div>
       )}
     </div>
   );
 }