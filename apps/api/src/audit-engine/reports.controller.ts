import { Controller, Get, Param, Res, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(
    private reportService: ReportService,
    private prisma: PrismaService,
  ) {}

  @Get(':id/pdf')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download audit report as PDF' })
  async downloadPdf(
    @Param('id') auditId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;

    // Verify user has access to this audit
    const audit = await this.prisma.audit.findFirst({
      where: {
        id: auditId,
        OR: [
          { userId: user.id },
          ...(user.role === 'ADMIN' ? [{}] : []),
        ],
      },
    });

    // Check plan allows export
    if (!audit) {
      return res.status(404).json({ message: 'Audit not found' });
    }

    const sub = await this.prisma.subscription.findUnique({
      where: { userId: user.id },
      include: { plan: true },
    });

    if (user.role !== 'ADMIN' && user.role !== 'PREMIUM' && !sub?.plan?.hasExport) {
      return res.status(403).json({ message: 'PDF export requires PRO or PREMIUM plan' });
    }

    const pdf = await this.reportService.generatePdf(auditId);
    const domain = audit.domain.replace(/[^a-z0-9]/gi, '_');
    const filename = `dlmetrix_${domain}_${new Date().toISOString().slice(0, 10)}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdf.length,
    });

    res.send(pdf);
  }

  @Get(':id/json')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download audit result as JSON' })
  async downloadJson(
    @Param('id') auditId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;

    const audit = await this.prisma.audit.findFirst({
      where: { id: auditId, userId: user.id },
    });

    if (!audit) return res.status(404).json({ message: 'Audit not found' });

    const domain = audit.domain.replace(/[^a-z0-9]/gi, '_');
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="dlmetrix_${domain}.json"`,
    });
    res.json(audit.result);
  }
}
