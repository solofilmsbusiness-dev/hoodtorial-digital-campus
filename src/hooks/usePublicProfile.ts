 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 import { useFriendships } from "@/hooks/useFriendships";
 
 export interface PublicProfile {
   user_id: string;
   display_name: string | null;
   avatar_url: string | null;
   cover_banner_url: string | null;
   bio: string | null;
   filmmaking_style: string | null;
   camera_gear: string | null;
   current_project: string | null;
   favorite_films: string[] | null;
   influences: string | null;
   portfolio_url: string | null;
   imdb_url: string | null;
   vimeo_url: string | null;
   instagram_url: string | null;
   youtube_url: string | null;
   twitter_url: string | null;
   tiktok_url: string | null;
   profile_accent_color: string | null;
   avatar_border_style: string | null;
  portfolio_gallery: string[] | null;
  featured_project_url: string | null;
  featured_project_title: string | null;
  featured_project_thumbnail: string | null;
  profile_section_order: string[] | null;
 }
 
 export type UserRole = "admin" | "professor" | "moderator" | "tester" | "student";
 
 export function usePublicProfile(userId: string | null) {
   const { user } = useAuth();
   const { friends } = useFriendships();
   
   const isOwnProfile = user?.id === userId;
   const isFriend = friends.some(f => f.user_id === userId);
   
   const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
     queryKey: ["public-profile", userId],
     queryFn: async () => {
       if (!userId) return null;
       
       const { data, error } = await supabase
         .from("profiles_public")
         .select("*")
         .eq("user_id", userId)
         .single();
       
       if (error) throw error;
       return data as PublicProfile;
     },
     enabled: !!userId,
   });
   
   const { data: role, isLoading: roleLoading } = useQuery({
     queryKey: ["user-role", userId],
     queryFn: async () => {
       if (!userId) return "student" as UserRole;
       
       // Check roles in priority order
       const roles: UserRole[] = ["admin", "professor", "moderator", "tester"];
       
       for (const r of roles) {
         const { data } = await supabase.rpc("has_role", {
           _user_id: userId,
           _role: r,
         });
         if (data === true) return r;
       }
       
       return "student" as UserRole;
     },
     enabled: !!userId,
     staleTime: 5 * 60 * 1000,
   });
   
   return {
     profile,
     role: role ?? "student",
     isOwnProfile,
     isFriend,
     isLoading: profileLoading || roleLoading,
     error: profileError,
   };
 }