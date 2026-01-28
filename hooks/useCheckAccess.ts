import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface AccessResponse {
  hasAccess: boolean;
  subscription?: {
    id: number;
    startDate: string;
    endDate: string | null;
    accessToken: string;
  };
  message?: string;
  error?: string;
}

export function useCheckAccess(planId: number | null) {
  const { data: session, status } = useSession();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<AccessResponse['subscription'] | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!planId || status !== 'authenticated') {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/subscriptions/check?planId=${planId}`);
        const data: AccessResponse = await response.json();

        setHasAccess(data.hasAccess);
        setSubscription(data.subscription || null);
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [planId, status]);

  return {
    hasAccess,
    loading,
    subscription,
    isAuthenticated: status === 'authenticated',
  };
}
