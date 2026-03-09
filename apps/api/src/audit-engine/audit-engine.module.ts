import { Module } from '@nestjs/common';
import { BullModule } from 'bullmq';
import { AuditEngineService } from './audit-engine.service';
import { AuditWorker } from './audit.worker';
import { LighthouseAnalyzer } from './analyzers/lighthouse.analyzer';
import { SeoAnalyzer } from './analyzers/seo.analyzer';
import { ContentAnalyzer } from './analyzers/content.analyzer';
import { MetadataAnalyzer } from './analyzers/metadata.analyzer';
import { LinksAnalyzer } from './analyzers/links.analyzer';
import { AccessibilityAnalyzer } from './analyzers/accessibility.analyzer';
import { SecurityAnalyzer } from './analyzers/security.analyzer';
import { ScoreCalculator } from './score-calculator';
import { ReportService } from './report.service';
import { ReportsController } from './reports.controller';
import { WebsocketsModule } from '../websockets/websockets.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'audit' }),
    WebsocketsModule,
  ],
  controllers: [ReportsController],
  providers: [
    AuditEngineService,
    AuditWorker,
    LighthouseAnalyzer,
    SeoAnalyzer,
    ContentAnalyzer,
    MetadataAnalyzer,
    LinksAnalyzer,
    AccessibilityAnalyzer,
    SecurityAnalyzer,
    ScoreCalculator,
    ReportService,
  ],
  exports: [AuditEngineService, ReportService],
})
export class AuditEngineModule {}
