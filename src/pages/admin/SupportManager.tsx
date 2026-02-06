import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupportTicketList } from "@/components/admin/SupportTicketList";
import { SupportConversation } from "@/components/admin/SupportConversation";
import { useAdminSupport, type TicketWithProfile } from "@/hooks/useAdminSupport";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Loader2, Inbox } from "lucide-react";

export default function SupportManager() {
  const { tickets, isLoading, openTicketsCount } = useAdminSupport();
  const [selectedTicket, setSelectedTicket] = useState<TicketWithProfile | null>(null);
  const [conversationOpen, setConversationOpen] = useState(false);

  const openTickets = tickets.filter((t) => t.status === "open");
  const resolvedTickets = tickets.filter((t) => t.status === "resolved");

  const handleTicketClick = (ticket: TicketWithProfile) => {
    setSelectedTicket(ticket);
    setConversationOpen(true);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Support" pageKey="support">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Support" pageKey="support">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Support</h1>
          <p className="text-muted-foreground">
            Manage student support requests
          </p>
        </div>

        <Tabs defaultValue="open" className="space-y-4">
          <TabsList>
            <TabsTrigger value="open" className="relative">
              Open
              {openTicketsCount > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                  {openTicketsCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          <TabsContent value="open">
            {openTickets.length === 0 ? (
              <EmptyState message="No open support requests" />
            ) : (
              <SupportTicketList
                tickets={openTickets}
                onTicketClick={handleTicketClick}
              />
            )}
          </TabsContent>

          <TabsContent value="resolved">
            {resolvedTickets.length === 0 ? (
              <EmptyState message="No resolved tickets" />
            ) : (
              <SupportTicketList
                tickets={resolvedTickets}
                onTicketClick={handleTicketClick}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={conversationOpen} onOpenChange={setConversationOpen}>
        <SheetContent className="w-full sm:max-w-xl flex flex-col p-0">
          {selectedTicket && (
            <SupportConversation
              ticket={selectedTicket}
              onClose={() => setConversationOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Inbox className="h-12 w-12 mb-4 opacity-50" />
      <p>{message}</p>
    </div>
  );
}
