import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { AccessibilityData } from '@dlmetrix/shared';
import { Page } from 'puppeteer';

@Injectable()
export class AccessibilityAnalyzer {
  async analyze(page: Page | null, html: string): Promise<AccessibilityData> {
    const $ = cheerio.load(html);

    const violations: AccessibilityData['violations'] = [];

    // ── Missing alt on images ─────────────────────
    let missingAlt = 0;
    $('img').each((_, el) => {
      const alt = $(el).attr('alt');
      if (alt === undefined || alt === null) {
        missingAlt++;
      }
    });
    if (missingAlt > 0) {
      violations.push({
        id: 'image-alt',
        impact: 'critical',
        description: `${missingAlt} image(s) missing alt attribute`,
        nodes: missingAlt,
      });
    }

    // ── Missing form labels ───────────────────────
    let unlabeledInputs = 0;
    $('input:not([type="hidden"]):not([type="submit"]):not([type="button"])').each((_, el) => {
      const id = $(el).attr('id');
      const ariaLabel = $(el).attr('aria-label');
      const ariaLabelledBy = $(el).attr('aria-labelledby');
      const hasLabel = id ? $(`label[for="${id}"]`).length > 0 : false;
      if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
        unlabeledInputs++;
      }
    });
    if (unlabeledInputs > 0) {
      violations.push({
        id: 'label',
        impact: 'critical',
        description: `${unlabeledInputs} form input(s) without accessible label`,
        nodes: unlabeledInputs,
      });
    }

    // ── Skip link ────────────────────────────────
    const skipLinks = $('a[href="#main"], a[href="#content"], a[href^="#skip"]').length > 0;
    if (!skipLinks) {
      violations.push({
        id: 'skip-link',
        impact: 'moderate',
        description: 'No skip navigation link found',
        nodes: 1,
      });
    }

    // ── Language attribute ───────────────────────
    const hasLang = !!$('html').attr('lang');
    if (!hasLang) {
      violations.push({
        id: 'html-lang',
        impact: 'serious',
        description: 'HTML element missing lang attribute',
        nodes: 1,
      });
    }

    // ── ARIA landmarks ───────────────────────────
    const hasMain = $('main, [role="main"]').length > 0;
    if (!hasMain) {
      violations.push({
        id: 'landmark-main',
        impact: 'moderate',
        description: 'No main landmark found',
        nodes: 1,
      });
    }

    // ── Button labels ────────────────────────────
    let unlabeledButtons = 0;
    $('button').each((_, el) => {
      const text = $(el).text().trim();
      const ariaLabel = $(el).attr('aria-label');
      const ariaLabelledBy = $(el).attr('aria-labelledby');
      if (!text && !ariaLabel && !ariaLabelledBy) {
        unlabeledButtons++;
      }
    });
    if (unlabeledButtons > 0) {
      violations.push({
        id: 'button-name',
        impact: 'critical',
        description: `${unlabeledButtons} button(s) without accessible name`,
        nodes: unlabeledButtons,
      });
    }

    // ── Calculate score ──────────────────────────
    const criticalCount = violations.filter(v => v.impact === 'critical').length;
    const seriousCount = violations.filter(v => v.impact === 'serious').length;
    const moderateCount = violations.filter(v => v.impact === 'moderate').length;

    const deductions = criticalCount * 20 + seriousCount * 10 + moderateCount * 5;
    const score = Math.max(0, 100 - deductions);

    return {
      score,
      violations,
      ariaLabels: $('[aria-label], [aria-labelledby]').length,
      skipLinks,
      formLabels: unlabeledInputs === 0,
    };
  }
}
