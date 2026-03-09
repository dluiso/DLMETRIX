import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentGateway, CreateSubscriptionDto } from './payment-gateway.interface';

@Injectable()
export class PaypalGateway implements PaymentGateway {
  readonly name = 'paypal';
  private readonly logger = new Logger(PaypalGateway.name);
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private get baseUrl() {
    const mode = this.config.get('paypal.mode', 'sandbox');
    return mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  constructor(private config: ConfigService) {}

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const clientId = this.config.get('paypal.clientId');
    const clientSecret = this.config.get('paypal.clientSecret');
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const res = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await res.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  private async request(method: string, path: string, body?: any) {
    const token = await this.getAccessToken();
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`PayPal API error ${res.status}: ${err}`);
    }

    return res.json();
  }

  async createSubscription(dto: CreateSubscriptionDto) {
    // First create a billing plan (simplified — in production use pre-created plans)
    const order = await this.request('POST', '/v2/checkout/orders', {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: 'USD', value: '29.00' },
          description: `DLMETRIX Subscription - ${dto.planId}`,
          custom_id: `${dto.userId}:${dto.planId}`,
        },
      ],
      application_context: {
        return_url: dto.returnUrl,
        cancel_url: dto.cancelUrl,
        brand_name: 'DLMETRIX',
        user_action: 'PAY_NOW',
      },
    });

    const approvalLink = order.links?.find((l: any) => l.rel === 'approve')?.href;

    return {
      approvalUrl: approvalLink || '',
      gatewaySubscriptionId: order.id,
    };
  }

  async captureSubscription(orderId: string) {
    const result = await this.request('POST', `/v2/checkout/orders/${orderId}/capture`);
    return { status: result.status };
  }

  async cancelSubscription(subscriptionId: string) {
    this.logger.log(`Cancelling PayPal subscription ${subscriptionId}`);
    // Implementation depends on whether using Orders API or Subscriptions API
  }
}
