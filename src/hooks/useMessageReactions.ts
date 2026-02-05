 import { useState, useEffect, useCallback, useRef } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 import { useToast } from "@/hooks/use-toast";
 
 export interface MessageReaction {
   id: string;
   message_id: string;
   user_id: string;
   emoji: string;
   created_at: string;
 }
 
 export interface ReactionSummary {
   emoji: string;
   count: number;
   hasReacted: boolean;
 }
 
 export function useMessageReactions(conversationId: string | null) {
   const { user } = useAuth();
   const { toast } = useToast();
   const [reactions, setReactions] = useState<Map<string, MessageReaction[]>>(new Map());
   const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
 
   const fetchReactions = useCallback(async () => {
     if (!conversationId || !user) return;
 
     try {
       // Get all messages in this conversation first
       const { data: messages, error: messagesError } = await supabase
         .from("direct_messages")
         .select("id")
         .eq("conversation_id", conversationId);
 
       if (messagesError) throw messagesError;
       if (!messages || messages.length === 0) return;
 
       const messageIds = messages.map((m) => m.id);
 
       const { data, error } = await supabase
         .from("message_reactions")
         .select("*")
         .in("message_id", messageIds);
 
       if (error) throw error;
 
       // Group reactions by message_id
       const grouped = new Map<string, MessageReaction[]>();
       (data || []).forEach((reaction) => {
         const existing = grouped.get(reaction.message_id) || [];
         existing.push(reaction);
         grouped.set(reaction.message_id, existing);
       });
 
       setReactions(grouped);
     } catch (error) {
       console.error("Error fetching reactions:", error);
     }
   }, [conversationId, user]);
 
   useEffect(() => {
     if (!conversationId || !user) {
       setReactions(new Map());
       return;
     }
 
     fetchReactions();
 
     // Cleanup previous channel
     if (channelRef.current) {
       supabase.removeChannel(channelRef.current);
     }
 
     // Subscribe to reaction changes
     const channel = supabase
       .channel(`reactions-${conversationId}`)
       .on(
         "postgres_changes",
         {
           event: "*",
           schema: "public",
           table: "message_reactions",
         },
         () => {
           // Refetch all reactions on any change
           fetchReactions();
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
   }, [conversationId, user, fetchReactions]);
 
   const addReaction = async (messageId: string, emoji: string) => {
     if (!user) return { error: new Error("Not authenticated") };
 
     try {
       const { error } = await supabase.from("message_reactions").insert({
         message_id: messageId,
         user_id: user.id,
         emoji,
       });
 
       if (error) {
         // Unique constraint violation means already reacted
         if (error.code === "23505") {
           return { error: null }; // Silently ignore
         }
         throw error;
       }
 
       return { error: null };
     } catch (error) {
       console.error("Error adding reaction:", error);
       toast({
         title: "Error",
         description: "Failed to add reaction.",
         variant: "destructive",
       });
       return { error: error as Error };
     }
   };
 
   const removeReaction = async (messageId: string, emoji: string) => {
     if (!user) return { error: new Error("Not authenticated") };
 
     try {
       const { error } = await supabase
         .from("message_reactions")
         .delete()
         .eq("message_id", messageId)
         .eq("user_id", user.id)
         .eq("emoji", emoji);
 
       if (error) throw error;
 
       return { error: null };
     } catch (error) {
       console.error("Error removing reaction:", error);
       toast({
         title: "Error",
         description: "Failed to remove reaction.",
         variant: "destructive",
       });
       return { error: error as Error };
     }
   };
 
   const toggleReaction = async (messageId: string, emoji: string) => {
     if (!user) return { error: new Error("Not authenticated") };
 
     const messageReactions = reactions.get(messageId) || [];
     const hasReacted = messageReactions.some(
       (r) => r.user_id === user.id && r.emoji === emoji
     );
 
     if (hasReacted) {
       return removeReaction(messageId, emoji);
     } else {
       return addReaction(messageId, emoji);
     }
   };
 
   const getReactionSummary = (messageId: string): ReactionSummary[] => {
     const messageReactions = reactions.get(messageId) || [];
     const summaryMap = new Map<string, { count: number; hasReacted: boolean }>();
 
     messageReactions.forEach((reaction) => {
       const existing = summaryMap.get(reaction.emoji) || {
         count: 0,
         hasReacted: false,
       };
       existing.count++;
       if (reaction.user_id === user?.id) {
         existing.hasReacted = true;
       }
       summaryMap.set(reaction.emoji, existing);
     });
 
     return Array.from(summaryMap.entries()).map(([emoji, data]) => ({
       emoji,
       count: data.count,
       hasReacted: data.hasReacted,
     }));
   };
 
   return {
     reactions,
     addReaction,
     removeReaction,
     toggleReaction,
     getReactionSummary,
     refetch: fetchReactions,
   };
 }