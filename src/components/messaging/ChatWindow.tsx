  import { useEffect, useRef } from "react";
  import { MessageCircle } from "lucide-react";
  import { useDirectMessages } from "@/hooks/useDirectMessages";
  import { useAuth } from "@/contexts/AuthContext";
  import { MessageBubble } from "./MessageBubble";
  import { MessageComposer } from "./MessageComposer";
  import { TypingIndicator } from "./TypingIndicator";
  import { Skeleton } from "@/components/ui/skeleton";
  import { ScrollArea } from "@/components/ui/scroll-area";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import { useTypingIndicator } from "@/hooks/useTypingIndicator";
  import { useMessageReactions } from "@/hooks/useMessageReactions";
  import { useOnlineUsers } from "@/hooks/useOnlineUsers";
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
     const bottomRef = useRef<HTMLDivElement>(null);
    const { typingUsers, setTyping } = useTypingIndicator(conversationId);
    const { toggleReaction, getReactionSummary } = useMessageReactions(conversationId);
    const { onlineUserIds } = useOnlineUsers();

    const isOnline = otherUser ? onlineUserIds.has(otherUser.user_id) : false;

     useEffect(() => {
       bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
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
            <div>
              <p className="font-semibold">{otherUser.display_name || "Unknown User"}</p>
              <p className={cn("text-xs", isOnline ? "text-emerald-500" : "text-muted-foreground")}>
                {isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        )}
 
       {/* Messages */}
        <ScrollArea className="flex-1 p-4">
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
              <div ref={bottomRef} />
            </div>
          )}
         
         {/* Typing Indicator */}
         <TypingIndicator typingUsers={typingUsers} className="mt-2" />
        </ScrollArea>
 
       {/* Composer */}
      <MessageComposer conversationId={conversationId} onTyping={setTyping} />
     </div>
   );
 }