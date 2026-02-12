 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { DirectMessage, ContactCardData } from "@/hooks/useDirectMessages";
 import { ContactCardMessage } from "./ContactCardMessage";
import { MessageActions } from "./MessageActions";
import { MessageReactions } from "./MessageReactions";
 import { formatDistanceToNow } from "date-fns";
 import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";
import { ReactionSummary } from "@/hooks/useMessageReactions";
 
  interface MessageBubbleProps {
    message: DirectMessage;
   isOwn: boolean;
   senderProfile?: {
     display_name: string | null;
     avatar_url: string | null;
   };
  onDelete?: () => void;
  onReact?: (emoji: string) => void;
  reactions?: ReactionSummary[];
  deleting?: boolean;
 }
 
export function MessageBubble({
  message,
  isOwn,
  senderProfile,
  onDelete,
  onReact,
  reactions = [],
  deleting,
}: MessageBubbleProps) {
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
        "flex gap-2 max-w-[80%] group",
         isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
       )}
     >
       {!isOwn && (
        <Avatar className="h-8 w-8 shrink-0 mt-auto">
           <AvatarImage src={senderProfile?.avatar_url || undefined} />
           <AvatarFallback className="text-xs bg-primary/10 text-primary">
             {getInitials(senderProfile?.display_name)}
           </AvatarFallback>
         </Avatar>
       )}
 
      <div className={cn("flex flex-col gap-1", isOwn ? "items-end" : "items-start")}>
         <div className={cn("flex items-center gap-1", isOwn ? "flex-row-reverse" : "")}>
           {message.message_type === "contact_card" && message.contact_card_data ? (
             <ContactCardMessage cardData={message.contact_card_data} />
           ) : message.message_type === "image" && message.content ? (
             <div className="rounded-2xl overflow-hidden max-w-xs">
               <img
                 src={message.content}
                 alt="Shared image"
                 className="w-full h-auto rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                 onClick={() => window.open(message.content!, "_blank")}
               />
             </div>
           ) : (
             <div
               className={cn(
                 "px-4 py-2 rounded-2xl",
                 isOwn
                   ? "bg-primary text-primary-foreground rounded-br-md"
                   : "bg-muted rounded-bl-md"
               )}
             >
               <p className="text-sm whitespace-pre-wrap break-words">
                 {message.content}
               </p>
             </div>
           )}

          {onDelete && onReact && (
            <MessageActions
              isOwn={isOwn}
              onDelete={onDelete}
              onReact={onReact}
              deleting={deleting}
            />
          )}
        </div>

        {reactions.length > 0 && onReact && (
          <MessageReactions
            reactions={reactions}
            onToggle={onReact}
            isOwn={isOwn}
          />
        )}

        <div className={cn("flex items-center gap-1", isOwn ? "flex-row-reverse" : "")}>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
          {isOwn && (
            <span className="text-xs">
              {message.is_read ? (
                <CheckCheck className="h-3 w-3 text-primary" />
              ) : (
                <Check className="h-3 w-3 text-muted-foreground" />
              )}
            </span>
          )}
           </div>
       </div>
     </div>
   );
 }