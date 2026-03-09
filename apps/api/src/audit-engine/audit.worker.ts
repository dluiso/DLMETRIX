import { Processor, WorkerHost } from 'bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AuditEngineService } from './audit-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditGateway } from '../websockets/audit.gateway';
import { AUDIT_PHASES } from '@dlmetrix/shared';

@Processor('audit', {
  concurrency: 3, // max 3 audits simultaneously
})
export class AuditWorker extends WorkerHost {
  private readonly logger = new Logger(AuditWorker.name);

  constructor(
    private engineService: AuditEngineService,
    private prisma: PrismaService,
    private gateway: AuditGateway,
  ) {
    super();
  }

  async process(job: Job<{ auditId: string; url: string }>) {
    const { auditId, url } = job.data;
    this.logger.log(`Processing audit ${auditId} for ${url}`);

    const emitProgress = (phase: string, progress: number, message: string) => {
      this.gateway.emitProgress({ auditId, phase: phase as any, progress, message, timestamp: Date.now() });
    };

    try {
      // Update status to running
      await this.prisma.audit.update({
        where: { id: auditId },
        data: { status: 'RUNNING', startedAt: new Date() },
      });

      emitProgress('initializing', 5, 'Initializing analysis engine...');

      // Run full analysis
      const result = await this.engineService.runFullAnalysis(url, auditId, emitProgress);

      // Save results
      await this.prisma.audit.update({
        where: { id: auditId },
        data: {
          status: 'COMPLETED',
          overallScore: result.overallScore,
          performanceScore: result.categories.find(c => c.category === 'performance')?.score,
          seoScore: result.categories.find(c => c.category === 'seo')?.score,
          contentScore: result.categories.find(c => c.category === 'content')?.score,
          metadataScore: result.categories.find(c => c.category === 'metadata')?.score,
          linksScore: result.categories.find(c => c.category === 'links')?.score,
          accessibilityScore: result.categories.find(c => c.category === 'accessibility')?.score,
          securityScore: result.categories.find(c => c.category === 'security')?.score,
          pageTitle: result.metadata?.title,
          pageSize: result.metadata?.pageSize,
          loadTime: result.metadata?.loadTime,
          httpStatus: result.metadata?.httpStatus,
          result: result as any,
          completedAt: new Date(),
        },
      });

      emitProgress('completed', 100, 'Analysis complete!');
      this.gateway.emitCompleted(auditId, result);

      this.logger.log(`Audit ${auditId} completed with score ${result.overallScore}`);
      return result;

    } catch (error) {
      this.logger.error(`Audit ${auditId} failed: ${error.message}`);

      await this.prisma.audit.update({
        where: { id: auditId },
        data: {
          status: 'FAILED',
          error: error.message,
          completedAt: new Date(),
        },
      });

      this.gateway.emitFailed(auditId, error.message);
      throw error;
    }
  }
}
