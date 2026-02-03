import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SubscriptionStatus = "trial" | "active" | "cancelled" | "expired";

interface SubscriptionState {
  status: SubscriptionStatus | null;
  trialStartedAt: Date | null;
  trialEndsAt: Date | null;
  subscriptionStartedAt: Date | null;
  subscriptionEndsAt: Date | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionState>({
    status: null,
    trialStartedAt: null,
    trialEndsAt: null,
    subscriptionStartedAt: null,
    subscriptionEndsAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscription({
        status: null,
        trialStartedAt: null,
        trialEndsAt: null,
        subscriptionStartedAt: null,
        subscriptionEndsAt: null,
      });
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("subscription_status, trial_started_at, trial_ends_at, subscription_started_at, subscription_ends_at")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSubscription({
            status: data.subscription_status as SubscriptionStatus,
            trialStartedAt: data.trial_started_at ? new Date(data.trial_started_at) : null,
            trialEndsAt: data.trial_ends_at ? new Date(data.trial_ends_at) : null,
            subscriptionStartedAt: data.subscription_started_at ? new Date(data.subscription_started_at) : null,
            subscriptionEndsAt: data.subscription_ends_at ? new Date(data.subscription_ends_at) : null,
          });
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const now = new Date();

  const isTrialing = useMemo(() => {
    return (
      subscription.status === "trial" &&
      subscription.trialEndsAt !== null &&
      subscription.trialEndsAt > now
    );
  }, [subscription.status, subscription.trialEndsAt]);

  const isPaid = useMemo(() => {
    return (
      subscription.status === "active" &&
      (subscription.subscriptionEndsAt === null || subscription.subscriptionEndsAt > now)
    );
  }, [subscription.status, subscription.subscriptionEndsAt]);

  const hasAccess = useMemo(() => {
    return isTrialing || isPaid;
  }, [isTrialing, isPaid]);

  const trialDaysRemaining = useMemo(() => {
    if (!subscription.trialEndsAt) return 0;
    const diffMs = subscription.trialEndsAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }, [subscription.trialEndsAt]);

  const trialExpired = useMemo(() => {
    return (
      subscription.status === "trial" &&
      subscription.trialEndsAt !== null &&
      subscription.trialEndsAt <= now
    );
  }, [subscription.status, subscription.trialEndsAt]);

  return {
    ...subscription,
    loading,
    error,
    isTrialing,
    isPaid,
    hasAccess,
    trialDaysRemaining,
    trialExpired,
  };
}
