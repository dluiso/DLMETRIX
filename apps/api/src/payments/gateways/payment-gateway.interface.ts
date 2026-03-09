export interface CreateSubscriptionDto {
  planId: string;
  userId: string;
  billingCycle: 'monthly' | 'yearly';
  returnUrl: string;
  cancelUrl: string;
}

export interface PaymentGateway {
  readonly name: string;
  createSubscription(dto: CreateSubscriptionDto): Promise<{ approvalUrl: string; gatewaySubscriptionId: string }>;
  captureSubscription(subscriptionId: string): Promise<{ status: string }>;
  cancelSubscription(subscriptionId: string): Promise<void>;
}
