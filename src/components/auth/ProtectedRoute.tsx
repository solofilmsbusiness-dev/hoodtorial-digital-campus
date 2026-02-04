import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ban } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();

  // Check if user is banned
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile-ban-check", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("is_banned, ban_reason")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // Cache for 30 seconds
  });

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary font-bold text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Show banned message if user is banned
  if (profile?.is_banned) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Ban className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Account Suspended</h1>
          <p className="text-muted-foreground">
            Your account has been suspended and you no longer have access to this platform.
          </p>
          {profile.ban_reason && (
            <div className="p-4 rounded-lg bg-muted text-left">
              <p className="text-sm font-medium">Reason:</p>
              <p className="text-sm text-muted-foreground">{profile.ban_reason}</p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            If you believe this is a mistake, please contact support.
          </p>
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
