import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { TicketWithProfile } from "@/hooks/useAdminSupport";

interface SupportTicketListProps {
  tickets: TicketWithProfile[];
  onTicketClick: (ticket: TicketWithProfile) => void;
}

export function SupportTicketList({ tickets, onTicketClick }: SupportTicketListProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead className="hidden md:table-cell">Last Message</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow
              key={ticket.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onTicketClick(ticket)}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={ticket.profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {ticket.profile?.display_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium truncate max-w-[120px]">
                    {ticket.profile?.display_name || "Unknown User"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="font-medium max-w-[200px] truncate">
                {ticket.subject}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground max-w-[200px] truncate">
                {ticket.last_message || "No messages"}
              </TableCell>
              <TableCell className="text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <Badge variant={ticket.status === "open" ? "default" : "secondary"}>
                  {ticket.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
