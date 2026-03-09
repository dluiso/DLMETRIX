import { Controller, Post, Get, Body, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('subscribe')
  initiate(
    @CurrentUser() user: any,
    @Body() body: { planId: string; billingCycle: 'monthly' | 'yearly'; gateway?: string },
  ) {
    return this.paymentsService.initiateSubscription(
      user.id, body.planId, body.billingCycle, body.gateway,
    );
  }

  @Post('capture')
  capture(
    @CurrentUser() user: any,
    @Body() body: { orderId: string; planId: string; billingCycle?: 'monthly' | 'yearly' },
  ) {
    return this.paymentsService.capturePayment(body.orderId, user.id, body.planId, body.billingCycle);
  }

  @Post('cancel')
  @HttpCode(200)
  cancel(@CurrentUser() user: any) {
    return this.paymentsService.cancelSubscription(user.id);
  }

  @Get('history')
  history(@CurrentUser() user: any) {
    return this.paymentsService.getUserPayments(user.id);
  }
}
