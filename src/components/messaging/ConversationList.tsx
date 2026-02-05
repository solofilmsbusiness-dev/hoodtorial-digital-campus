 import { MessageCircle } from "lucide-react";
 import { useConversations } from "@/hooks/useConversations";
 import { ConversationItem } from "./ConversationItem";
 import { Skeleton } from "@/components/ui/skeleton";
 import { ScrollArea } from "@/components/ui/scroll-area";
 
 interface ConversationListProps {
   activeConversationId: string | null;
   onSelectConversation: (id: string) => void;
 }
 
 export function ConversationList({ activeConversationId, onSelectConversation }: ConversationListProps) {
   const { conversations, loading } = useConversations();
 
   if (loading) {
     return (
       <div className="p-4 space-y-3">
         {[1, 2, 3, 4].map((i) => (
           <Skeleton key={i} className="h-16 w-full" />
         ))}
       </div>
     );
   }
 
   if (conversations.length === 0) {
     return (
       <div className="flex flex-col items-center justify-center h-full text-center p-6">
         <MessageCircle className="h-10 w-10 text-muted-foreground mb-3" />
         <p className="text-muted-foreground text-sm">No conversations yet</p>
         <p className="text-muted-foreground text-xs mt-1">
           Start chatting with your friends!
         </p>
       </div>
     );
   }
 
   return (
     <ScrollArea className="h-full">
       <div className="p-2 space-y-1">
         {conversations.map((conversation) => (
           <ConversationItem
             key={conversation.id}
             conversation={conversation}
             isActive={conversation.id === activeConversationId}
             onClick={() => onSelectConversation(conversation.id)}
           />
         ))}
       </div>
     </ScrollArea>
   );
 }