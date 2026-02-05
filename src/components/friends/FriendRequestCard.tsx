 import { Check, X } from "lucide-react";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Button } from "@/components/ui/button";
 import { Card } from "@/components/ui/card";
 import { useFriendships, FriendProfile } from "@/hooks/useFriendships";
 import { formatDistanceToNow } from "date-fns";
 
 interface FriendRequestCardProps {
   request: {
     id: string;
     sender_id: string;
     created_at: string;
     sender: FriendProfile;
   };
 }
 
 export function FriendRequestCard({ request }: FriendRequestCardProps) {
   const { acceptFriendRequest, declineFriendRequest } = useFriendships();
 
   const handleAccept = async () => {
     await acceptFriendRequest(request.id, request.sender_id);
   };
 
   const handleDecline = async () => {
     await declineFriendRequest(request.id);
   };
 
   const getInitials = (name?: string | null) => {
     if (!name) return "?";
     return name
       .split(" ")
       .map((n) => n.charAt(0))
       .join("")
       .toUpperCase()
       .slice(0, 2);
   };
 
   return (
     <Card className="p-4 flex items-center gap-4">
       <Avatar className="h-12 w-12 border-2 border-primary/20">
         <AvatarImage src={request.sender.avatar_url || undefined} />
         <AvatarFallback className="bg-primary/10 text-primary font-bold">
           {getInitials(request.sender.display_name)}
         </AvatarFallback>
       </Avatar>
 
       <div className="flex-1 min-w-0">
         <p className="font-semibold truncate">
           {request.sender.display_name || "Unknown User"}
         </p>
         <p className="text-sm text-muted-foreground">
           {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
         </p>
       </div>
 
       <div className="flex gap-2">
         <Button size="sm" onClick={handleAccept}>
           <Check className="h-4 w-4 mr-1" />
           Accept
         </Button>
         <Button size="sm" variant="ghost" onClick={handleDecline}>
           <X className="h-4 w-4" />
         </Button>
       </div>
     </Card>
   );
 }