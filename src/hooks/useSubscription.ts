import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTestModeContext } from "@/contexts/TestModeContext";

export type SubscriptionStatus = "trial" | "active" | "cancelled" | "expired";

interface SubscriptionState {
  status: SubscriptionStatus | null;
  trialStartedAt: Date | null;
  trialEndsAt: Date | null;
  subscriptionStartedAt: Date | null;
  subscriptionEndsAt: Date | null;
  termsAcceptedAt: Date | null;
}

export function useSubscription() {
  const { user } = useAuth();
  // Use context directly to avoid circular dependency with useTestMode
  const testModeContext = useTestModeContext();
  const isTestModeEnabled = testModeContext.isTestModeEnabled;
  
  const [subscription, setSubscription] = useState<SubscriptionState>({
    status: null,
    trialStartedAt: null,
    trialEndsAt: null,
    subscriptionStartedAt: null,
    subscriptionEndsAt: null,
    termsAcceptedAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription({
        status: null,
        trialStartedAt: null,
        trialEndsAt: null,
        subscriptionStartedAt: null,
        subscriptionEndsAt: null,
        termsAcceptedAt: null,
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("subscription_status, trial_started_at, trial_ends_at, subscription_started_at, subscription_ends_at, terms_accepted_at")
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
          termsAcceptedAt: data.terms_accepted_at ? new Date(data.terms_accepted_at) : null,
        });
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

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
    // Test mode bypasses subscription check
    if (isTestModeEnabled) return true;
    return isTrialing || isPaid;
  }, [isTrialing, isPaid, isTestModeEnabled]);

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

  const needsTermsAcceptance = useMemo(() => {
    return subscription.termsAcceptedAt === null;
  }, [subscription.termsAcceptedAt]);

  return {
    ...subscription,
    loading,
    error,
    isTrialing,
    isPaid,
    hasAccess,
    trialDaysRemaining,
    trialExpired,
    needsTermsAcceptance,
    refetch: fetchSubscription,
  };
}
