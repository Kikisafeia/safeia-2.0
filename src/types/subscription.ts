export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'trial' | 'cancelled' | 'expired';
  startDate: string;
  trialEndsAt: string;
  currentPeriodEnd: string;
  paypalSubscriptionId?: string;
  cancelAtPeriodEnd: boolean;
}

export interface PayPalPlan {
  id: string;
  planId: string; // nuestro ID de plan interno
  paypalPlanId: string;
  status: 'active' | 'inactive';
}

export interface SubscriptionPeriod {
  start: Date;
  end: Date;
  trial?: boolean;
}
