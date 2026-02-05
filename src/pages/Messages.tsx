 import { useState, useEffect } from "react";
 import { useSearchParams } from "react-router-dom";
 import { PageLayout } from "@/components/layout";
 import { ConversationList, ChatWindow } from "@/components/messaging";
 import { useConversations } from "@/hooks/useConversations";
 import { MessageCircle } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 export default function Messages() {
   const [searchParams] = useSearchParams();
   const { conversations } = useConversations();
   const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
   const [showMobileList, setShowMobileList] = useState(true);
 
   // Handle conversation from URL param
   useEffect(() => {
     const conversationParam = searchParams.get("conversation");
     if (conversationParam) {
       setActiveConversationId(conversationParam);
       setShowMobileList(false);
     }
   }, [searchParams]);
 
   // Find active conversation details
   const activeConversation = conversations.find((c) => c.id === activeConversationId);
 
   const handleSelectConversation = (id: string) => {
     setActiveConversationId(id);
     setShowMobileList(false);
   };
 
   const handleBackToList = () => {
     setShowMobileList(true);
   };
 
   return (
     <PageLayout>
       <div className="py-6 px-4 h-[calc(100vh-12rem)]">
         <div className="container max-w-6xl mx-auto h-full">
           <div className="flex items-center gap-3 mb-6">
             <MessageCircle className="h-8 w-8 text-primary" />
             <h1 className="heading-2">Messages</h1>
           </div>
 
           <div className="bg-card border border-border rounded-xl overflow-hidden h-[calc(100%-4rem)] flex">
             {/* Conversation List - Desktop always visible, Mobile conditional */}
             <div
               className={cn(
                 "w-full md:w-80 border-r border-border flex-shrink-0",
                 "md:block",
                 showMobileList ? "block" : "hidden"
               )}
             >
               <div className="p-4 border-b border-border">
                 <h2 className="font-bold text-lg">Conversations</h2>
               </div>
               <div className="h-[calc(100%-4rem)]">
                 <ConversationList
                   activeConversationId={activeConversationId}
                   onSelectConversation={handleSelectConversation}
                 />
               </div>
             </div>
 
             {/* Chat Window - Desktop always visible, Mobile conditional */}
             <div
               className={cn(
                 "flex-1 flex flex-col",
                 "md:block",
                 !showMobileList ? "block" : "hidden"
               )}
             >
               {/* Mobile back button */}
               <div className="md:hidden p-2 border-b border-border">
                 <button
                   onClick={handleBackToList}
                   className="text-sm text-primary font-medium"
                 >
                   ← Back to conversations
                 </button>
               </div>
               <div className="flex-1">
                 <ChatWindow
                   conversationId={activeConversationId}
                   otherUser={activeConversation?.otherUser}
                 />
               </div>
             </div>
           </div>
         </div>
       </div>
     </PageLayout>
   );
 }