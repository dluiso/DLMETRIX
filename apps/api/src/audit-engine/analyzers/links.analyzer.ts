import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { LinksData } from '@dlmetrix/shared';
import { URL } from 'url';

@Injectable()
export class LinksAnalyzer {
  private readonly logger = new Logger(LinksAnalyzer.name);

  async analyze(html: string, pageUrl: string): Promise<LinksData> {
    const $ = cheerio.load(html);
    const base = new URL(pageUrl);

    let internalLinks = 0;
    let externalLinks = 0;
    let nofollow = 0;
    const allLinks: { url: string; rel: string }[] = [];

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href')?.trim() || '';
      const rel = $(el).attr('rel') || '';

      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      try {
        const resolved = new URL(href, pageUrl);

        if (resolved.hostname === base.hostname) {
          internalLinks++;
        } else {
          externalLinks++;
        }

        if (rel.includes('nofollow')) nofollow++;
        allLinks.push({ url: resolved.href, rel });
      } catch {}
    });

    // Check broken links (sample, max 10 external links to avoid timeout)
    const brokenLinks: { url: string; status: number }[] = [];
    const sampleLinks = allLinks
      .filter(l => !l.url.includes(base.hostname))
      .slice(0, 10);

    await Promise.allSettled(
      sampleLinks.map(async ({ url }) => {
        try {
          const res = await fetch(url, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000),
            redirect: 'follow',
          });
          if (res.status >= 400) {
            brokenLinks.push({ url, status: res.status });
          }
        } catch {
          brokenLinks.push({ url, status: 0 });
        }
      }),
    );

    return {
      internalLinks,
      externalLinks,
      brokenLinks,
      nofollow,
    };
  }
}
