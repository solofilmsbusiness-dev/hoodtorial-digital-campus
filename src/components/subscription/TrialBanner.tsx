import { Clock, AlertTriangle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

export function TrialBanner() {
  const { isTrialing, isPaid, trialDaysRemaining, trialExpired, loading } = useSubscription();

  if (loading || isPaid) return null;

  if (trialExpired) {
    return (
      <div className="bg-destructive/10 border-2 border-destructive text-destructive px-4 py-3">
        <div className="container mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-bold">
              Your trial has expired. Subscribe to continue learning.
            </span>
          </div>
          <Link
            to="/enrollment"
            className="btn-brutal bg-destructive text-destructive-foreground px-4 py-2 text-sm font-bold"
          >
            Subscribe Now
          </Link>
        </div>
      </div>
    );
  }

  if (isTrialing) {
    const isUrgent = trialDaysRemaining <= 1;

    return (
      <div
        className={cn(
          "px-4 py-3 border-2",
          isUrgent
            ? "bg-warning/10 border-warning text-warning-foreground"
            : "bg-accent/10 border-accent text-accent-foreground"
        )}
      >
        <div className="container mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {isUrgent ? (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Clock className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-bold">
              {trialDaysRemaining === 0
                ? "Your trial ends today!"
                : trialDaysRemaining === 1
                ? "1 day left in your trial"
                : `${trialDaysRemaining} days left in your free trial`}
            </span>
          </div>
          <Link
            to="/enrollment"
            className={cn(
              "px-4 py-2 text-sm font-bold border-2 transition-all",
              isUrgent
                ? "bg-warning text-warning-foreground border-warning hover:bg-warning/90"
                : "bg-accent text-accent-foreground border-accent hover:bg-accent/90"
            )}
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
