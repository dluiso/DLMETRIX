import { WebAnalysisResult } from '@/shared/schema';

interface ComparisonResult {
  url: string;
  previous: WebAnalysisResult | null;
  current: WebAnalysisResult;
  improvements: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  coreWebVitalsChanges: {
    mobile: {
      lcp: { previous: number | null; current: number | null; change: number | null };
      fid: { previous: number | null; current: number | null; change: number | null };
      cls: { previous: number | null; current: number | null; change: number | null };
      ttfb: { previous: number | null; current: number | null; change: number | null };
    };
    desktop: {
      lcp: { previous: number | null; current: number | null; change: number | null };
      fid: { previous: number | null; current: number | null; change: number | null };
      cls: { previous: number | null; current: number | null; change: number | null };
      ttfb: { previous: number | null; current: number | null; change: number | null };
    };
  };
  summary: {
    totalImprovements: number;
    totalRegressions: number;
    overallTrend: 'improved' | 'declined' | 'unchanged';
  };
}

class UrlComparison {
  private analysisHistory: Map<string, WebAnalysisResult[]> = new Map();
  private readonly MAX_HISTORY_PER_URL = 10;

  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.origin + urlObj.pathname;
    } catch {
      return url.toLowerCase();
    }
  }

  storeAnalysis(analysis: WebAnalysisResult) {
    const normalizedUrl = this.normalizeUrl(analysis.url);
    const history = this.analysisHistory.get(normalizedUrl) || [];
    
    // Agregar nuevo análisis al principio
    history.unshift(analysis);
    
    // Mantener solo los últimos MAX_HISTORY_PER_URL análisis
    if (history.length > this.MAX_HISTORY_PER_URL) {
      history.splice(this.MAX_HISTORY_PER_URL);
    }
    
    this.analysisHistory.set(normalizedUrl, history);
  }

  getAnalysisHistory(url: string): WebAnalysisResult[] {
    const normalizedUrl = this.normalizeUrl(url);
    return this.analysisHistory.get(normalizedUrl) || [];
  }

  compareWithPrevious(currentAnalysis: WebAnalysisResult): ComparisonResult | null {
    const history = this.getAnalysisHistory(currentAnalysis.url);
    
    if (history.length < 2) {
      return null; // No hay análisis anterior para comparar
    }

    const current = history[0]; // Más reciente
    const previous = history[1]; // Anterior

    // Calcular mejoras en puntuaciones
    const improvements = {
      performance: (current.performanceScore || 0) - (previous.performanceScore || 0),
      accessibility: (current.accessibilityScore || 0) - (previous.accessibilityScore || 0),
      bestPractices: (current.bestPracticesScore || 0) - (previous.bestPracticesScore || 0),
      seo: (current.seoScore || 0) - (previous.seoScore || 0)
    };

    // Comparar Core Web Vitals
    const coreWebVitalsChanges = {
      mobile: {
        lcp: this.calculateMetricChange(
          previous.coreWebVitals?.mobile?.lcp,
          current.coreWebVitals?.mobile?.lcp
        ),
        fid: this.calculateMetricChange(
          previous.coreWebVitals?.mobile?.fid,
          current.coreWebVitals?.mobile?.fid
        ),
        cls: this.calculateMetricChange(
          previous.coreWebVitals?.mobile?.cls,
          current.coreWebVitals?.mobile?.cls
        ),
        ttfb: this.calculateMetricChange(
          previous.coreWebVitals?.mobile?.ttfb,
          current.coreWebVitals?.mobile?.ttfb
        )
      },
      desktop: {
        lcp: this.calculateMetricChange(
          previous.coreWebVitals?.desktop?.lcp,
          current.coreWebVitals?.desktop?.lcp
        ),
        fid: this.calculateMetricChange(
          previous.coreWebVitals?.desktop?.fid,
          current.coreWebVitals?.desktop?.fid
        ),
        cls: this.calculateMetricChange(
          previous.coreWebVitals?.desktop?.cls,
          current.coreWebVitals?.desktop?.cls
        ),
        ttfb: this.calculateMetricChange(
          previous.coreWebVitals?.desktop?.ttfb,
          current.coreWebVitals?.desktop?.ttfb
        )
      }
    };

    // Calcular resumen general
    const scoreChanges = Object.values(improvements);
    const totalImprovements = scoreChanges.filter(change => change > 0).length;
    const totalRegressions = scoreChanges.filter(change => change < 0).length;
    
    let overallTrend: 'improved' | 'declined' | 'unchanged' = 'unchanged';
    if (totalImprovements > totalRegressions) {
      overallTrend = 'improved';
    } else if (totalRegressions > totalImprovements) {
      overallTrend = 'declined';
    }

    return {
      url: currentAnalysis.url,
      previous,
      current,
      improvements,
      coreWebVitalsChanges,
      summary: {
        totalImprovements,
        totalRegressions,
        overallTrend
      }
    };
  }

  private calculateMetricChange(previous: number | null | undefined, current: number | null | undefined) {
    const prev = previous || null;
    const curr = current || null;
    const change = (prev !== null && curr !== null) ? curr - prev : null;
    
    return {
      previous: prev,
      current: curr,
      change
    };
  }

  getComparisonSummary(url: string): {
    hasHistory: boolean;
    totalAnalyses: number;
    lastAnalyzed: string | null;
    averageScores: {
      performance: number;
      accessibility: number;
      bestPractices: number;
      seo: number;
    };
  } {
    const history = this.getAnalysisHistory(url);
    
    if (history.length === 0) {
      return {
        hasHistory: false,
        totalAnalyses: 0,
        lastAnalyzed: null,
        averageScores: {
          performance: 0,
          accessibility: 0,
          bestPractices: 0,
          seo: 0
        }
      };
    }

    const lastAnalysis = history[0];
    const averageScores = {
      performance: Math.round(history.reduce((sum, analysis) => sum + (analysis.performanceScore || 0), 0) / history.length),
      accessibility: Math.round(history.reduce((sum, analysis) => sum + (analysis.accessibilityScore || 0), 0) / history.length),
      bestPractices: Math.round(history.reduce((sum, analysis) => sum + (analysis.bestPracticesScore || 0), 0) / history.length),
      seo: Math.round(history.reduce((sum, analysis) => sum + (analysis.seoScore || 0), 0) / history.length)
    };

    return {
      hasHistory: true,
      totalAnalyses: history.length,
      lastAnalyzed: lastAnalysis.analyzedAt || null,
      averageScores
    };
  }

  clearHistory(url: string) {
    const normalizedUrl = this.normalizeUrl(url);
    this.analysisHistory.delete(normalizedUrl);
  }

  getAllStoredUrls(): string[] {
    return Array.from(this.analysisHistory.keys());
  }
}

export const urlComparison = new UrlComparison();
export type { ComparisonResult };