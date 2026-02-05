import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
 import { useProfileContext } from "@/contexts/ProfileContext";
import { useAssessmentResults } from "@/hooks/useAssessmentResults";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

interface AssessmentRequiredRouteProps {
  children: React.ReactNode;
}

export function AssessmentRequiredRoute({ children }: AssessmentRequiredRouteProps) {
  const { user, loading: authLoading } = useAuth();
   const { profile, loading: profileLoading } = useProfileContext();
  const { hasCompletedAssessment, loading: assessmentLoading } = useAssessmentResults();
  const location = useLocation();
  const { toast } = useToast();
  const hasShownToast = useRef(false);
   const hasShownDegreeToast = useRef(false);

   const loading = authLoading || assessmentLoading || profileLoading;

  useEffect(() => {
    if (!loading && user && !hasCompletedAssessment && !hasShownToast.current) {
      hasShownToast.current = true;
      toast({
        title: "Assessment Required",
        description: "Please complete your entry assessment to continue.",
      });
    }
  }, [loading, user, hasCompletedAssessment, toast]);
 
   // Show toast for degree path selection
   useEffect(() => {
     if (!loading && user && hasCompletedAssessment && !profile?.degree_path && !profile?.onboarding_completed && !hasShownDegreeToast.current) {
       hasShownDegreeToast.current = true;
       toast({
         title: "Choose Your Path",
         description: "Select your degree path to personalize your learning journey.",
       });
     }
   }, [loading, user, hasCompletedAssessment, profile, toast]);

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
 
   // Check if they need to select a degree path
   if (!profile?.degree_path && !profile?.onboarding_completed) {
     return <Navigate to="/assessment?step=degree-recommendation" state={{ from: location }} replace />;
   }

  return <>{children}</>;
}
