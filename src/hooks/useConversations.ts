 import { useState, useEffect, useCallback } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 import { useUserSafety } from "@/hooks/useUserSafety";
 
 export interface Conversation {
   id: string;
   participant_1: string;
   participant_2: string;
   created_at: string;
   last_message_at: string | null;
 }
 
 export interface ConversationWithProfile extends Conversation {
   otherUser: {
     user_id: string;
     display_name: string | null;
     avatar_url: string | null;
   };
   lastMessage?: {
     content: string | null;
     message_type: string;
     sender_id: string;
     created_at: string;
   };
   unreadCount: number;
 }
 
  export function useConversations() {
    const { user } = useAuth();
    const { blockedUserIds } = useUserSafety();
    const [conversations, setConversations] = useState<ConversationWithProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalUnread, setTotalUnread] = useState(0);
 
   const fetchConversations = useCallback(async () => {
     if (!user) return;
 
     try {
       // Fetch all conversations for user
       const { data: convos, error } = await supabase
         .from("conversations")
         .select("*")
         .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
         .order("last_message_at", { ascending: false, nullsFirst: false });
 
       if (error) throw error;
 
       if (!convos || convos.length === 0) {
         setConversations([]);
         setTotalUnread(0);
         return;
       }
 
        // Get other user IDs and conversation IDs
        const otherUserIds = convos.map((c) =>
          c.participant_1 === user.id ? c.participant_2 : c.participant_1
        );
        const convoIds = convos.map((c) => c.id);

        // Fetch profiles and messages in parallel
        const [{ data: profiles }, { data: messages }] = await Promise.all([
          supabase.from("profiles_public").select("user_id, display_name, avatar_url").in("user_id", otherUserIds),
          supabase.from("direct_messages").select("conversation_id, content, message_type, sender_id, created_at, is_read").in("conversation_id", convoIds).order("created_at", { ascending: false }),
        ]);
 
       // Group messages by conversation and get last + unread count
       const messagesByConvo: Record<string, { last: typeof messages[0]; unread: number }> = {};
       messages?.forEach((msg) => {
         if (!messagesByConvo[msg.conversation_id]) {
           messagesByConvo[msg.conversation_id] = { last: msg, unread: 0 };
         }
         if (!msg.is_read && msg.sender_id !== user.id) {
           messagesByConvo[msg.conversation_id].unread++;
         }
       });
 
       const conversationsWithProfiles: ConversationWithProfile[] = convos.map((c) => {
         const otherUserId = c.participant_1 === user.id ? c.participant_2 : c.participant_1;
         const profile = profiles?.find((p) => p.user_id === otherUserId);
         const msgData = messagesByConvo[c.id];
 
         return {
           ...c,
           otherUser: profile || { user_id: otherUserId, display_name: null, avatar_url: null },
           lastMessage: msgData?.last
             ? {
                 content: msgData.last.content,
                 message_type: msgData.last.message_type,
                 sender_id: msgData.last.sender_id,
                 created_at: msgData.last.created_at,
               }
             : undefined,
           unreadCount: msgData?.unread || 0,
         };
       });
 
        // Filter out blocked users
        const filtered = conversationsWithProfiles.filter(
          (c) => !blockedUserIds.has(c.otherUser.user_id)
        );
        setConversations(filtered);
        setTotalUnread(filtered.reduce((sum, c) => sum + c.unreadCount, 0));
     } catch (error) {
       console.error("Error fetching conversations:", error);
     }
   }, [user, blockedUserIds]);
 
   const getOrCreateConversation = async (otherUserId: string): Promise<string | null> => {
     if (!user) return null;
 
     try {
       const { data, error } = await supabase.rpc("get_or_create_conversation", {
         _user1_id: user.id,
         _user2_id: otherUserId,
       });
 
       if (error) throw error;
       await fetchConversations();
       return data as string;
     } catch (error) {
       console.error("Error creating conversation:", error);
       return null;
     }
   };
 
   useEffect(() => {
     if (!user) {
       setLoading(false);
       return;
     }
 
     const loadData = async () => {
       setLoading(true);
       await fetchConversations();
       setLoading(false);
     };
 
     loadData();
 
     // Subscribe to conversation updates
     const channel = supabase
       .channel(`conversations-${user.id}`)
       .on(
         "postgres_changes",
         {
           event: "*",
           schema: "public",
           table: "conversations",
         },
         () => fetchConversations()
       )
       .on(
         "postgres_changes",
         {
           event: "INSERT",
           schema: "public",
           table: "direct_messages",
         },
         () => fetchConversations()
       )
       .subscribe();
 
     return () => {
       supabase.removeChannel(channel);
     };
   }, [user, fetchConversations]);
 
   return {
     conversations,
     loading,
     totalUnread,
     getOrCreateConversation,
     refetch: fetchConversations,
   };
 }