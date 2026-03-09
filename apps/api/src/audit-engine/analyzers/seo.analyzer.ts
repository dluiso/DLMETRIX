import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { SeoData } from '@dlmetrix/shared';
import { URL } from 'url';

@Injectable()
export class SeoAnalyzer {
  async analyze(html: string, pageUrl: string): Promise<SeoData> {
    const $ = cheerio.load(html);
    const baseUrl = new URL(pageUrl);

    // ── Title ─────────────────────────────────────
    const title = $('title').first().text().trim();
    const titleLength = title.length;

    // ── Meta Description ──────────────────────────
    const metaDescription =
      $('meta[name="description"]').attr('content')?.trim() || '';
    const metaDescriptionLength = metaDescription.length;

    // ── Headings ─────────────────────────────────
    const h1Elements = $('h1');
    const h1Count = h1Elements.length;
    const h1Text = h1Elements.map((_, el) => $(el).text().trim()).get();

    const headingStructure: { tag: string; text: string }[] = [];
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      headingStructure.push({
        tag: el.tagName.toUpperCase(),
        text: $(el).text().trim().substring(0, 150),
      });
    });

    // ── Canonical ─────────────────────────────────
    const canonicalUrl = $('link[rel="canonical"]').attr('href')?.trim();

    // ── Robots ───────────────────────────────────
    const robotsMeta = $('meta[name="robots"]').attr('content')?.toLowerCase() || '';
    const noindexTag = robotsMeta.includes('noindex');

    // ── Lang ─────────────────────────────────────
    const langAttribute = $('html').attr('lang') || '';

    // ── Image alts ───────────────────────────────
    let imageAltMissing = 0;
    $('img').each((_, el) => {
      const alt = $(el).attr('alt');
      if (alt === undefined || alt === null) imageAltMissing++;
    });

    // ── Structured data ──────────────────────────
    const structuredData: any[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const parsed = JSON.parse($(el).html() || '');
        structuredData.push(parsed);
      } catch {}
    });

    // ── Robots.txt / Sitemap (check existence) ───
    let robotsTxt = false;
    let sitemap = false;

    try {
      const robotsRes = await fetch(`${baseUrl.origin}/robots.txt`, {
        signal: AbortSignal.timeout(5000),
      });
      robotsTxt = robotsRes.ok;

      // Check sitemap from robots.txt
      if (robotsTxt) {
        const robotsText = await robotsRes.text();
        sitemap = robotsText.toLowerCase().includes('sitemap:');
      }
    } catch {}

    if (!sitemap) {
      try {
        const sitemapRes = await fetch(`${baseUrl.origin}/sitemap.xml`, {
          signal: AbortSignal.timeout(5000),
        });
        sitemap = sitemapRes.ok;
      } catch {}
    }

    return {
      title,
      titleLength,
      metaDescription,
      metaDescriptionLength,
      h1Count,
      h1Text,
      headingStructure,
      canonicalUrl,
      robotsTxt,
      sitemap,
      noindexTag,
      noindexHeader: false, // checked in security analyzer from response headers
      langAttribute,
      imageAltMissing,
      structuredData,
    };
  }
}
