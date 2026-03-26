import React, { createContext, useContext, useState } from 'react';

type Plan = 'monthly' | 'annual';

interface SubscriptionContextType {
  isSubscribed: boolean;
  selectedPlan: Plan;
  setSelectedPlan: (plan: Plan) => void;
  activateTrial: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isSubscribed: false,
  selectedPlan: 'annual',
  setSelectedPlan: () => {},
  activateTrial: () => {},
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan>('annual');

  const activateTrial = () => {
    setIsSubscribed(true);
  };

  return (
    <SubscriptionContext.Provider value={{ isSubscribed, selectedPlan, setSelectedPlan, activateTrial }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
