import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaypalGateway } from './gateways/paypal.gateway';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private paypal: PaypalGateway,
    private config: ConfigService,
  ) {}

  async initiateSubscription(userId: string, planId: string, billingCycle: 'monthly' | 'yearly', gateway = 'paypal') {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    const frontendUrl = this.config.get('frontendUrl', 'http://localhost:3000');

    const result = await this.paypal.createSubscription({
      planId,
      userId,
      billingCycle,
      returnUrl: `${frontendUrl}/dashboard/billing/success?plan=${planId}&billing=${billingCycle}`,
      cancelUrl: `${frontendUrl}/dashboard/billing?cancelled=true`,
    });

    return result;
  }

  async capturePayment(orderId: string, userId: string, planId: string, billingCycle: 'monthly' | 'yearly' = 'monthly') {
    const result = await this.paypal.captureSubscription(orderId);

    if (result.status === 'COMPLETED') {
      const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
      if (!plan) throw new NotFoundException('Plan not found');

      const isYearly = billingCycle === 'yearly';
      const now = new Date();
      const periodEnd = new Date(now);
      if (isYearly) {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      const cycle = isYearly ? 'YEARLY' : 'MONTHLY';
      const amount = isYearly ? plan.priceYearly : plan.priceMonthly;

      await this.prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          planId,
          status: 'ACTIVE',
          billingCycle: cycle,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          paymentGateway: 'paypal',
          gatewaySubscriptionId: orderId,
        },
        update: {
          planId,
          status: 'ACTIVE',
          billingCycle: cycle,
          cancelAtPeriodEnd: false,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          gatewaySubscriptionId: orderId,
        },
      });

      // Update user role
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: plan.tier === 'PREMIUM' ? 'PREMIUM' : 'PRO' },
      });

      // Log payment
      await this.prisma.payment.create({
        data: {
          userId,
          amount,
          currency: plan.currency,
          status: 'COMPLETED',
          gateway: 'paypal',
          gatewayPaymentId: orderId,
          description: `${plan.name} – ${cycle.toLowerCase()} subscription`,
        },
      });
    }

    return result;
  }

  async cancelSubscription(userId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub) throw new NotFoundException('No active subscription found');
    if (sub.status === 'CANCELLED') throw new BadRequestException('Subscription is already cancelled');

    await this.prisma.subscription.update({
      where: { userId },
      data: {
        status: 'CANCELLED',
        cancelAtPeriodEnd: true,
      },
    });

    // Downgrade user role immediately to PUBLIC
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'PUBLIC' },
    });

    return { message: 'Subscription cancelled. Access continues until end of billing period.' };
  }

  getUserPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
