import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useAssessmentResults } from "@/hooks/useAssessmentResults";
import { useTestMode } from "@/hooks/useTestMode";

interface PaidRouteProps {
  children: React.ReactNode;
}

export function PaidRoute({ children }: PaidRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasCompletedAssessment, loading: assessmentLoading } = useAssessmentResults();
  const { hasAccess, loading: subLoading } = useSubscription();
  const { isTestModeEnabled, canUseTestMode } = useTestMode();
  const location = useLocation();

  const loading = authLoading || assessmentLoading || subLoading;

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

  if (!hasCompletedAssessment) {
    return <Navigate to="/assessment" state={{ from: location }} replace />;
  }

  // Test Mode: bypass subscription check for admins
  if (canUseTestMode && isTestModeEnabled) {
    return <>{children}</>;
  }

  if (!hasAccess) {
    return <Navigate to="/enrollment" state={{ from: location, reason: "subscription" }} replace />;
  }

  return <>{children}</>;
}
