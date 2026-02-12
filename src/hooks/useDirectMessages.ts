 import { useState, useEffect, useCallback, useRef } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 import { useToast } from "@/hooks/use-toast";
 
  export interface DirectMessage {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string | null;
    message_type: "text" | "contact_card" | "image";
    contact_card_data: ContactCardData | null;
    is_read: boolean;
    is_deleted?: boolean;
    created_at: string;
  }
 
 export interface ContactCardData {
   user_id: string;
   display_name: string | null;
   avatar_url: string | null;
   bio: string | null;
    filmmaking_style: string | null;
    creative_role: string | null;
    camera_gear: string | null;
   portfolio_url: string | null;
   instagram_url: string | null;
   youtube_url: string | null;
   twitter_url: string | null;
   vimeo_url: string | null;
   tiktok_url: string | null;
   imdb_url: string | null;
 }
 
 export function useDirectMessages(conversationId: string | null) {
   const { user } = useAuth();
   const { toast } = useToast();
   const [messages, setMessages] = useState<DirectMessage[]>([]);
   const [loading, setLoading] = useState(true);
   const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
 
   const fetchMessages = useCallback(async () => {
     if (!conversationId || !user) return;
 
     try {
       const { data, error } = await supabase
         .from("direct_messages")
         .select("*")
         .eq("conversation_id", conversationId)
         .order("created_at", { ascending: true });
 
       if (error) throw error;
 
        const typedMessages: DirectMessage[] = (data || []).map((msg) => ({
          ...msg,
          message_type: msg.message_type as "text" | "contact_card" | "image",
          contact_card_data: msg.contact_card_data as unknown as ContactCardData | null,
        }));
 
       setMessages(typedMessages);
     } catch (error) {
       console.error("Error fetching messages:", error);
     }
   }, [conversationId, user]);
 
   const sendMessage = async (content: string) => {
     if (!conversationId || !user || !content.trim()) return { error: new Error("Invalid input") };
 
     try {
       const { error } = await supabase.from("direct_messages").insert({
         conversation_id: conversationId,
         sender_id: user.id,
         content: content.trim(),
         message_type: "text",
       });
 
       if (error) throw error;
 
       // Update conversation last_message_at
       await supabase
         .from("conversations")
         .update({ last_message_at: new Date().toISOString() })
         .eq("id", conversationId);
 
       return { error: null };
     } catch (error) {
       console.error("Error sending message:", error);
       toast({
         title: "Error",
         description: "Failed to send message.",
         variant: "destructive",
       });
       return { error: error as Error };
     }
   };
 
   const sendContactCard = async (cardData: ContactCardData) => {
     if (!conversationId || !user) return { error: new Error("Invalid input") };
 
     try {
       const { error } = await supabase.from("direct_messages").insert({
         conversation_id: conversationId,
         sender_id: user.id,
         message_type: "contact_card",
         contact_card_data: JSON.parse(JSON.stringify(cardData)),
       });
 
       if (error) throw error;
 
       // Update conversation last_message_at
       await supabase
         .from("conversations")
         .update({ last_message_at: new Date().toISOString() })
         .eq("id", conversationId);
 
       toast({ title: "Contact card shared!" });
       return { error: null };
     } catch (error) {
       console.error("Error sending contact card:", error);
       toast({
         title: "Error",
         description: "Failed to send contact card.",
         variant: "destructive",
       });
       return { error: error as Error };
     }
   };
 
   const markAsRead = async () => {
     if (!conversationId || !user) return;
 
     try {
       await supabase
         .from("direct_messages")
         .update({ is_read: true })
         .eq("conversation_id", conversationId)
         .neq("sender_id", user.id)
         .eq("is_read", false);
     } catch (error) {
       console.error("Error marking messages as read:", error);
     }
   };
 
   useEffect(() => {
     if (!conversationId || !user) {
       setMessages([]);
       setLoading(false);
       return;
     }
 
     const loadData = async () => {
       setLoading(true);
       await fetchMessages();
       await markAsRead();
       setLoading(false);
     };
 
     loadData();
 
     // Cleanup previous channel
     if (channelRef.current) {
       supabase.removeChannel(channelRef.current);
     }
 
     // Subscribe to new messages
     const channel = supabase
       .channel(`dm-${conversationId}`)
       .on(
         "postgres_changes",
         {
           event: "INSERT",
           schema: "public",
           table: "direct_messages",
           filter: `conversation_id=eq.${conversationId}`,
         },
         (payload) => {
           const newMsg = payload.new as DirectMessage;
           setMessages((prev) => {
             // Avoid duplicates
             if (prev.some((m) => m.id === newMsg.id)) return prev;
             return [...prev, {
                ...newMsg,
                message_type: newMsg.message_type as "text" | "contact_card" | "image",
               contact_card_data: newMsg.contact_card_data as ContactCardData | null,
             }];
           });
           // Mark as read if we're viewing the conversation
           if (newMsg.sender_id !== user.id) {
             markAsRead();
           }
         }
       )
       .subscribe();
 
     channelRef.current = channel;
 
     return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, user, fetchMessages]);

  const deleteMessage = async (messageId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { error } = await supabase
        .from("direct_messages")
        .update({ is_deleted: true } as any)
        .eq("id", messageId)
        .eq("sender_id", user.id);

      if (error) throw error;

      // Update local state to show deleted placeholder
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, is_deleted: true, content: null } : m
        )
      );

      return { error: null };
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Error",
        description: "Failed to delete message.",
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };
 
   return {
     messages,
     loading,
     sendMessage,
     sendContactCard,
    deleteMessage,
     markAsRead,
     refetch: fetchMessages,
   };
 }