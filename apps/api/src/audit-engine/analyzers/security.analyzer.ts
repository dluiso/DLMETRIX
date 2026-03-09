import { Injectable } from '@nestjs/common';
import { SecurityData } from '@dlmetrix/shared';
import { HTTPResponse } from 'puppeteer';

@Injectable()
export class SecurityAnalyzer {
  async analyze(response: HTTPResponse | null, pageUrl: string): Promise<SecurityData> {
    const headers = response?.headers() || {};
    const url = new URL(pageUrl);

    // ── HTTPS ─────────────────────────────────────
    const https = url.protocol === 'https:';

    // ── Security headers ──────────────────────────
    const hsts = !!headers['strict-transport-security'];
    const csp = !!headers['content-security-policy'];
    const xFrameOptions = !!headers['x-frame-options'];
    const xContentTypeOptions =
      headers['x-content-type-options']?.toLowerCase() === 'nosniff';

    // ── Mixed content (check in headers) ─────────
    const mixedContent = !https; // simplified: if not HTTPS, mixed content risk

    return {
      https,
      hsts,
      csp,
      xFrameOptions,
      xContentTypeOptions,
      mixedContent,
      vulnerableDeps: [], // requires deeper analysis, future feature
    };
  }
}
