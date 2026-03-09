import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';

export interface MetadataResult {
  openGraph: Record<string, string>;
  twitter: Record<string, string>;
  canonical?: string;
  viewport?: string;
  charset?: string;
  themeColor?: string;
  author?: string;
  hasOgTitle: boolean;
  hasOgDescription: boolean;
  hasOgImage: boolean;
  hasTwitterCard: boolean;
}

@Injectable()
export class MetadataAnalyzer {
  async analyze(html: string, pageUrl: string): Promise<MetadataResult> {
    const $ = cheerio.load(html);

    // ── Open Graph ────────────────────────────────
    const openGraph: Record<string, string> = {};
    $('meta[property^="og:"]').each((_, el) => {
      const property = $(el).attr('property')?.replace('og:', '') || '';
      const content = $(el).attr('content') || '';
      openGraph[property] = content;
    });

    // ── Twitter Card ─────────────────────────────
    const twitter: Record<string, string> = {};
    $('meta[name^="twitter:"]').each((_, el) => {
      const name = $(el).attr('name')?.replace('twitter:', '') || '';
      const content = $(el).attr('content') || '';
      twitter[name] = content;
    });

    // ── Other meta ───────────────────────────────
    const canonical = $('link[rel="canonical"]').attr('href');
    const viewport = $('meta[name="viewport"]').attr('content');
    const charset =
      $('meta[charset]').attr('charset') ||
      $('meta[http-equiv="Content-Type"]').attr('content')?.match(/charset=([^\s;]+)/)?.[1];
    const themeColor = $('meta[name="theme-color"]').attr('content');
    const author = $('meta[name="author"]').attr('content');

    return {
      openGraph,
      twitter,
      canonical,
      viewport,
      charset,
      themeColor,
      author,
      hasOgTitle: !!openGraph.title,
      hasOgDescription: !!openGraph.description,
      hasOgImage: !!openGraph.image,
      hasTwitterCard: !!twitter.card,
    };
  }
}
