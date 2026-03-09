export type PlanTier = 'free' | 'pro' | 'premium';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trialing' | 'past_due';

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  auditsPerDay: number;       // -1 = unlimited
  historyDays: number;        // days to keep history, -1 = unlimited
  maxDomains: number;         // concurrent domains tracked
  hasExport: boolean;
  hasComparisons: boolean;
  hasApi: boolean;
  hasWhiteLabel: boolean;
  features: string[];
  isActive: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentGateway: string;
  gatewaySubscriptionId?: string;
}
