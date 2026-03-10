import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { LighthouseAnalyzer } from './analyzers/lighthouse.analyzer';
import { SeoAnalyzer } from './analyzers/seo.analyzer';
import { ContentAnalyzer } from './analyzers/content.analyzer';
import { MetadataAnalyzer } from './analyzers/metadata.analyzer';
import { LinksAnalyzer } from './analyzers/links.analyzer';
import { AccessibilityAnalyzer } from './analyzers/accessibility.analyzer';
import { SecurityAnalyzer } from './analyzers/security.analyzer';
import { ScoreCalculator } from './score-calculator';
import { AuditResult } from '@dlmetrix/shared';

type ProgressCallback = (phase: string, progress: number, message: string) => void;

@Injectable()
export class AuditEngineService {
  private readonly logger = new Logger(AuditEngineService.name);

  constructor(
    private lighthouse: LighthouseAnalyzer,
    private seo: SeoAnalyzer,
    private content: ContentAnalyzer,
    private metadata: MetadataAnalyzer,
    private links: LinksAnalyzer,
    private accessibility: AccessibilityAnalyzer,
    private security: SecurityAnalyzer,
    private scorer: ScoreCalculator,
  ) {}

  async runFullAnalysis(
    url: string,
    auditId: string,
    onProgress: ProgressCallback,
  ): Promise<AuditResult> {
    let browser: puppeteer.Browser | null = null;
    let page: puppeteer.Page | null = null;

    try {
      // ── Launch browser ────────────────────────────
      onProgress('fetching', 10, 'Launching browser...');

      browser = await puppeteer.launch({
        headless: process.env.PUPPETEER_HEADLESS !== 'false',
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1280,900',
        ],
      });

      page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 900 });
      await page.setUserAgent(
        'Mozilla/5.0 (compatible; DLMetrix/1.0; +https://dlmetrix.com/bot)',
      );

      // ── Navigate ──────────────────────────────────
      onProgress('fetching', 15, `Loading ${url}...`);

      let httpStatus = 200;
      let redirectChain: string[] = [];

      const response = await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      }).catch(err => {
        throw new Error(`Page load failed: ${err.message}`);
      });

      if (response) {
        httpStatus = response.status();
        redirectChain = response.request().redirectChain().map(r => r.url());
      }

      onProgress('fetching', 20, 'Page loaded, extracting HTML...');

      const html = await page.content();
      const pageUrl = page.url(); // final URL after redirects

      // ── Screenshot ───────────────────────────────
      let screenshot: string | undefined;
      try {
        const screenshotBuffer = await page.screenshot({ type: 'jpeg', quality: 70 });
        screenshot = `screenshot_${auditId}.jpg`;
        const { writeFileSync, mkdirSync } = require('fs');
        mkdirSync('./uploads', { recursive: true });
        writeFileSync(`./uploads/${screenshot}`, screenshotBuffer);
      } catch (e) {
        this.logger.warn('Screenshot failed: ' + e.message);
      }

      // ── Performance (Lighthouse) ──────────────────
      onProgress('performance', 30, 'Running Lighthouse performance analysis...');
      const performanceData = await this.lighthouse.analyze(pageUrl);

      // ── Browser Timings (from Puppeteer) ──────────
      let browserTimings;
      try {
        browserTimings = await page.evaluate(() => {
          const t = (window.performance.timing as any);
          const nav = t.navigationStart;
          return {
            redirect:         Math.max(0, t.redirectEnd - t.redirectStart),
            dns:              Math.max(0, t.domainLookupEnd - t.domainLookupStart),
            connection:       Math.max(0, t.connectEnd - t.connectStart),
            ssl:              t.secureConnectionStart > 0 ? Math.max(0, t.connectEnd - t.secureConnectionStart) : 0,
            backend:          Math.max(0, t.responseStart - t.requestStart),
            domInteractive:   Math.max(0, t.domInteractive - nav),
            domContentLoaded: Math.max(0, t.domContentLoadedEventEnd - nav),
            onload:           Math.max(0, t.loadEventEnd - nav),
            fullyLoaded:      Math.max(0, t.loadEventEnd - nav),
          };
        });
        performanceData.browserTimings = browserTimings;
      } catch (e) {
        this.logger.warn('Browser timings extraction failed: ' + e.message);
      }

      // ── SEO ───────────────────────────────────────
      onProgress('seo', 48, 'Auditing SEO signals...');
      const seoData = await this.seo.analyze(html, pageUrl);

      // ── Content ───────────────────────────────────
      onProgress('content', 60, 'Analyzing content structure...');
      const contentData = await this.content.analyze(html, pageUrl);

      // ── Mobile Screenshot ─────────────────────────
      let mobileScreenshot: string | undefined;
      try {
        const mobilePage = await browser.newPage();
        await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });
        await mobilePage.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1');
        await mobilePage.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 20000 });
        const mobileBuffer = await mobilePage.screenshot({ type: 'jpeg', quality: 70 });
        mobileScreenshot = `screenshot_mobile_${auditId}.jpg`;
        const { writeFileSync: wfs, mkdirSync: mds } = require('fs');
        mds('./uploads', { recursive: true });
        wfs(`./uploads/${mobileScreenshot}`, mobileBuffer);
        await mobilePage.close();
      } catch (e) {
        this.logger.warn('Mobile screenshot failed: ' + e.message);
      }

      // ── Domain Age (RDAP) ─────────────────────────
      let domainAge: number | undefined;
      try {
        const domain = new URL(pageUrl).hostname.replace(/^www\./, '');
        const rdapRes = await fetch(`https://rdap.org/domain/${domain}`, {
          signal: AbortSignal.timeout(5000),
          headers: { 'Accept': 'application/json' },
        });
        if (rdapRes.ok) {
          const rdapData = await rdapRes.json();
          const events: any[] = rdapData.events || [];
          const registration = events.find((e: any) => e.eventAction === 'registration');
          if (registration?.eventDate) {
            const regDate = new Date(registration.eventDate);
            const now = new Date();
            domainAge = Math.floor((now.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24));
          }
        }
      } catch (e) {
        this.logger.warn('Domain age lookup failed: ' + e.message);
      }

      // ── Metadata ──────────────────────────────────
      onProgress('metadata', 68, 'Checking metadata and structured data...');
      const metadataData = await this.metadata.analyze(html, pageUrl);

      // ── Links ─────────────────────────────────────
      onProgress('links', 78, 'Scanning internal and external links...');
      const linksData = await this.links.analyze(html, pageUrl);

      // ── Accessibility ─────────────────────────────
      onProgress('accessibility', 88, 'Checking accessibility compliance...');
      const accessibilityData = await this.accessibility.analyze(page, html);

      // ── Security ──────────────────────────────────
      onProgress('security', 94, 'Auditing security headers...');
      const securityData = await this.security.analyze(response, pageUrl);

      // ── Score calculation ─────────────────────────
      onProgress('scoring', 98, 'Calculating scores...');

      const categories = this.scorer.calculateCategories({
        performance: performanceData,
        seo: seoData,
        content: contentData,
        metadata: metadataData,
        links: linksData,
        accessibility: accessibilityData,
        security: securityData,
      });

      const overallScore = this.scorer.calculateOverallScore(categories);

      const pageSize = await page.evaluate(() => document.documentElement.outerHTML.length);

      const result: AuditResult = {
        id: auditId,
        url: pageUrl,
        domain: new URL(pageUrl).hostname,
        status: 'completed',
        overallScore,
        categories,
        metadata: {
          title: seoData.title,
          description: seoData.metaDescription,
          screenshot,
          mobileScreenshot,
          domainAge,
          loadTime: performanceData.fcp,
          pageSize,
          httpStatus,
          redirectChain,
        },
        performance: performanceData,
        seo: seoData,
        content: {
          wordCount: contentData.wordCount,
          readabilityScore: contentData.readabilityScore,
          keywordDensity: contentData.keywordDensity,
          paragraphCount: contentData.paragraphCount,
          avgSentenceLength: contentData.avgSentenceLength,
          hasStructuredContent: contentData.hasStructuredContent,
          textToHtmlRatio: contentData.textToHtmlRatio,
          contentLength: contentData.contentLength,
        },
        accessibility: accessibilityData,
        security: securityData,
        links: linksData,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      return result;

    } finally {
      if (browser) {
        await browser.close().catch(() => {});
      }
    }
  }
}
