 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 
 export function useTesterAuth() {
   const { user, loading: authLoading } = useAuth();
 
   const { data: isTester, isLoading: roleLoading } = useQuery({
     queryKey: ["tester-role", user?.id],
     queryFn: async () => {
       if (!user?.id) return false;
       const { data } = await supabase.rpc("has_role", {
         _user_id: user.id,
         _role: "tester",
       });
       return data === true;
     },
     enabled: !!user?.id,
     staleTime: 5 * 60 * 1000,
   });
 
   return {
     isTester: isTester ?? false,
     isLoading: authLoading || roleLoading,
     user,
   };
 }