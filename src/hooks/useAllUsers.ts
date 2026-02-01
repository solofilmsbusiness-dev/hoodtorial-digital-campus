import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export interface UserWithRoles {
  id: string;
  email: string;
  displayName: string | null;
  roles: AppRole[];
  enrolledAt: string;
}

export function useAllUsers() {
  return useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, display_name, enrolled_at")
        .order("enrolled_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all roles (admin can see all via RLS policy)
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Group roles by user_id
      const rolesByUser = roles.reduce((acc, { user_id, role }) => {
        if (!acc[user_id]) acc[user_id] = [];
        acc[user_id].push(role);
        return acc;
      }, {} as Record<string, AppRole[]>);

      // Combine profiles with roles
      const users: UserWithRoles[] = profiles.map((profile) => ({
        id: profile.user_id,
        email: "", // We'll need to get this from auth, but for now show user_id
        displayName: profile.display_name,
        roles: rolesByUser[profile.user_id] || ["student"],
        enrolledAt: profile.enrolled_at,
      }));

      return users;
    },
  });
}
