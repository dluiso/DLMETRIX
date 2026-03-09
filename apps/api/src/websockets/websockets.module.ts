import { Module } from '@nestjs/common';
import { AuditGateway } from './audit.gateway';

@Module({
  providers: [AuditGateway],
  exports: [AuditGateway],
})
export class WebsocketsModule {}
