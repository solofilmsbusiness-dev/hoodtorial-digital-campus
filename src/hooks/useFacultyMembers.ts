import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface FacultyMember {
  id: string;
  name: string;
  role: string;
  department: string;
  expertise: string[];
  bio: string | null;
  featured: boolean;
  display_order: number;
  image_url: string | null;
  created_at: string;
}

export type FacultyMemberInsert = Omit<FacultyMember, "id" | "created_at">;
export type FacultyMemberUpdate = Partial<FacultyMemberInsert> & { id: string };

const QUERY_KEY = ["faculty_members"];

export function useFacultyMembers() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<FacultyMember[]> => {
      const { data, error } = await supabase
        .from("faculty_members")
        .select("*")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as FacultyMember[];
    },
  });
}

export function useCreateFacultyMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (member: FacultyMemberInsert) => {
      const { error } = await supabase.from("faculty_members").insert(member);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Faculty member added" });
    },
    onError: (e: Error) => {
      toast({ title: "Error adding faculty", description: e.message, variant: "destructive" });
    },
  });
}

export function useUpdateFacultyMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: FacultyMemberUpdate) => {
      const { error } = await supabase.from("faculty_members").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Faculty member updated" });
    },
    onError: (e: Error) => {
      toast({ title: "Error updating faculty", description: e.message, variant: "destructive" });
    },
  });
}

export function useDeleteFacultyMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faculty_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Faculty member deleted" });
    },
    onError: (e: Error) => {
      toast({ title: "Error deleting faculty", description: e.message, variant: "destructive" });
    },
  });
}
