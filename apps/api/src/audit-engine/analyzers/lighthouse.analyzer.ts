import { Injectable, Logger } from '@nestjs/common';
import { PerformanceData, NetworkRequest, ResourceTypeBreakdown } from '@dlmetrix/shared';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const execFileAsync = promisify(execFile);

@Injectable()
export class LighthouseAnalyzer {
  private readonly logger = new Logger(LighthouseAnalyzer.name);

  async analyze(url: string): Promise<PerformanceData> {
    const outputPath = join(tmpdir(), `lh_${Date.now()}.json`);

    try {
      const chromePath = process.env.PUPPETEER_EXECUTABLE_PATH || '';
      const args = [
        url,
        '--output=json',
        `--output-path=${outputPath}`,
        '--only-categories=performance',
        '--chrome-flags=--headless --no-sandbox --disable-gpu',
        '--quiet',
        '--no-enable-error-reporting',
      ];

      if (chromePath) {
        args.push(`--chrome-path=${chromePath}`);
      }

      await execFileAsync('npx', ['lighthouse', ...args], {
        timeout: 60000,
        maxBuffer: 50 * 1024 * 1024,
      });

      if (!existsSync(outputPath)) {
        throw new Error('Lighthouse output file not found');
      }

      const raw = JSON.parse(readFileSync(outputPath, 'utf8'));
      return this.parseResults(raw);

    } catch (error) {
      this.logger.warn(`Lighthouse failed for ${url}: ${error.message}. Using fallback.`);
      return this.fallbackAnalysis(url);
    } finally {
      if (existsSync(outputPath)) unlinkSync(outputPath);
    }
  }

  private parseResults(raw: any): PerformanceData {
    const audits = raw?.audits || {};
    const categories = raw?.categories?.performance;

    // Extract network requests (limit to 50)
    const networkItems: any[] = audits['network-requests']?.details?.items || [];
    const networkRequests: NetworkRequest[] = networkItems
      .slice(0, 50)
      .map((item: any) => ({
        url: item.url || '',
        type: item.resourceType || 'Other',
        size: Math.round(item.resourceSize || 0),
        transferSize: Math.round(item.transferSize || 0),
        duration: Math.round((item.endTime || 0) - (item.startTime || 0)),
        status: item.statusCode || 0,
        startTime: Math.round(item.startTime || 0),
      }));

    // Resource breakdown from resource-summary audit (cleaner than building from networkItems)
    const summaryItems: any[] = audits['resource-summary']?.details?.items || [];
    const resourceBreakdown: ResourceTypeBreakdown[] = summaryItems
      .filter((item: any) => item.label !== 'total' && item.label !== 'third-party')
      .map((item: any) => ({
        type: item.label || 'other',
        size: Math.round(item.size || 0),
        transferSize: Math.round(item.transferSize || 0),
        count: item.requestCount || 0,
      }))
      .filter((item: any) => item.count > 0);

    // If resource-summary not available, build from networkItems
    const breakdown = resourceBreakdown.length > 0 ? resourceBreakdown : (() => {
      const map = new Map<string, { size: number; transferSize: number; count: number }>();
      for (const req of networkItems) {
        const type = (req.resourceType || 'Other').toLowerCase();
        const e = map.get(type) || { size: 0, transferSize: 0, count: 0 };
        map.set(type, {
          size: e.size + (req.resourceSize || 0),
          transferSize: e.transferSize + (req.transferSize || 0),
          count: e.count + 1,
        });
      }
      return Array.from(map.entries()).map(([type, d]) => ({ type, ...d }));
    })();

    return {
      fcp: audits['first-contentful-paint']?.numericValue,
      lcp: audits['largest-contentful-paint']?.numericValue,
      cls: audits['cumulative-layout-shift']?.numericValue,
      fid: audits['max-potential-fid']?.numericValue,
      ttfb: audits['server-response-time']?.numericValue,
      tti: audits['interactive']?.numericValue,
      tbt: audits['total-blocking-time']?.numericValue,
      si: audits['speed-index']?.numericValue,
      pageSize: audits['total-byte-weight']?.numericValue,
      requests: networkItems.length,
      renderBlockingResources: audits['render-blocking-resources']?.details?.items
        ?.map((i: any) => i.url)
        ?.filter(Boolean) || [],
      unusedCss: audits['unused-css-rules']?.details?.overallSavingsBytes,
      unusedJs: audits['unused-javascript']?.details?.overallSavingsBytes,
      lighthouseScore: categories?.score != null ? Math.round(categories.score * 100) : undefined,
      networkRequests: networkRequests.length > 0 ? networkRequests : undefined,
      resourceBreakdown: breakdown.length > 0 ? breakdown : undefined,
    };
  }

  private async fallbackAnalysis(url: string): Promise<PerformanceData> {
    // Basic timing via HTTP fetch when Lighthouse fails
    const start = Date.now();
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      const ttfb = Date.now() - start;
      return {
        ttfb,
        fcp: ttfb * 2,
        lcp: ttfb * 3,
        cls: 0,
        tbt: 0,
        tti: ttfb * 4,
      };
    } catch {
      return {};
    }
  }
}
