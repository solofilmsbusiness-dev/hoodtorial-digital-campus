import { Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SubscriptionGate({ children, fallback }: SubscriptionGateProps) {
  const { hasAccess, loading, trialExpired } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-primary font-bold">Loading...</div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="border-2 border-border bg-card p-8 text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-muted border-2 border-border flex items-center justify-center">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">
            {trialExpired ? "Trial Expired" : "Subscription Required"}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {trialExpired
              ? "Your free trial has ended. Subscribe to continue accessing course content and continue your learning journey."
              : "Access to course content requires an active subscription. Start your free 3-day trial today!"}
          </p>
        </div>
        <Link
          to="/enrollment"
          className="btn-brutal inline-flex items-center gap-2 px-6 py-3 font-bold"
        >
          {trialExpired ? "Subscribe Now" : "Start Free Trial"}
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
