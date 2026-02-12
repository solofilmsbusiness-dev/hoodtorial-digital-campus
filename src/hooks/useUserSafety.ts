import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useUserSafety() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchBlocks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_blocks")
      .select("blocked_id")
      .eq("blocker_id", user.id);
    if (data) {
      setBlockedUserIds(new Set(data.map((b: any) => b.blocked_id)));
    }
  }, [user]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const blockUser = async (blockedId: string) => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("user_blocks")
      .insert({ blocker_id: user.id, blocked_id: blockedId } as any);
    if (error) {
      toast({ title: "Error", description: "Failed to block user.", variant: "destructive" });
    } else {
      setBlockedUserIds((prev) => new Set([...prev, blockedId]));
      toast({ title: "User blocked", description: "They can no longer message you." });
    }
    setLoading(false);
  };

  const unblockUser = async (blockedId: string) => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("user_blocks")
      .delete()
      .eq("blocker_id", user.id)
      .eq("blocked_id", blockedId);
    if (error) {
      toast({ title: "Error", description: "Failed to unblock user.", variant: "destructive" });
    } else {
      setBlockedUserIds((prev) => {
        const next = new Set(prev);
        next.delete(blockedId);
        return next;
      });
      toast({ title: "User unblocked" });
    }
    setLoading(false);
  };

  const reportUser = async (reportedId: string, reason: string, details?: string) => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("user_reports")
      .insert({ reporter_id: user.id, reported_id: reportedId, reason, details } as any);
    if (error) {
      toast({ title: "Error", description: "Failed to submit report.", variant: "destructive" });
    } else {
      toast({ title: "Report submitted", description: "Thank you. Our team will review this." });
    }
    setLoading(false);
  };

  const isBlocked = (userId: string) => blockedUserIds.has(userId);

  return { blockedUserIds, blockUser, unblockUser, reportUser, isBlocked, loading, refetchBlocks: fetchBlocks };
}
