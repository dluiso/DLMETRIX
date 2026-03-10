import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { LinksData, LinkEntry } from '@dlmetrix/shared';
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
    const allLinks: LinkEntry[] = [];
    const externalUrls: string[] = [];

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href')?.trim() || '';
      const rel  = $(el).attr('rel') || '';
      const text = $(el).text().trim().substring(0, 120);

      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      try {
        const resolved  = new URL(href, pageUrl);
        const isInternal = resolved.hostname === base.hostname;
        const isNofollow = rel.includes('nofollow');

        if (isInternal) internalLinks++;
        else            externalLinks++;
        if (isNofollow) nofollow++;

        allLinks.push({
          url:      resolved.href,
          text:     text || resolved.pathname,
          type:     isInternal ? 'internal' : 'external',
          nofollow: isNofollow,
        });

        if (!isInternal) externalUrls.push(resolved.href);
      } catch {}
    });

    // Check broken links (sample up to 15 external links to avoid long timeouts)
    const brokenLinks: { url: string; status: number }[] = [];
    const sampleExternal = externalUrls.slice(0, 15);

    await Promise.allSettled(
      sampleExternal.map(async (url) => {
        try {
          const res = await fetch(url, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000),
            redirect: 'follow',
          });
          if (res.status >= 400) {
            brokenLinks.push({ url, status: res.status });
            const entry = allLinks.find(l => l.url === url);
            if (entry) { entry.broken = true; entry.status = res.status; }
          }
        } catch {
          brokenLinks.push({ url, status: 0 });
          const entry = allLinks.find(l => l.url === url);
          if (entry) { entry.broken = true; entry.status = 0; }
        }
      }),
    );

    return {
      internalLinks,
      externalLinks,
      brokenLinks,
      allLinks,
      nofollow,
    };
  }
}
