 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { DirectMessage, ContactCardData } from "@/hooks/useDirectMessages";
 import { ContactCardMessage } from "./ContactCardMessage";
 import { formatDistanceToNow } from "date-fns";
 import { cn } from "@/lib/utils";
 
 interface MessageBubbleProps {
   message: DirectMessage;
   isOwn: boolean;
   senderProfile?: {
     display_name: string | null;
     avatar_url: string | null;
   };
 }
 
 export function MessageBubble({ message, isOwn, senderProfile }: MessageBubbleProps) {
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
     <div
       className={cn(
         "flex gap-2 max-w-[80%]",
         isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
       )}
     >
       {!isOwn && (
         <Avatar className="h-8 w-8 shrink-0">
           <AvatarImage src={senderProfile?.avatar_url || undefined} />
           <AvatarFallback className="text-xs bg-primary/10 text-primary">
             {getInitials(senderProfile?.display_name)}
           </AvatarFallback>
         </Avatar>
       )}
 
       <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
         {message.message_type === "contact_card" && message.contact_card_data ? (
           <ContactCardMessage cardData={message.contact_card_data} />
         ) : (
           <div
             className={cn(
               "px-4 py-2 rounded-2xl",
               isOwn
                 ? "bg-primary text-primary-foreground rounded-br-md"
                 : "bg-muted rounded-bl-md"
             )}
           >
             <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
           </div>
         )}
         <span className="text-xs text-muted-foreground mt-1">
           {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
         </span>
       </div>
     </div>
   );
 }