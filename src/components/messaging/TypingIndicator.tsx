 import { cn } from "@/lib/utils";
 
 interface TypingIndicatorProps {
   typingUsers: { user_id: string; display_name: string }[];
   className?: string;
 }
 
 export function TypingIndicator({ typingUsers, className }: TypingIndicatorProps) {
   if (typingUsers.length === 0) return null;
 
   const names = typingUsers.map((u) => u.display_name);
   let text: string;
 
   if (names.length === 1) {
     text = `${names[0]} is typing`;
   } else if (names.length === 2) {
     text = `${names[0]} and ${names[1]} are typing`;
   } else {
     text = `${names.length} people are typing`;
   }
 
   return (
     <div
       className={cn(
         "flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground",
         className
       )}
     >
       <div className="flex gap-1">
         <span className="animate-bounce" style={{ animationDelay: "0ms" }}>
           •
         </span>
         <span className="animate-bounce" style={{ animationDelay: "150ms" }}>
           •
         </span>
         <span className="animate-bounce" style={{ animationDelay: "300ms" }}>
           •
         </span>
       </div>
       <span>{text}</span>
     </div>
   );
 }