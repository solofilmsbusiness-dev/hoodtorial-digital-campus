import { useState } from "react";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAdminSupport, useAdminSupportMessages, type TicketWithProfile } from "@/hooks/useAdminSupport";
import { toast } from "@/hooks/use-toast";
import { Loader2, Send, CheckCircle2, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SupportConversationProps {
  ticket: TicketWithProfile;
  onClose: () => void;
}

export function SupportConversation({ ticket, onClose }: SupportConversationProps) {
  const { sendReply, resolveTicket, reopenTicket, isSending, isResolving } = useAdminSupport();
  const { messages, isLoading } = useAdminSupportMessages(ticket.id);
  const [replyContent, setReplyContent] = useState("");

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;

    try {
      await sendReply({ ticketId: ticket.id, content: replyContent.trim() });
      setReplyContent("");
      toast({
        title: "Reply sent",
        description: "Your response has been sent to the user.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResolve = async () => {
    try {
      await resolveTicket(ticket.id);
      toast({
        title: "Ticket resolved",
        description: "The support ticket has been marked as resolved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReopen = async () => {
    try {
      await reopenTicket(ticket.id);
      toast({
        title: "Ticket reopened",
        description: "The support ticket has been reopened.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reopen ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-4">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={ticket.profile?.avatar_url || undefined} />
                <AvatarFallback>
                  {ticket.profile?.display_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-left">
                  {ticket.profile?.display_name || "Unknown User"}
                </SheetTitle>
                <p className="text-sm text-muted-foreground">
                  Created {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <Badge variant={ticket.status === "open" ? "default" : "secondary"}>
              {ticket.status}
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="font-medium">{ticket.subject}</p>
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1 p-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.is_admin ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.is_admin
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.is_admin ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {msg.is_admin ? "You" : ticket.profile?.display_name || "User"} •{" "}
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <Separator />

      <div className="p-6 space-y-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={2}
            className="flex-1"
          />
          <Button
            onClick={handleSendReply}
            disabled={isSending || !replyContent.trim()}
            size="icon"
            className="h-auto"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex gap-2">
          {ticket.status === "open" ? (
            <Button
              onClick={handleResolve}
              disabled={isResolving}
              variant="outline"
              className="flex-1"
            >
              {isResolving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Mark as Resolved
            </Button>
          ) : (
            <Button
              onClick={handleReopen}
              disabled={isResolving}
              variant="outline"
              className="flex-1"
            >
              {isResolving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Reopen Ticket
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
