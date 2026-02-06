import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WaitlistEntry {
  id: string;
  email: string;
  name: string | null;
  desired_username: string | null;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useWaitlist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: entries, isLoading } = useQuery({
    queryKey: ["admin-waitlist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waitlist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as WaitlistEntry[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: "pending" | "approved" | "rejected";
      notes?: string;
    }) => {
      const updateData: { status: string; notes?: string } = { status };
      if (notes !== undefined) {
        updateData.notes = notes;
      }

      const { error } = await supabase
        .from("waitlist")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-waitlist"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-waitlist"] });
      toast({
        title: "Status updated",
        description: "Waitlist entry has been updated.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update waitlist entry.",
      });
      console.error("Update error:", error);
    },
  });

  // New mutation for approving with account creation
  const approveEntry = useMutation({
    mutationFn: async (waitlistId: string) => {
      const { data, error } = await supabase.functions.invoke("approve-waitlist", {
        body: { waitlistId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-waitlist"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-waitlist"] });
      toast({
        title: "User approved! 🎉",
        description: data?.message || "Acceptance email has been sent.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Approval failed",
        description: error.message || "Failed to approve waitlist entry.",
      });
      console.error("Approve error:", error);
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("waitlist").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-waitlist"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-waitlist"] });
      toast({
        title: "Entry deleted",
        description: "Waitlist entry has been removed.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete waitlist entry.",
      });
      console.error("Delete error:", error);
    },
  });

  const pendingCount = entries?.filter((e) => e.status === "pending").length || 0;
  const approvedCount = entries?.filter((e) => e.status === "approved").length || 0;
  const rejectedCount = entries?.filter((e) => e.status === "rejected").length || 0;

  return {
    entries: entries || [],
    isLoading,
    updateStatus: updateStatus.mutate,
    approveEntry: approveEntry.mutate,
    deleteEntry: deleteEntry.mutate,
    pendingCount,
    approvedCount,
    rejectedCount,
    isUpdating: updateStatus.isPending,
    isApproving: approveEntry.isPending,
    isDeleting: deleteEntry.isPending,
  };
}

export function usePendingWaitlistCount() {
  const { data: count } = useQuery({
    queryKey: ["admin-pending-waitlist"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("waitlist")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      if (error) throw error;
      return count || 0;
    },
  });

  return count || 0;
}
