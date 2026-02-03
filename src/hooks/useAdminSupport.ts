import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import type { SupportTicket, SupportMessage } from "./useSupportTickets";

export interface TicketWithProfile extends SupportTicket {
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  last_message?: string;
}

export function useAdminSupport() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-support-tickets"],
    queryFn: async () => {
      // Fetch tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from("support_tickets")
        .select("*")
        .order("updated_at", { ascending: false });

      if (ticketsError) throw ticketsError;

      // Fetch profiles for all ticket users
      const userIds = [...new Set(ticketsData.map((t) => t.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profilesMap = new Map(
        profilesData?.map((p) => [p.user_id, p]) || []
      );

      // Fetch last message for each ticket
      const ticketIds = ticketsData.map((t) => t.id);
      const { data: messagesData } = await supabase
        .from("support_messages")
        .select("ticket_id, content, created_at")
        .in("ticket_id", ticketIds)
        .order("created_at", { ascending: false });

      const lastMessageMap = new Map<string, string>();
      messagesData?.forEach((m) => {
        if (!lastMessageMap.has(m.ticket_id)) {
          lastMessageMap.set(m.ticket_id, m.content);
        }
      });

      return ticketsData.map((ticket) => ({
        ...ticket,
        profile: profilesMap.get(ticket.user_id),
        last_message: lastMessageMap.get(ticket.id),
      })) as TicketWithProfile[];
    },
    enabled: !!user,
  });

  const openTicketsCount = tickets.filter((t) => t.status === "open").length;

  const sendReplyMutation = useMutation({
    mutationFn: async ({ ticketId, content }: { ticketId: string; content: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase.from("support_messages").insert({
        ticket_id: ticketId,
        sender_id: user.id,
        content,
        is_admin: true,
      });

      if (error) throw error;

      // Update ticket's updated_at
      await supabase
        .from("support_tickets")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", ticketId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["support-messages"] });
    },
  });

  const resolveTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("support_tickets")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
        })
        .eq("id", ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
    },
  });

  const reopenTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase
        .from("support_tickets")
        .update({
          status: "open",
          resolved_at: null,
          resolved_by: null,
        })
        .eq("id", ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
    },
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("admin-support-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_tickets",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
          queryClient.invalidateQueries({ queryKey: ["support-messages"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return {
    tickets,
    isLoading,
    refetch,
    openTicketsCount,
    sendReply: sendReplyMutation.mutateAsync,
    resolveTicket: resolveTicketMutation.mutateAsync,
    reopenTicket: reopenTicketMutation.mutateAsync,
    isSending: sendReplyMutation.isPending,
    isResolving: resolveTicketMutation.isPending,
  };
}

export function useAdminSupportMessages(ticketId: string | null) {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["support-messages", ticketId],
    queryFn: async () => {
      if (!ticketId) return [];
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as SupportMessage[];
    },
    enabled: !!ticketId,
  });

  // Real-time subscription for messages
  useEffect(() => {
    if (!ticketId) return;

    const channel = supabase
      .channel(`admin-messages-${ticketId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `ticket_id=eq.${ticketId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["support-messages", ticketId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, queryClient]);

  return { messages, isLoading };
}
