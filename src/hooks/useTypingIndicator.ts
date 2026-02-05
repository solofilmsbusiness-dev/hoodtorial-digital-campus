 import { useState, useEffect, useRef, useCallback } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 import { useProfileContext } from "@/contexts/ProfileContext";
 
 interface TypingUser {
   user_id: string;
   display_name: string;
 }
 
 export function useTypingIndicator(conversationId: string | null) {
   const { user } = useAuth();
   const { profile } = useProfileContext();
   const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
   const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
   const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
 
   useEffect(() => {
     if (!conversationId || !user) {
       setTypingUsers([]);
       return;
     }
 
     // Cleanup previous channel
     if (channelRef.current) {
       supabase.removeChannel(channelRef.current);
     }
 
     const channel = supabase.channel(`typing:${conversationId}`);
 
     channel
       .on("presence", { event: "sync" }, () => {
         const state = channel.presenceState();
         const typing: TypingUser[] = [];
         
         Object.values(state).forEach((presences: any) => {
           presences.forEach((presence: any) => {
             if (presence.is_typing && presence.user_id !== user.id) {
               typing.push({
                 user_id: presence.user_id,
                 display_name: presence.display_name || "Someone",
               });
             }
           });
         });
         
         setTypingUsers(typing);
       })
       .subscribe(async (status) => {
         if (status === "SUBSCRIBED") {
           await channel.track({
             user_id: user.id,
             display_name: profile?.display_name || "User",
             is_typing: false,
           });
         }
       });
 
     channelRef.current = channel;
 
     return () => {
       if (channelRef.current) {
         supabase.removeChannel(channelRef.current);
         channelRef.current = null;
       }
       if (typingTimeoutRef.current) {
         clearTimeout(typingTimeoutRef.current);
       }
     };
   }, [conversationId, user, profile?.display_name]);
 
   const setTyping = useCallback(
     async (isTyping: boolean) => {
       if (!channelRef.current || !user) return;
 
       // Clear existing timeout
       if (typingTimeoutRef.current) {
         clearTimeout(typingTimeoutRef.current);
       }
 
       await channelRef.current.track({
         user_id: user.id,
         display_name: profile?.display_name || "User",
         is_typing: isTyping,
       });
 
       // Auto-clear typing after 2 seconds
       if (isTyping) {
         typingTimeoutRef.current = setTimeout(async () => {
           if (channelRef.current && user) {
             await channelRef.current.track({
               user_id: user.id,
               display_name: profile?.display_name || "User",
               is_typing: false,
             });
           }
         }, 2000);
       }
     },
     [user, profile?.display_name]
   );
 
   return { typingUsers, setTyping };
 }