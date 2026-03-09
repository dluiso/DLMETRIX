import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';

export interface ContentResult {
  wordCount: number;
  readabilityScore: number; // 0-100 Flesch-like
  keywordDensity: { keyword: string; count: number; density: number }[];
  paragraphCount: number;
  avgSentenceLength: number;
  hasStructuredContent: boolean; // has ul/ol/table
  textToHtmlRatio: number; // %
  contentLength: 'thin' | 'adequate' | 'rich';
}

@Injectable()
export class ContentAnalyzer {
  async analyze(html: string, pageUrl: string): Promise<ContentResult> {
    const $ = cheerio.load(html);

    // Remove non-content elements
    $('script, style, nav, footer, header, aside, [role="navigation"]').remove();

    const mainContent =
      $('main, article, [role="main"], .content, #content, #main').first();
    const textSource = mainContent.length ? mainContent : $('body');
    const text = textSource.text().replace(/\s+/g, ' ').trim();

    const words = text
      .split(/\s+/)
      .filter((w) => w.length > 2);
    const wordCount = words.length;

    // ── Paragraph count ───────────────────────────
    const paragraphCount = $('p').length;

    // ── Text to HTML ratio ────────────────────────
    const textLength = text.length;
    const htmlLength = html.length;
    const textToHtmlRatio = htmlLength > 0
      ? Math.round((textLength / htmlLength) * 100)
      : 0;

    // ── Sentence analysis ────────────────────────
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 5);
    const avgSentenceLength =
      sentences.length > 0
        ? Math.round(wordCount / sentences.length)
        : 0;

    // ── Keyword density (top 10) ──────────────────
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
      'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were',
      'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'this', 'that', 'these',
      'those', 'it', 'its', 'not', 'no', 'as', 'if', 'so', 'than',
      'el', 'la', 'de', 'que', 'en', 'y', 'los', 'las', 'un', 'una',
    ]);

    const freqMap: Record<string, number> = {};
    words.forEach((word) => {
      const clean = word.toLowerCase().replace(/[^a-záéíóúñüàèùâêîôûç]/gi, '');
      if (clean.length > 3 && !stopWords.has(clean)) {
        freqMap[clean] = (freqMap[clean] || 0) + 1;
      }
    });

    const keywordDensity = Object.entries(freqMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([keyword, count]) => ({
        keyword,
        count,
        density: wordCount > 0 ? parseFloat(((count / wordCount) * 100).toFixed(2)) : 0,
      }));

    // ── Readability (simple Flesch approximation) ─
    const syllableCount = words.reduce((acc, w) => acc + this.countSyllables(w), 0);
    const readabilityScore = sentences.length > 0 && wordCount > 0
      ? Math.min(100, Math.max(0, Math.round(
          206.835
          - 1.015 * (wordCount / sentences.length)
          - 84.6 * (syllableCount / wordCount),
        )))
      : 50;

    // ── Structured content ────────────────────────
    const hasStructuredContent =
      $('ul, ol, table, dl').length > 0;

    // ── Content length label ──────────────────────
    const contentLength: ContentResult['contentLength'] =
      wordCount < 300 ? 'thin' : wordCount < 1000 ? 'adequate' : 'rich';

    return {
      wordCount,
      readabilityScore,
      keywordDensity,
      paragraphCount,
      avgSentenceLength,
      hasStructuredContent,
      textToHtmlRatio,
      contentLength,
    };
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    const vowels = word.match(/[aeiouyáéíóúü]/gi);
    return vowels ? Math.max(1, vowels.length) : 1;
  }
}
