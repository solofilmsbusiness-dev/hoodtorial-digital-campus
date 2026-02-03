import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

interface PaidRouteProps {
  children: React.ReactNode;
}

export function PaidRoute({ children }: PaidRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasAccess, loading: subLoading } = useSubscription();
  const location = useLocation();

  const loading = authLoading || subLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary font-bold text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!hasAccess) {
    return <Navigate to="/enrollment" state={{ from: location, reason: "subscription" }} replace />;
  }

  return <>{children}</>;
}
