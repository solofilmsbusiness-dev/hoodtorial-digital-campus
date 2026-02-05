 import { useState, useEffect } from "react";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { MessageSquare, RefreshCw, Trash2 } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 import { toast } from "sonner";
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
 } from "@/components/ui/alert-dialog";
 
 const messageTemplates = [
   "Hey! I'm having trouble with the video player in the cinematography course. The video keeps buffering.",
   "The lesson on lighting techniques was really helpful, thanks for putting this together!",
   "Quick question - when will the new editing module be available? I'm excited to learn about color grading.",
   "Just wanted to say the platform looks great! The new design is much easier to navigate.",
 ];
 
 export function TestMessagesCard() {
   const { user } = useAuth();
   const [isGenerating, setIsGenerating] = useState(false);
   const [isClearing, setIsClearing] = useState(false);
   const [progress, setProgress] = useState(0);
   const [progressText, setProgressText] = useState("");
   const [stats, setStats] = useState({ conversations: 0, messages: 0 });
 
   const fetchStats = async () => {
     if (!user?.id) return;
 
     const [convResult, msgResult] = await Promise.all([
       supabase
         .from("conversations")
         .select("id", { count: "exact", head: true })
         .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`),
       supabase
         .from("direct_messages")
         .select("id, conversation:conversations!inner(id)", { count: "exact", head: true })
         .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`, { foreignTable: "conversations" }),
     ]);
 
     setStats({
       conversations: convResult.count ?? 0,
       messages: msgResult.count ?? 0,
     });
   };
 
   useEffect(() => {
     fetchStats();
   }, [user?.id]);
 
   const handleGenerate = async () => {
     if (!user?.id) return;
 
     setIsGenerating(true);
     setProgress(0);
     setProgressText("Fetching users...");
 
     try {
       // Get all non-admin users
       const { data: users, error: usersError } = await supabase
         .from("profiles")
         .select("user_id, display_name")
         .neq("user_id", user.id);
 
       if (usersError) throw usersError;
 
       if (!users || users.length === 0) {
         toast.info("No other users found to generate messages from");
         setIsGenerating(false);
         return;
       }
 
       let messagesCreated = 0;
       let conversationsCreated = 0;
 
       for (let i = 0; i < users.length; i++) {
         const targetUser = users[i];
         setProgressText(`Creating messages for ${targetUser.display_name || "user"} (${i + 1}/${users.length})...`);
         setProgress(((i + 1) / users.length) * 100);
 
         // Create friendship (sorted UUIDs for consistency)
         const [lower, higher] = [targetUser.user_id, user.id].sort();
         
         const { error: friendshipError } = await supabase
           .from("friendships")
           .upsert(
             { user_id: lower, friend_id: higher },
             { onConflict: "user_id,friend_id", ignoreDuplicates: true }
           );
 
         if (friendshipError) {
           console.error("Friendship error:", friendshipError);
           // Continue anyway - friendship might already exist
         }
 
         // Get or create conversation
         const { data: conversationId, error: convError } = await supabase.rpc(
           "get_or_create_conversation",
           { _user1_id: targetUser.user_id, _user2_id: user.id }
         );
 
         if (convError) {
           console.error("Conversation error:", convError);
           continue;
         }
 
         conversationsCreated++;
 
         // Insert 4 test messages with staggered timestamps
         const messages = messageTemplates.map((content, idx) => ({
           conversation_id: conversationId,
           sender_id: targetUser.user_id,
           content: content,
           message_type: "text",
           is_read: false,
           created_at: new Date(Date.now() - (4 - idx) * 60000).toISOString(),
         }));
 
         const { error: msgError } = await supabase
           .from("direct_messages")
           .insert(messages);
 
         if (msgError) {
           console.error("Message insert error:", msgError);
           continue;
         }
 
         messagesCreated += 4;
       }
 
       toast.success(`Generated ${messagesCreated} messages across ${conversationsCreated} conversations`);
       await fetchStats();
     } catch (error) {
       console.error("Generation error:", error);
       toast.error("Failed to generate test messages");
     } finally {
       setIsGenerating(false);
       setProgress(0);
       setProgressText("");
     }
   };
 
   const handleClear = async () => {
     if (!user?.id) return;
 
     setIsClearing(true);
 
     try {
       // Get all conversations where admin is a participant
       const { data: conversations, error: convError } = await supabase
         .from("conversations")
         .select("id")
         .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`);
 
       if (convError) throw convError;
 
       if (conversations && conversations.length > 0) {
         const conversationIds = conversations.map((c) => c.id);
 
         // Delete all messages in these conversations
         const { error: msgError } = await supabase
           .from("direct_messages")
           .delete()
           .in("conversation_id", conversationIds);
 
         if (msgError) throw msgError;
 
         // Delete the conversations
         const { error: deleteConvError } = await supabase
           .from("conversations")
           .delete()
           .in("id", conversationIds);
 
         if (deleteConvError) throw deleteConvError;
       }
 
       toast.success("Cleared all test messages and conversations");
       await fetchStats();
     } catch (error) {
       console.error("Clear error:", error);
       toast.error("Failed to clear test messages");
     } finally {
       setIsClearing(false);
     }
   };
 
   return (
     <Card>
       <CardHeader>
         <CardTitle className="flex items-center gap-2">
           <MessageSquare className="h-5 w-5" />
           Test Messages
         </CardTitle>
         <CardDescription>
           Generate sample messages from all users to the admin for testing the messaging system
         </CardDescription>
       </CardHeader>
       <CardContent className="space-y-4">
         {/* Stats */}
         <div className="grid grid-cols-2 gap-4">
           <div className="rounded-lg border bg-muted/50 p-4 text-center">
             <div className="text-2xl font-bold">{stats.conversations}</div>
             <div className="text-xs text-muted-foreground">Conversations</div>
           </div>
           <div className="rounded-lg border bg-muted/50 p-4 text-center">
             <div className="text-2xl font-bold">{stats.messages}</div>
             <div className="text-xs text-muted-foreground">Messages</div>
           </div>
         </div>
 
         <p className="text-sm text-muted-foreground">
           Each user will send 4 test messages to your admin account.
         </p>
 
         {/* Progress */}
         {isGenerating && (
           <div className="space-y-2">
             <Progress value={progress} className="h-2" />
             <p className="text-xs text-muted-foreground">{progressText}</p>
           </div>
         )}
 
         {/* Actions */}
         <div className="flex items-center gap-2">
           <Button
             onClick={handleGenerate}
             disabled={isGenerating || isClearing}
             className="flex-1"
           >
             <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
             {isGenerating ? "Generating..." : "Generate Test Messages"}
           </Button>
 
           <AlertDialog>
             <AlertDialogTrigger asChild>
               <Button
                 variant="outline"
                 size="icon"
                 disabled={isGenerating || isClearing || stats.conversations === 0}
               >
                 <Trash2 className="h-4 w-4" />
               </Button>
             </AlertDialogTrigger>
             <AlertDialogContent>
               <AlertDialogHeader>
                 <AlertDialogTitle>Clear all test messages?</AlertDialogTitle>
                 <AlertDialogDescription>
                   This will delete all {stats.conversations} conversations and {stats.messages} messages
                   associated with your admin account. This action cannot be undone.
                 </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                 <AlertDialogAction onClick={handleClear}>
                   {isClearing ? "Clearing..." : "Clear All"}
                 </AlertDialogAction>
               </AlertDialogFooter>
             </AlertDialogContent>
           </AlertDialog>
         </div>
       </CardContent>
     </Card>
   );
 }