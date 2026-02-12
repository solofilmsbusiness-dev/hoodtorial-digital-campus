 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Badge } from "@/components/ui/badge";
 import { ConversationWithProfile } from "@/hooks/useConversations";
 import { formatDistanceToNow } from "date-fns";
 import { cn } from "@/lib/utils";
 import { Link } from "react-router-dom";
 
 interface ConversationItemProps {
   conversation: ConversationWithProfile;
   isActive: boolean;
   onClick: () => void;
 }
 
 export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
   const getInitials = (name?: string | null) => {
     if (!name) return "?";
     return name
       .split(" ")
       .map((n) => n.charAt(0))
       .join("")
       .toUpperCase()
       .slice(0, 2);
   };
 
   const getLastMessagePreview = () => {
     if (!conversation.lastMessage) return "No messages yet";
      if (conversation.lastMessage.message_type === "image") return "📷 Image";
      if (conversation.lastMessage.message_type === "contact_card") return "📇 Contact card";
     return conversation.lastMessage.content || "";
   };
 
   return (
     <button
       onClick={onClick}
       className={cn(
         "w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left rounded-lg",
         isActive && "bg-muted"
       )}
     >
         <Link 
           to={`/profile/${conversation.otherUser.user_id}`}
           onClick={(e) => e.stopPropagation()}
           className="shrink-0 hover:opacity-80 transition-opacity"
         >
           <Avatar className="h-10 w-10 border-2 border-primary/20">
             <AvatarImage src={conversation.otherUser.avatar_url || undefined} />
             <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
               {getInitials(conversation.otherUser.display_name)}
             </AvatarFallback>
           </Avatar>
         </Link>
 
       <div className="flex-1 min-w-0">
         <div className="flex items-center justify-between gap-2">
           <p className="font-semibold truncate text-sm">
             {conversation.otherUser.display_name || "Unknown User"}
           </p>
           {conversation.lastMessage && (
             <span className="text-xs text-muted-foreground shrink-0">
               {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: false })}
             </span>
           )}
         </div>
         <div className="flex items-center justify-between gap-2">
           <p className="text-sm text-muted-foreground truncate">
             {getLastMessagePreview()}
           </p>
           {conversation.unreadCount > 0 && (
             <Badge variant="default" className="shrink-0 h-5 min-w-5 flex items-center justify-center text-xs">
               {conversation.unreadCount}
             </Badge>
           )}
         </div>
       </div>
     </button>
   );
 }