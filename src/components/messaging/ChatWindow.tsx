  import { useState, useEffect, useRef } from "react";
  import { MessageCircle, ShieldOff, Flag, MoreVertical } from "lucide-react";
  import { useDirectMessages } from "@/hooks/useDirectMessages";
  import { useAuth } from "@/contexts/AuthContext";
  import { MessageBubble } from "./MessageBubble";
  import { MessageComposer } from "./MessageComposer";
  import { TypingIndicator } from "./TypingIndicator";
  import { Skeleton } from "@/components/ui/skeleton";
  // ScrollArea removed - using plain div for reliable scroll control
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import { Button } from "@/components/ui/button";
  import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
  import { useTypingIndicator } from "@/hooks/useTypingIndicator";
  import { useMessageReactions } from "@/hooks/useMessageReactions";
  import { useOnlineUsers } from "@/hooks/useOnlineUsers";
  import { useUserSafety } from "@/hooks/useUserSafety";
  import { BlockUserDialog } from "@/components/safety/BlockUserDialog";
  import { ReportUserDialog } from "@/components/safety/ReportUserDialog";
  import { cn } from "@/lib/utils";

  interface ChatWindowProps {
    conversationId: string | null;
    otherUser?: {
      user_id: string;
      display_name: string | null;
      avatar_url: string | null;
    };
  }

  export function ChatWindow({ conversationId, otherUser }: ChatWindowProps) {
    const { user } = useAuth();
    const { messages, loading, deleteMessage } = useDirectMessages(conversationId);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { typingUsers, setTyping } = useTypingIndicator(conversationId);
    const { toggleReaction, getReactionSummary } = useMessageReactions(conversationId);
    const { onlineUserIds } = useOnlineUsers();
    const { blockUser, unblockUser, reportUser, isBlocked } = useUserSafety();
    const [showBlockDialog, setShowBlockDialog] = useState(false);
    const [showReportDialog, setShowReportDialog] = useState(false);

    const isOnline = otherUser ? onlineUserIds.has(otherUser.user_id) : false;
    const userIsBlocked = otherUser ? isBlocked(otherUser.user_id) : false;

     useEffect(() => {
       if (scrollContainerRef.current) {
         scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
       }
     }, [messages]);

    const getInitials = (name?: string | null) => {
      if (!name) return "?";
      return name
        .split(" ")
        .map((n) => n.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    if (!conversationId) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-muted/20">
          <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Select a Conversation</h3>
          <p className="text-muted-foreground text-sm">
            Choose a conversation from the list or click "New Message" to start chatting with a friend.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {otherUser && (
          <div className="p-4 border-b flex items-center gap-3 bg-background">
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={otherUser.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {getInitials(otherUser.display_name)}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{otherUser.display_name || "Unknown User"}</p>
              <p className={cn("text-xs", isOnline ? "text-emerald-500" : "text-muted-foreground")}>
                {isOnline ? "Online" : "Offline"}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowBlockDialog(true)}>
                  <ShieldOff className="h-4 w-4 mr-2" />
                  {userIsBlocked ? "Unblock" : "Block"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="text-destructive">
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
 
       {/* Messages */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={i % 2 === 0 ? "flex justify-end" : ""}>
                  <Skeleton className="h-12 w-48" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No messages yet. Say hello! 👋</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === user?.id}
                  senderProfile={
                    message.sender_id !== user?.id
                      ? otherUser
                      : undefined
                  }
                 onDelete={() => deleteMessage(message.id)}
                 onReact={(emoji) => toggleReaction(message.id, emoji)}
                 reactions={getReactionSummary(message.id)}
                />
              ))}
              
            </div>
          )}
         
         {/* Typing Indicator */}
         <TypingIndicator typingUsers={typingUsers} className="mt-2" />
        </div>

       {/* Blocked state or Composer */}
      {userIsBlocked ? (
        <div className="p-4 border-t text-center text-sm text-muted-foreground bg-muted/30">
          You have blocked this user. <button className="text-primary underline" onClick={() => setShowBlockDialog(true)}>Unblock</button>
        </div>
      ) : (
        <MessageComposer conversationId={conversationId} onTyping={setTyping} />
      )}

      {otherUser && (
        <>
          <BlockUserDialog
            open={showBlockDialog}
            onOpenChange={setShowBlockDialog}
            userName={otherUser.display_name || "this user"}
            isBlocked={userIsBlocked}
            onConfirm={() => {
              if (userIsBlocked) {
                unblockUser(otherUser.user_id);
              } else {
                blockUser(otherUser.user_id);
              }
              setShowBlockDialog(false);
            }}
          />
          <ReportUserDialog
            open={showReportDialog}
            onOpenChange={setShowReportDialog}
            userName={otherUser.display_name || "this user"}
            onSubmit={(reason, details) => reportUser(otherUser.user_id, reason, details)}
          />
        </>
      )}
     </div>
   );
 }