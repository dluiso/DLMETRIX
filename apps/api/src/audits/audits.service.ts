import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { AuditRateLimitService } from './audit-rate-limit.service';
import { CreateAuditDto } from './dto/create-audit.dto';
import { PLAN_LIMITS } from '@dlmetrix/shared';

@Injectable()
export class AuditsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('audit') private auditQueue: Queue,
    private rateLimitService: AuditRateLimitService,
  ) {}

  async createAudit(dto: CreateAuditDto, user?: any, ipAddress?: string) {
    // ── Validate URL ──────────────────────────────────
    let url: URL;
    try {
      url = new URL(dto.url.startsWith('http') ? dto.url : `https://${dto.url}`);
    } catch {
      throw new BadRequestException('Invalid URL');
    }

    const normalizedUrl = url.href;
    const domain = url.hostname;

    // ── Rate limiting ─────────────────────────────────
    const isAnonymous = !user;
    const identifier = isAnonymous ? ipAddress : user.id;
    const limit = isAnonymous
      ? 10
      : user.role === 'PREMIUM' || user.role === 'ADMIN'
      ? 999999
      : user.role === 'PRO'
      ? 50
      : 10;

    const rateCheck = await this.rateLimitService.checkAndIncrement(
      identifier,
      isAnonymous,
      limit,
    );

    if (!rateCheck.allowed) {
      throw new HttpException(
        {
          message: 'Daily audit limit reached',
          resetAt: rateCheck.resetAt,
          limit,
          current: rateCheck.current,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // ── Create audit record ───────────────────────────
    const audit = await this.prisma.audit.create({
      data: {
        url: normalizedUrl,
        domain,
        userId: user?.id || null,
        ipAddress: isAnonymous ? ipAddress : null,
        status: 'PENDING',
      },
    });

    // ── Enqueue job ───────────────────────────────────
    const job = await this.auditQueue.add(
      'run-audit',
      { auditId: audit.id, url: normalizedUrl },
      {
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { age: 3600 },
        removeOnFail: { age: 86400 },
      },
    );

    await this.prisma.audit.update({
      where: { id: audit.id },
      data: { jobId: job.id },
    });

    return {
      auditId: audit.id,
      status: 'pending',
      rateLimit: {
        remaining: rateCheck.remaining,
        resetAt: rateCheck.resetAt,
      },
    };
  }

  async getAudit(id: string, userId?: string) {
    const audit = await this.prisma.audit.findUnique({ where: { id } });
    if (!audit) throw new NotFoundException('Audit not found');

    // Public audits are accessible, but only owner can see result details
    return audit;
  }

  async getUserAudits(
    userId: string,
    page = 1,
    limit = 20,
    options: {
      status?: string;
      search?: string;
      sortField?: string;
      sortDir?: 'asc' | 'desc';
    } = {},
  ) {
    const { status, search, sortField = 'createdAt', sortDir = 'desc' } = options;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { domain: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
      ];
    }

    const validSortFields = ['createdAt', 'overallScore', 'domain'];
    const orderField = validSortFields.includes(sortField) ? sortField : 'createdAt';

    const [audits, total] = await Promise.all([
      this.prisma.audit.findMany({
        where,
        orderBy: { [orderField]: sortDir },
        skip,
        take: limit,
        select: {
          id: true, url: true, domain: true, status: true,
          overallScore: true, performanceScore: true, seoScore: true,
          pageTitle: true, createdAt: true, completedAt: true,
        },
      }),
      this.prisma.audit.count({ where }),
    ]);

    return {
      data: audits,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getRecentPublicAudits(limit = 10) {
    return this.prisma.audit.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true, domain: true, overallScore: true,
        performanceScore: true, seoScore: true, createdAt: true,
      },
    });
  }

  async deleteAudit(id: string, userId: string) {
    const audit = await this.prisma.audit.findFirst({ where: { id, userId } });
    if (!audit) throw new NotFoundException('Audit not found');
    await this.prisma.audit.delete({ where: { id } });
  }

  async exportHistoryCsv(userId: string): Promise<string> {
    const audits = await this.prisma.audit.findMany({
      where: { userId, status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, url: true, domain: true, overallScore: true,
        performanceScore: true, seoScore: true, accessibilityScore: true,
        securityScore: true, contentScore: true, pageTitle: true,
        createdAt: true, completedAt: true,
      },
    });

    const headers = [
      'ID', 'Domain', 'URL', 'Title', 'Overall Score',
      'Performance', 'SEO', 'Accessibility', 'Security', 'Content',
      'Created At', 'Completed At',
    ];

    const escape = (v: any) => {
      const s = v == null ? '' : String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const rows = audits.map(a => [
      a.id, a.domain, a.url, a.pageTitle ?? '',
      a.overallScore ?? '', a.performanceScore ?? '', a.seoScore ?? '',
      a.accessibilityScore ?? '', a.securityScore ?? '', a.contentScore ?? '',
      a.createdAt.toISOString(), a.completedAt?.toISOString() ?? '',
    ].map(escape).join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  async compareDomains(domain1: string, domain2: string, userId?: string, userRole?: string) {
    const isAdmin = userRole === 'ADMIN';

    // Normaliza: quita protocolo y www. para matching flexible
    const normalizeDomain = (d: string): string => {
      try {
        const withProto = d.startsWith('http') ? d : `https://${d}`;
        return new URL(withProto).hostname.replace(/^www\./, '');
      } catch {
        return d.replace(/^www\./, '');
      }
    };

    const nd1 = normalizeDomain(domain1);
    const nd2 = normalizeDomain(domain2);

    const getLatest = (normalizedDomain: string) =>
      this.prisma.audit.findFirst({
        where: {
          OR: [
            { domain: normalizedDomain },
            { domain: `www.${normalizedDomain}` },
          ],
          status: 'COMPLETED',
          // Admin compara cualquier auditoría; el resto solo las propias
          ...(!isAdmin && userId ? { userId } : {}),
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, domain: true, overallScore: true,
          performanceScore: true, seoScore: true, accessibilityScore: true,
          securityScore: true, contentScore: true, metadataScore: true,
          linksScore: true, createdAt: true,
        },
      });

    const [a, b] = await Promise.all([getLatest(nd1), getLatest(nd2)]);
    return { domain1: a, domain2: b };
  }
}
