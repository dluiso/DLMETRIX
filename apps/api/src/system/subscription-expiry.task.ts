import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionExpiryTask {
  private readonly logger = new Logger(SubscriptionExpiryTask.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Runs every day at 02:00 UTC.
   * Checks for subscriptions that have passed their currentPeriodEnd
   * and downgrades the user role to PUBLIC.
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleExpiredSubscriptions() {
    const now = new Date();
    this.logger.log('Checking for expired subscriptions...');

    // Find active subscriptions past their end date
    const expired = await this.prisma.subscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIALING'] },
        currentPeriodEnd: { lt: now },
      },
      include: { user: true },
    });

    if (expired.length === 0) {
      this.logger.log('No expired subscriptions found.');
      return;
    }

    this.logger.log(`Found ${expired.length} expired subscription(s). Processing...`);

    for (const sub of expired) {
      try {
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'EXPIRED' },
        });

        // Downgrade user to PUBLIC role
        await this.prisma.user.update({
          where: { id: sub.userId },
          data: { role: 'PUBLIC' },
        });

        // Log activity
        await this.prisma.activityLog.create({
          data: {
            userId: sub.userId,
            action: 'SUBSCRIPTION_EXPIRED',
            entity: 'Subscription',
            entityId: sub.id,
            metadata: { previousRole: sub.user.role, newRole: 'PUBLIC' },
          },
        });

        this.logger.log(`Expired subscription ${sub.id} for user ${sub.user.email}`);
      } catch (err) {
        this.logger.error(`Failed to expire subscription ${sub.id}`, err);
      }
    }
  }

  /**
   * Runs every day at 08:00 UTC.
   * Marks subscriptions with cancelAtPeriodEnd as CANCELLED once the period ends.
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handlePendingCancellations() {
    const now = new Date();

    const pendingCancel = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        cancelAtPeriodEnd: true,
        currentPeriodEnd: { lt: now },
      },
    });

    for (const sub of pendingCancel) {
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { status: 'CANCELLED' },
      });

      await this.prisma.user.update({
        where: { id: sub.userId },
        data: { role: 'PUBLIC' },
      });

      this.logger.log(`Finalized cancellation for subscription ${sub.id}`);
    }
  }
}
