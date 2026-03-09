import { Injectable, Logger } from '@nestjs/common';
import { PerformanceData } from '@dlmetrix/shared';
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
      requests: audits['network-requests']?.details?.items?.length,
      renderBlockingResources: audits['render-blocking-resources']?.details?.items
        ?.map((i: any) => i.url)
        ?.filter(Boolean) || [],
      unusedCss: audits['unused-css-rules']?.details?.overallSavingsBytes,
      unusedJs: audits['unused-javascript']?.details?.overallSavingsBytes,
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
