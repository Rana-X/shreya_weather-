import { useState, useEffect } from "react";
import { useUser } from "@clerk/react";

export interface SubscriptionStatus {
  isPremium: boolean;
  loading: boolean;
  subscription: Record<string, unknown> | null;
}

export function useSubscription(): SubscriptionStatus {
  const { isSignedIn, isLoaded } = useUser();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isPremium: false,
    loading: true,
    subscription: null,
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setStatus({ isPremium: false, loading: false, subscription: null });
      return;
    }

    fetch("/api/stripe/subscription")
      .then((r) => r.json())
      .then((data) => {
        setStatus({
          isPremium: data.isPremium ?? false,
          loading: false,
          subscription: data.subscription ?? null,
        });
      })
      .catch(() => setStatus({ isPremium: false, loading: false, subscription: null }));
  }, [isSignedIn, isLoaded]);

  return status;
}
