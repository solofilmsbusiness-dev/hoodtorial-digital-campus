 import { UserPlus, Clock, Check, UserMinus } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { useFriendships } from "@/hooks/useFriendships";
 import { useAuth } from "@/contexts/AuthContext";
 import { cn } from "@/lib/utils";
 
 interface AddFriendButtonProps {
   userId: string;
   size?: "sm" | "default" | "lg" | "icon";
   variant?: "default" | "ghost" | "outline";
   className?: string;
   showLabel?: boolean;
 }
 
 export function AddFriendButton({
   userId,
   size = "sm",
   variant = "ghost",
   className,
   showLabel = true,
 }: AddFriendButtonProps) {
   const { user } = useAuth();
   const { sendFriendRequest, getRequestStatus, acceptFriendRequest, incomingRequests } = useFriendships();
 
   if (!user || user.id === userId) return null;
 
   const status = getRequestStatus(userId);
 
   const handleClick = async (e: React.MouseEvent) => {
     e.stopPropagation();
     e.preventDefault();
 
     if (status === "received") {
       const request = incomingRequests.find((r) => r.sender_id === userId);
       if (request) {
         await acceptFriendRequest(request.id, userId);
       }
     } else if (status === "none") {
       await sendFriendRequest(userId);
     }
   };
 
   if (status === "friend") {
     return (
       <Button
         size={size}
         variant="ghost"
         className={cn("text-muted-foreground cursor-default", className)}
         disabled
       >
         <Check className="h-4 w-4" />
         {showLabel && <span className="ml-1">Friends</span>}
       </Button>
     );
   }
 
   if (status === "sent") {
     return (
       <Button
         size={size}
         variant="ghost"
         className={cn("text-muted-foreground cursor-default", className)}
         disabled
       >
         <Clock className="h-4 w-4" />
         {showLabel && <span className="ml-1">Pending</span>}
       </Button>
     );
   }
 
   if (status === "received") {
     return (
       <Button
         size={size}
         variant="default"
         className={cn(className)}
         onClick={handleClick}
       >
         <Check className="h-4 w-4" />
         {showLabel && <span className="ml-1">Accept</span>}
       </Button>
     );
   }
 
   return (
     <Button
       size={size}
       variant={variant}
       className={cn(className)}
       onClick={handleClick}
     >
       <UserPlus className="h-4 w-4" />
       {showLabel && <span className="ml-1">Add Friend</span>}
     </Button>
   );
 }