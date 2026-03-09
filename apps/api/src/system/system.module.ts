import { Module } from '@nestjs/common';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { SubscriptionExpiryTask } from './subscription-expiry.task';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SystemService, SubscriptionExpiryTask],
  controllers: [SystemController],
  exports: [SystemService],
})
export class SystemModule {}
