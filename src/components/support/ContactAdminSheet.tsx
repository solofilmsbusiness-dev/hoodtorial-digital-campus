import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useSupportTickets, useSupportMessages, type SupportTicket } from "@/hooks/useSupportTickets";
import { toast } from "@/hooks/use-toast";
import { Loader2, Send, MessageCircle, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ContactAdminSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactAdminSheet({ open, onOpenChange }: ContactAdminSheetProps) {
  const { tickets, createTicket, sendMessage, isCreating, isSending } = useSupportTickets();
  const [view, setView] = useState<"list" | "new" | "conversation">("list");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [replyContent, setReplyContent] = useState("");

  const { messages } = useSupportMessages(selectedTicket?.id || null);

  const handleCreateTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in both subject and message.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTicket({ subject: subject.trim(), message: message.trim() });
      toast({
        title: "Message sent",
        description: "Your support request has been submitted. We'll respond soon!",
      });
      setSubject("");
      setMessage("");
      setView("list");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendReply = async () => {
    if (!replyContent.trim() || !selectedTicket) return;

    try {
      await sendMessage({ ticketId: selectedTicket.id, content: replyContent.trim() });
      setReplyContent("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openTickets = tickets.filter((t) => t.status === "open");
  const resolvedTickets = tickets.filter((t) => t.status === "resolved");

  const renderContent = () => {
    if (view === "new") {
      return (
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("list")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="What do you need help with?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Describe your issue or question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />
          </div>

          <Button
            onClick={handleCreateTicket}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Message
          </Button>
        </div>
      );
    }

    if (view === "conversation" && selectedTicket) {
      return (
        <div className="flex flex-col h-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setView("list");
              setSelectedTicket(null);
            }}
            className="mb-2 self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">{selectedTicket.subject}</h3>
              <p className="text-sm text-muted-foreground">
                Created {formatDistanceToNow(new Date(selectedTicket.created_at), { addSuffix: true })}
              </p>
            </div>
            <Badge variant={selectedTicket.status === "open" ? "default" : "secondary"}>
              {selectedTicket.status}
            </Badge>
          </div>

          <Separator className="mb-4" />

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.is_admin
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.is_admin ? "text-muted-foreground" : "text-primary-foreground/70"
                      }`}
                    >
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {selectedTicket.status === "open" && (
            <div className="mt-4 flex gap-2">
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
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      );
    }

    // List view
    return (
      <div className="space-y-4">
        <Button onClick={() => setView("new")} className="w-full">
          <MessageCircle className="h-4 w-4 mr-2" />
          New Support Request
        </Button>

        {tickets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No support requests yet.</p>
            <p className="text-sm">Click above to start a conversation.</p>
          </div>
        ) : (
          <>
            {openTickets.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Open Requests
                </h4>
                {openTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setView("conversation");
                    }}
                  />
                ))}
              </div>
            )}

            {resolvedTickets.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  Resolved
                </h4>
                {resolvedTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setView("conversation");
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Contact Support</SheetTitle>
          <SheetDescription>
            Send a message to our team and we'll get back to you as soon as possible.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden mt-4">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function TicketCard({
  ticket,
  onClick,
}: {
  ticket: SupportTicket;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium truncate">{ticket.subject}</span>
        <Badge variant={ticket.status === "open" ? "default" : "secondary"} className="ml-2 shrink-0">
          {ticket.status}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        Updated {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
      </p>
    </button>
  );
}
