import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { PrismaService } from '../prisma/prisma.service';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { getScoreLabel, AUDIT_CATEGORY_WEIGHTS } from '@dlmetrix/shared';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(private prisma: PrismaService) {}

  async generatePdf(auditId: string): Promise<Buffer> {
    const audit = await this.prisma.audit.findUnique({ where: { id: auditId } });
    if (!audit || audit.status !== 'COMPLETED' || !audit.result) {
      throw new NotFoundException('Audit not found or not completed');
    }

    const result = audit.result as any;
    const html   = this.buildReportHtml(result, audit);

    let browser: puppeteer.Browser | null = null;
    try {
      browser = await puppeteer.launch({
        headless: process.env.PUPPETEER_HEADLESS !== 'false',
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      });

      const page = await browser.newPage();
      // domcontentloaded es más fiable que networkidle0 para HTML auto-contenido
      await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.emulateMediaType('print');

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      });

      return Buffer.from(pdf);
    } finally {
      await browser?.close().catch(() => {});
    }
  }

  private buildReportHtml(result: any, audit: any): string {
    const scoreColor = (score: number) => {
      if (score >= 90) return '#22c55e';
      if (score >= 70) return '#84cc16';
      if (score >= 50) return '#f59e0b';
      return '#ef4444';
    };

    const categoriesHtml = (result.categories || []).map((cat: any) => `
      <div class="category-card">
        <div class="cat-score" style="color:${scoreColor(cat.score)}">${cat.score}</div>
        <div class="cat-label">${cat.label}</div>
        <div class="cat-bar">
          <div class="cat-bar-fill" style="width:${cat.score}%;background:${scoreColor(cat.score)}"></div>
        </div>
      </div>
    `).join('');

    const issuesHtml = (result.categories || []).flatMap((cat: any) =>
      (cat.issues || []).map((issue: any) => `
        <tr>
          <td><span class="sev sev-${issue.severity}">${issue.severity}</span></td>
          <td><strong>${issue.title}</strong><br><small>${issue.description}</small></td>
          <td>${issue.recommendation}</td>
        </tr>
      `)
    ).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width">
<title>DLMETRIX Report – ${result.domain || audit.domain}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #1f2937; line-height: 1.5; }

  /* Header */
  .header { background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%); color: white; padding: 28px 32px; display: flex; justify-content: space-between; align-items: center; }
  .header-logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
  .header-meta { text-align: right; font-size: 11px; opacity: 0.85; }
  .header-url { font-size: 13px; font-weight: 600; margin-top: 2px; word-break: break-all; }

  /* Overall score */
  .score-section { display: flex; align-items: center; gap: 32px; padding: 28px 32px; border-bottom: 1px solid #e5e7eb; }
  .score-circle { width: 96px; height: 96px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 5px solid; flex-shrink: 0; }
  .score-number { font-size: 32px; font-weight: 800; line-height: 1; }
  .score-label-sm { font-size: 10px; color: #6b7280; }
  .score-info h2 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
  .score-info p { font-size: 11px; color: #6b7280; }

  /* Categories */
  .section { padding: 24px 32px; border-bottom: 1px solid #f3f4f6; }
  .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #374151; margin-bottom: 16px; }
  .categories-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; }
  .category-card { text-align: center; padding: 12px 6px; background: #f9fafb; border-radius: 10px; }
  .cat-score { font-size: 22px; font-weight: 800; }
  .cat-label { font-size: 9px; color: #6b7280; font-weight: 600; margin-top: 2px; text-transform: uppercase; }
  .cat-bar { height: 4px; background: #e5e7eb; border-radius: 2px; margin-top: 8px; overflow: hidden; }
  .cat-bar-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }

  /* Issues table */
  .issues-table { width: 100%; border-collapse: collapse; font-size: 11px; }
  .issues-table th { text-align: left; padding: 8px 10px; background: #f3f4f6; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; }
  .issues-table td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
  .issues-table td small { color: #9ca3af; }
  .sev { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 9px; font-weight: 700; text-transform: uppercase; }
  .sev-critical { background: #fee2e2; color: #dc2626; }
  .sev-high     { background: #fed7aa; color: #ea580c; }
  .sev-medium   { background: #fef3c7; color: #d97706; }
  .sev-low      { background: #dbeafe; color: #2563eb; }
  .sev-info     { background: #f3f4f6; color: #6b7280; }

  /* Metadata */
  .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .meta-item { background: #f9fafb; padding: 12px; border-radius: 8px; }
  .meta-key { font-size: 9px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .meta-val { font-size: 14px; font-weight: 700; }

  /* Footer */
  .footer { padding: 16px 32px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  .page-break { page-break-before: always; }
</style>
</head>
<body>

<!-- Header -->
<div class="header">
  <div>
    <div class="header-logo">DLMETRIX</div>
    <div class="header-url">${result.url || audit.url}</div>
  </div>
  <div class="header-meta">
    <div>Web Audit Report</div>
    <div>Generated: ${new Date().toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  </div>
</div>

<!-- Overall score -->
<div class="score-section">
  <div class="score-circle" style="border-color:${scoreColor(result.overallScore)};color:${scoreColor(result.overallScore)}">
    <div class="score-number">${result.overallScore}</div>
    <div class="score-label-sm">/ 100</div>
  </div>
  <div class="score-info">
    <h2>${result.metadata?.title || audit.pageTitle || result.domain || audit.domain}</h2>
    <p>Domain: ${result.domain || audit.domain}</p>
    <p>HTTP Status: ${result.metadata?.httpStatus || audit.httpStatus || '—'} &nbsp;·&nbsp; Load Time: ${result.metadata?.loadTime ? (result.metadata.loadTime / 1000).toFixed(2) + 's' : '—'}</p>
    <p style="margin-top:4px;color:${scoreColor(result.overallScore)};font-weight:700;font-size:13px">${getScoreLabel(result.overallScore).label} performance</p>
  </div>
</div>

<!-- Category scores -->
<div class="section">
  <div class="section-title">Category Scores</div>
  <div class="categories-grid">${categoriesHtml}</div>
</div>

<!-- Page metadata -->
${result.metadata ? `
<div class="section">
  <div class="section-title">Page Details</div>
  <div class="meta-grid">
    <div class="meta-item"><div class="meta-key">Title Length</div><div class="meta-val">${result.seo?.titleLength ?? '—'} chars</div></div>
    <div class="meta-item"><div class="meta-key">Page Size</div><div class="meta-val">${result.metadata.pageSize ? (result.metadata.pageSize / 1024).toFixed(0) + ' KB' : '—'}</div></div>
    <div class="meta-item"><div class="meta-key">Load Time</div><div class="meta-val">${result.metadata.loadTime ? (result.metadata.loadTime / 1000).toFixed(2) + 's' : '—'}</div></div>
    <div class="meta-item"><div class="meta-key">HTTP Status</div><div class="meta-val">${result.metadata.httpStatus || '—'}</div></div>
  </div>
</div>` : ''}

<!-- Issues table -->
<div class="section page-break">
  <div class="section-title">Issues Found</div>
  <table class="issues-table">
    <thead>
      <tr>
        <th style="width:80px">Severity</th>
        <th>Issue</th>
        <th style="width:35%">Recommendation</th>
      </tr>
    </thead>
    <tbody>${issuesHtml || '<tr><td colspan="3" style="text-align:center;padding:20px;color:#9ca3af">No issues found</td></tr>'}</tbody>
  </table>
</div>

<!-- Footer -->
<div class="footer">
  DLMETRIX Professional Web Audit · dlmetrix.com · Report generated ${new Date().toISOString()}
</div>

</body>
</html>`;
  }
}
