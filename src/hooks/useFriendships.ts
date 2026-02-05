 import { useState, useEffect, useCallback } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 import { useToast } from "@/hooks/use-toast";
 
 export interface Friendship {
   id: string;
   user_id: string;
   friend_id: string;
   created_at: string;
 }
 
 export interface FriendRequest {
   id: string;
   sender_id: string;
   receiver_id: string;
   status: "pending" | "accepted" | "declined";
   created_at: string;
   responded_at: string | null;
 }
 
 export interface FriendProfile {
   user_id: string;
   display_name: string | null;
   avatar_url: string | null;
 }
 
 export function useFriendships() {
   const { user } = useAuth();
   const { toast } = useToast();
   const [friends, setFriends] = useState<FriendProfile[]>([]);
   const [incomingRequests, setIncomingRequests] = useState<(FriendRequest & { sender: FriendProfile })[]>([]);
   const [outgoingRequests, setOutgoingRequests] = useState<(FriendRequest & { receiver: FriendProfile })[]>([]);
   const [loading, setLoading] = useState(true);
   const [pendingCount, setPendingCount] = useState(0);
 
   const fetchFriends = useCallback(async () => {
     if (!user) return;
 
     try {
       // Get all friendships where user is involved
       const { data: friendships, error } = await supabase
         .from("friendships")
         .select("*")
         .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
 
       if (error) throw error;
 
       // Get friend user IDs
       const friendIds = friendships?.map((f) =>
         f.user_id === user.id ? f.friend_id : f.user_id
       ) || [];
 
       if (friendIds.length > 0) {
         // Fetch friend profiles
         const { data: profiles, error: profileError } = await supabase
           .from("profiles_public")
           .select("user_id, display_name, avatar_url")
           .in("user_id", friendIds);
 
         if (profileError) throw profileError;
         setFriends(profiles || []);
       } else {
         setFriends([]);
       }
     } catch (error) {
       console.error("Error fetching friends:", error);
     }
   }, [user]);
 
   const fetchRequests = useCallback(async () => {
     if (!user) return;
 
     try {
       // Fetch incoming requests
       const { data: incoming, error: inError } = await supabase
         .from("friend_requests")
         .select("*")
         .eq("receiver_id", user.id)
         .eq("status", "pending");
 
       if (inError) throw inError;
 
       // Get sender profiles for incoming requests
       if (incoming && incoming.length > 0) {
         const senderIds = incoming.map((r) => r.sender_id);
         const { data: senderProfiles } = await supabase
           .from("profiles_public")
           .select("user_id, display_name, avatar_url")
           .in("user_id", senderIds);
 
         const incomingWithProfiles = incoming.map((req) => ({
           ...req,
           status: req.status as "pending" | "accepted" | "declined",
           sender: senderProfiles?.find((p) => p.user_id === req.sender_id) || {
             user_id: req.sender_id,
             display_name: null,
             avatar_url: null,
           },
         }));
         setIncomingRequests(incomingWithProfiles);
         setPendingCount(incoming.length);
       } else {
         setIncomingRequests([]);
         setPendingCount(0);
       }
 
       // Fetch outgoing requests
       const { data: outgoing, error: outError } = await supabase
         .from("friend_requests")
         .select("*")
         .eq("sender_id", user.id)
         .eq("status", "pending");
 
       if (outError) throw outError;
 
       // Get receiver profiles for outgoing requests
       if (outgoing && outgoing.length > 0) {
         const receiverIds = outgoing.map((r) => r.receiver_id);
         const { data: receiverProfiles } = await supabase
           .from("profiles_public")
           .select("user_id, display_name, avatar_url")
           .in("user_id", receiverIds);
 
         const outgoingWithProfiles = outgoing.map((req) => ({
           ...req,
           status: req.status as "pending" | "accepted" | "declined",
           receiver: receiverProfiles?.find((p) => p.user_id === req.receiver_id) || {
             user_id: req.receiver_id,
             display_name: null,
             avatar_url: null,
           },
         }));
         setOutgoingRequests(outgoingWithProfiles);
       } else {
         setOutgoingRequests([]);
       }
     } catch (error) {
       console.error("Error fetching friend requests:", error);
     }
   }, [user]);
 
   const sendFriendRequest = async (receiverId: string) => {
     if (!user) return { error: new Error("Not authenticated") };
 
     try {
       const { error } = await supabase
         .from("friend_requests")
         .insert({ sender_id: user.id, receiver_id: receiverId });
 
       if (error) {
         if (error.code === "23505") {
           toast({
             title: "Request already sent",
             description: "You already have a pending request with this user.",
             variant: "destructive",
           });
         } else {
           throw error;
         }
         return { error };
       }
 
       toast({ title: "Friend request sent!" });
       await fetchRequests();
       return { error: null };
     } catch (error) {
       console.error("Error sending friend request:", error);
       toast({
         title: "Error",
         description: "Failed to send friend request.",
         variant: "destructive",
       });
       return { error: error as Error };
     }
   };
 
   const acceptFriendRequest = async (requestId: string, senderId: string) => {
     if (!user) return { error: new Error("Not authenticated") };
 
     try {
       // Update request status
       const { error: updateError } = await supabase
         .from("friend_requests")
         .update({ status: "accepted", responded_at: new Date().toISOString() })
         .eq("id", requestId);
 
       if (updateError) throw updateError;
 
       // Create friendship (order UUIDs consistently)
       const [userId1, userId2] = user.id < senderId 
         ? [user.id, senderId] 
         : [senderId, user.id];
 
       const { error: friendError } = await supabase
         .from("friendships")
         .insert({ user_id: userId1, friend_id: userId2 });
 
       if (friendError) throw friendError;
 
       toast({ title: "Friend request accepted!" });
       await Promise.all([fetchFriends(), fetchRequests()]);
       return { error: null };
     } catch (error) {
       console.error("Error accepting friend request:", error);
       toast({
         title: "Error",
         description: "Failed to accept friend request.",
         variant: "destructive",
       });
       return { error: error as Error };
     }
   };
 
   const declineFriendRequest = async (requestId: string) => {
     if (!user) return { error: new Error("Not authenticated") };
 
     try {
       const { error } = await supabase
         .from("friend_requests")
         .update({ status: "declined", responded_at: new Date().toISOString() })
         .eq("id", requestId);
 
       if (error) throw error;
 
       toast({ title: "Friend request declined" });
       await fetchRequests();
       return { error: null };
     } catch (error) {
       console.error("Error declining friend request:", error);
       return { error: error as Error };
     }
   };
 
   const cancelFriendRequest = async (requestId: string) => {
     if (!user) return { error: new Error("Not authenticated") };
 
     try {
       const { error } = await supabase
         .from("friend_requests")
         .delete()
         .eq("id", requestId);
 
       if (error) throw error;
 
       toast({ title: "Friend request cancelled" });
       await fetchRequests();
       return { error: null };
     } catch (error) {
       console.error("Error cancelling friend request:", error);
       return { error: error as Error };
     }
   };
 
   const unfriend = async (friendId: string) => {
     if (!user) return { error: new Error("Not authenticated") };
 
     try {
       const { error } = await supabase
         .from("friendships")
         .delete()
         .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);
 
       if (error) throw error;
 
       toast({ title: "Friend removed" });
       await fetchFriends();
       return { error: null };
     } catch (error) {
       console.error("Error unfriending:", error);
       return { error: error as Error };
     }
   };
 
   const isFriend = useCallback(
     (userId: string) => friends.some((f) => f.user_id === userId),
     [friends]
   );
 
   const hasPendingRequest = useCallback(
     (userId: string) =>
       outgoingRequests.some((r) => r.receiver_id === userId) ||
       incomingRequests.some((r) => r.sender_id === userId),
     [outgoingRequests, incomingRequests]
   );
 
   const getRequestStatus = useCallback(
     (userId: string): "none" | "sent" | "received" | "friend" => {
       if (isFriend(userId)) return "friend";
       if (outgoingRequests.some((r) => r.receiver_id === userId)) return "sent";
       if (incomingRequests.some((r) => r.sender_id === userId)) return "received";
       return "none";
     },
     [isFriend, outgoingRequests, incomingRequests]
   );
 
   useEffect(() => {
     if (!user) {
       setLoading(false);
       return;
     }
 
     const loadData = async () => {
       setLoading(true);
       await Promise.all([fetchFriends(), fetchRequests()]);
       setLoading(false);
     };
 
     loadData();
 
     // Subscribe to friend request changes
     const channel = supabase
       .channel(`friend-requests-${user.id}`)
       .on(
         "postgres_changes",
         {
           event: "*",
           schema: "public",
           table: "friend_requests",
           filter: `receiver_id=eq.${user.id}`,
         },
         () => fetchRequests()
       )
       .on(
         "postgres_changes",
         {
           event: "*",
           schema: "public",
           table: "friend_requests",
           filter: `sender_id=eq.${user.id}`,
         },
         () => fetchRequests()
       )
       .subscribe();
 
     return () => {
       supabase.removeChannel(channel);
     };
   }, [user, fetchFriends, fetchRequests]);
 
   return {
     friends,
     incomingRequests,
     outgoingRequests,
     pendingCount,
     loading,
     sendFriendRequest,
     acceptFriendRequest,
     declineFriendRequest,
     cancelFriendRequest,
     unfriend,
     isFriend,
     hasPendingRequest,
     getRequestStatus,
     refetch: () => Promise.all([fetchFriends(), fetchRequests()]),
   };
 }