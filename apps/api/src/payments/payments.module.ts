import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaypalGateway } from './gateways/paypal.gateway';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PaypalGateway],
  exports: [PaymentsService],
})
export class PaymentsModule {}
