import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AuditsController } from './audits.controller';
import { AuditsService } from './audits.service';
import { AuditRateLimitService } from './audit-rate-limit.service';
import { WebsocketsModule } from '../websockets/websockets.module';
import { AuditEngineModule } from '../audit-engine/audit-engine.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'audit' }),
    WebsocketsModule,
    AuditEngineModule,
  ],
  controllers: [AuditsController],
  providers: [AuditsService, AuditRateLimitService],
  exports: [AuditsService],
})
export class AuditsModule {}
