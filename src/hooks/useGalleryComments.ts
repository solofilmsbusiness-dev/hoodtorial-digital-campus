import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface GalleryComment {
  id: string;
  gallery_owner_id: string;
  image_url: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function useGalleryComments(galleryOwnerId: string | undefined, imageUrl: string | null) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const queryKey = ["gallery_comments", galleryOwnerId, imageUrl];

  const query = useQuery({
    queryKey,
    enabled: !!galleryOwnerId && !!imageUrl,
    queryFn: async (): Promise<GalleryComment[]> => {
      const { data, error } = await supabase
        .from("gallery_comments")
        .select("*")
        .eq("gallery_owner_id", galleryOwnerId!)
        .eq("image_url", imageUrl!)
        .order("created_at", { ascending: true });
      if (error) throw error;

      // Fetch profiles for commenters
      const userIds = [...new Set((data as GalleryComment[]).map((c) => c.user_id))];
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);

      return (data as GalleryComment[]).map((c) => ({
        ...c,
        profile: profileMap.get(c.user_id) ?? { display_name: null, avatar_url: null },
      }));
    },
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !galleryOwnerId || !imageUrl) throw new Error("Missing data");
      const { error } = await supabase.from("gallery_comments").insert({
        gallery_owner_id: galleryOwnerId,
        image_url: imageUrl,
        user_id: user.id,
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.from("gallery_comments").delete().eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  return { comments: query.data ?? [], isLoading: query.isLoading, addComment, deleteComment };
}
