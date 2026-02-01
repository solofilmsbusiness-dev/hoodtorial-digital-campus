import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAdmin, isLoading } = useAdminAuth();
  const location = useLocation();
  const { toast } = useToast();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (!isLoading && user && !isAdmin && !hasShownToast.current) {
      hasShownToast.current = true;
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin area.",
        variant: "destructive",
      });
    }
  }, [isLoading, user, isAdmin, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
