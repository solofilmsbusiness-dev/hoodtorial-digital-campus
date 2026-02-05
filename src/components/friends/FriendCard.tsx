 import { MessageCircle, UserMinus } from "lucide-react";
 import { useNavigate } from "react-router-dom";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Button } from "@/components/ui/button";
 import { Card } from "@/components/ui/card";
 import { useFriendships, FriendProfile } from "@/hooks/useFriendships";
 import { useConversations } from "@/hooks/useConversations";
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
 } from "@/components/ui/alert-dialog";
 
 interface FriendCardProps {
   friend: FriendProfile;
 }
 
 export function FriendCard({ friend }: FriendCardProps) {
   const navigate = useNavigate();
   const { unfriend } = useFriendships();
   const { getOrCreateConversation } = useConversations();
 
   const handleMessage = async () => {
     const conversationId = await getOrCreateConversation(friend.user_id);
     if (conversationId) {
       navigate(`/messages?conversation=${conversationId}`);
     }
   };
 
   const handleUnfriend = async () => {
     await unfriend(friend.user_id);
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
     <Card className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
       <Avatar className="h-12 w-12 border-2 border-primary/20">
         <AvatarImage src={friend.avatar_url || undefined} />
         <AvatarFallback className="bg-primary/10 text-primary font-bold">
           {getInitials(friend.display_name)}
         </AvatarFallback>
       </Avatar>
 
       <div className="flex-1 min-w-0">
         <p className="font-semibold truncate">
           {friend.display_name || "Unknown User"}
         </p>
       </div>
 
       <div className="flex gap-2">
         <Button size="sm" variant="default" onClick={handleMessage}>
           <MessageCircle className="h-4 w-4 mr-1" />
           Message
         </Button>
 
         <AlertDialog>
           <AlertDialogTrigger asChild>
             <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
               <UserMinus className="h-4 w-4" />
             </Button>
           </AlertDialogTrigger>
           <AlertDialogContent>
             <AlertDialogHeader>
               <AlertDialogTitle>Remove Friend</AlertDialogTitle>
               <AlertDialogDescription>
                 Are you sure you want to remove {friend.display_name || "this user"} from your friends?
                 You won't be able to message them anymore.
               </AlertDialogDescription>
             </AlertDialogHeader>
             <AlertDialogFooter>
               <AlertDialogCancel>Cancel</AlertDialogCancel>
               <AlertDialogAction onClick={handleUnfriend} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                 Remove
               </AlertDialogAction>
             </AlertDialogFooter>
           </AlertDialogContent>
         </AlertDialog>
       </div>
     </Card>
   );
 }