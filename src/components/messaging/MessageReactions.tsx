 import { cn } from "@/lib/utils";
 import { ReactionSummary } from "@/hooks/useMessageReactions";
 
 interface MessageReactionsProps {
   reactions: ReactionSummary[];
   onToggle: (emoji: string) => void;
   isOwn?: boolean;
 }
 
 export function MessageReactions({
   reactions,
   onToggle,
   isOwn,
 }: MessageReactionsProps) {
   if (reactions.length === 0) return null;
 
   return (
     <div
       className={cn(
         "flex flex-wrap gap-1 mt-1",
         isOwn ? "justify-end" : "justify-start"
       )}
     >
       {reactions.map((reaction) => (
         <button
           key={reaction.emoji}
           onClick={() => onToggle(reaction.emoji)}
           className={cn(
             "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs",
             "transition-colors hover:bg-muted/80",
             reaction.hasReacted
               ? "bg-primary/20 text-primary border border-primary/30"
               : "bg-muted border border-border"
           )}
         >
           <span>{reaction.emoji}</span>
           <span className="font-medium">{reaction.count}</span>
         </button>
       ))}
     </div>
   );
 }