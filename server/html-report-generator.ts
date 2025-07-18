import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

export interface WebAnalysisData {
  id?: number;
  url: string;
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  robotsMeta: string;
  viewportMeta: string;
  charset: string;
  langAttribute: string;
  imageAnalysis: any;
  linkAnalysis: any;
  contentAnalysis: any;
  technicalAnalysis: any;
  openGraphTags: any;
  twitterCardTags: any;
  schemaMarkup: any;
  robotsTxtExists: boolean;
  sitemapExists: boolean;
  finalUrl: string;
  hasSSL: boolean;
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  mobileLCP: number;
  mobileFID: number;
  mobileCLS: number;
  mobileFCP: number;
  mobileTTFB: number;
  desktopLCP: number;
  desktopFID: number;
  desktopCLS: number;
  desktopFCP: number;
  desktopTTFB: number;
  mobileScreenshot: string;
  desktopScreenshot: string;
  diagnostics: any;
  insights: any;
  recommendations: any;
  waterfallAnalysis: any;
  offPageData: any;
  createdAt: string;
}

export class HtmlReportGenerator {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp-reports');
    this.ensureTempDir();
    this.setupCleanupTask();
  }

  private ensureTempDir(): void {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
      console.log(`📁 Created temp reports directory: ${this.tempDir}`);
    }
  }

  private setupCleanupTask(): void {
    // Run cleanup every hour
    setInterval(() => {
      this.cleanupExpiredReports();
    }, 60 * 60 * 1000); // 1 hour

    // Run cleanup on startup
    this.cleanupExpiredReports();
  }

  private cleanupExpiredReports(): void {
    try {
      const files = fs.readdirSync(this.tempDir);
      const now = Date.now();
      let cleanedCount = 0;

      for (const file of files) {
        if (file.endsWith('.html')) {
          const filePath = path.join(this.tempDir, file);
          const stats = fs.statSync(filePath);
          const ageInHours = (now - stats.mtime.getTime()) / (1000 * 60 * 60);

          if (ageInHours > 24) {
            fs.unlinkSync(filePath);
            cleanedCount++;
          }
        }
      }

      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} expired HTML reports`);
      }
    } catch (error) {
      console.error('❌ Error cleaning up expired reports:', error);
    }
  }

  public async generateSharedReport(analysisData: WebAnalysisData): Promise<string> {
    const token = nanoid(12);
    const fileName = `${token}.html`;
    const filePath = path.join(this.tempDir, fileName);

    try {
      const htmlContent = this.generateHtmlContent(analysisData);
      fs.writeFileSync(filePath, htmlContent, 'utf8');
      
      console.log(`📄 Generated HTML report: ${fileName}`);
      return token;
    } catch (error) {
      console.error('❌ Error generating HTML report:', error);
      throw new Error('Failed to generate HTML report');
    }
  }

  public getSharedReport(token: string): string | null {
    const fileName = `${token}.html`;
    const filePath = path.join(this.tempDir, fileName);

    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const stats = fs.statSync(filePath);
      const ageInHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);

      if (ageInHours > 24) {
        fs.unlinkSync(filePath);
        return null;
      }

      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.error('❌ Error reading shared report:', error);
      return null;
    }
  }

  private generateHtmlContent(data: WebAnalysisData): string {
    const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DLMETRIX Analysis Report - ${data.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .card { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); }
        .dark .card { background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); }
        .progress-ring { transform: rotate(-90deg); }
        .score-good { color: #10b981; }
        .score-needs-improvement { color: #f59e0b; }
        .score-poor { color: #ef4444; }
        .expiration-banner { background: linear-gradient(90deg, #f59e0b, #ef4444); }
    </style>
</head>
<body class="bg-gray-900 text-white min-h-screen">
    <!-- Header -->
    <header class="gradient-bg py-6 px-4">
        <div class="max-w-7xl mx-auto">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <span class="text-purple-600 font-bold text-lg">DLM</span>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold">DLMETRIX</h1>
                        <p class="text-purple-200 text-sm">Shared Analysis Report</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm text-purple-200">Generated: ${new Date().toLocaleString()}</p>
                    <p class="text-xs text-purple-300">Expires: ${expirationTime.toLocaleString()}</p>
                </div>
            </div>
        </div>
    </header>

    <!-- Expiration Banner -->
    <div class="expiration-banner py-2 px-4 text-center">
        <p class="text-white font-medium">
            ⏰ This report expires in 24 hours • Generated by DLMETRIX
        </p>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-8 px-4">
        <!-- Website Overview -->
        <section class="mb-8">
            <div class="card rounded-lg p-6">
                <h2 class="text-xl font-bold mb-4">Website Overview</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 class="font-semibold text-purple-300 mb-2">URL</h3>
                        <p class="text-sm break-all">${data.url}</p>
                    </div>
                    <div>
                        <h3 class="font-semibold text-purple-300 mb-2">Title</h3>
                        <p class="text-sm">${data.title}</p>
                    </div>
                    <div>
                        <h3 class="font-semibold text-purple-300 mb-2">Description</h3>
                        <p class="text-sm">${data.description}</p>
                    </div>
                    <div>
                        <h3 class="font-semibold text-purple-300 mb-2">SSL Status</h3>
                        <p class="text-sm ${data.hasSSL ? 'text-green-400' : 'text-red-400'}">${data.hasSSL ? '✅ Secure' : '❌ Not Secure'}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Performance Scores -->
        <section class="mb-8">
            <div class="card rounded-lg p-6">
                <h2 class="text-xl font-bold mb-6">Performance Overview</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    ${this.generateScoreCard('Performance', data.performanceScore)}
                    ${this.generateScoreCard('Accessibility', data.accessibilityScore)}
                    ${this.generateScoreCard('Best Practices', data.bestPracticesScore)}
                    ${this.generateScoreCard('SEO', data.seoScore)}
                </div>
            </div>
        </section>

        <!-- Core Web Vitals -->
        <section class="mb-8">
            <div class="card rounded-lg p-6">
                <h2 class="text-xl font-bold mb-6">Core Web Vitals</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Mobile -->
                    <div>
                        <h3 class="font-semibold text-purple-300 mb-4">📱 Mobile</h3>
                        <div class="space-y-3">
                            ${this.generateVitalMetric('LCP', data.mobileLCP, 'ms')}
                            ${this.generateVitalMetric('FID', data.mobileFID, 'ms')}
                            ${this.generateVitalMetric('CLS', data.mobileCLS, '')}
                            ${this.generateVitalMetric('FCP', data.mobileFCP, 'ms')}
                            ${this.generateVitalMetric('TTFB', data.mobileTTFB, 'ms')}
                        </div>
                    </div>
                    
                    <!-- Desktop -->
                    <div>
                        <h3 class="font-semibold text-purple-300 mb-4">🖥️ Desktop</h3>
                        <div class="space-y-3">
                            ${this.generateVitalMetric('LCP', data.desktopLCP, 'ms')}
                            ${this.generateVitalMetric('FID', data.desktopFID, 'ms')}
                            ${this.generateVitalMetric('CLS', data.desktopCLS, '')}
                            ${this.generateVitalMetric('FCP', data.desktopFCP, 'ms')}
                            ${this.generateVitalMetric('TTFB', data.desktopTTFB, 'ms')}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Screenshots -->
        ${this.generateScreenshotsSection(data)}

        <!-- SEO Analysis -->
        ${this.generateSeoSection(data)}

        <!-- OffPage Analysis -->
        ${this.generateOffPageSection(data)}

        <!-- Recommendations -->
        ${this.generateRecommendationsSection(data)}
    </main>

    <!-- Footer -->
    <footer class="gradient-bg py-6 px-4 mt-16">
        <div class="max-w-7xl mx-auto text-center">
            <p class="text-purple-200">
                Generated by <strong>DLMETRIX</strong> - Free SEO Analysis Tool
            </p>
            <p class="text-purple-300 text-sm mt-2">
                This report contains comprehensive website analysis including performance, SEO, and accessibility metrics.
            </p>
        </div>
    </footer>

    <script>
        // Add any necessary JavaScript for interactivity
        console.log('DLMETRIX Shared Report loaded successfully');
    </script>
</body>
</html>`;
  }

  private generateScoreCard(name: string, score: number): string {
    const scoreClass = score >= 90 ? 'score-good' : score >= 50 ? 'score-needs-improvement' : 'score-poor';
    return `
        <div class="text-center">
            <div class="relative w-16 h-16 mx-auto mb-2">
                <svg class="w-16 h-16 progress-ring" viewBox="0 0 36 36">
                    <path class="stroke-gray-600" stroke-width="2" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <path class="${scoreClass}" stroke-width="2" fill="none" stroke-linecap="round" 
                          stroke-dasharray="${score}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-sm font-bold ${scoreClass}">${score}</span>
                </div>
            </div>
            <p class="text-sm font-medium">${name}</p>
        </div>
    `;
  }

  private generateVitalMetric(name: string, value: number | null, unit: string): string {
    if (value === null) {
      return `
        <div class="flex justify-between items-center">
            <span class="text-sm font-medium">${name}</span>
            <span class="text-gray-400 text-sm">N/A</span>
        </div>
      `;
    }

    let colorClass = 'text-green-400';
    if (name === 'LCP' && value > 2500) colorClass = 'text-red-400';
    else if (name === 'FID' && value > 100) colorClass = 'text-red-400';
    else if (name === 'CLS' && value > 0.1) colorClass = 'text-red-400';
    else if (name === 'FCP' && value > 1800) colorClass = 'text-red-400';
    else if (name === 'TTFB' && value > 800) colorClass = 'text-red-400';
    else if ((name === 'LCP' && value > 1800) || (name === 'FID' && value > 75) || (name === 'CLS' && value > 0.05) || (name === 'FCP' && value > 1200) || (name === 'TTFB' && value > 600)) {
      colorClass = 'text-yellow-400';
    }

    return `
        <div class="flex justify-between items-center">
            <span class="text-sm font-medium">${name}</span>
            <span class="${colorClass} text-sm font-mono">${value}${unit}</span>
        </div>
    `;
  }

  private generateScreenshotsSection(data: WebAnalysisData): string {
    if (!data.mobileScreenshot && !data.desktopScreenshot) {
      return '';
    }

    return `
        <section class="mb-8">
            <div class="card rounded-lg p-6">
                <h2 class="text-xl font-bold mb-6">Screenshots</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    ${data.mobileScreenshot ? `
                        <div>
                            <h3 class="font-semibold text-purple-300 mb-4">📱 Mobile (375×667)</h3>
                            <img src="${data.mobileScreenshot}" alt="Mobile screenshot" class="w-full rounded-lg border border-gray-600" />
                        </div>
                    ` : ''}
                    ${data.desktopScreenshot ? `
                        <div>
                            <h3 class="font-semibold text-purple-300 mb-4">🖥️ Desktop (1350×940)</h3>
                            <img src="${data.desktopScreenshot}" alt="Desktop screenshot" class="w-full rounded-lg border border-gray-600" />
                        </div>
                    ` : ''}
                </div>
            </div>
        </section>
    `;
  }

  private generateSeoSection(data: WebAnalysisData): string {
    return `
        <section class="mb-8">
            <div class="card rounded-lg p-6">
                <h2 class="text-xl font-bold mb-6">SEO Analysis</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="font-semibold text-purple-300 mb-3">Meta Information</h3>
                        <div class="space-y-2 text-sm">
                            <div><span class="text-gray-300">Keywords:</span> ${data.keywords?.join(', ') || 'None'}</div>
                            <div><span class="text-gray-300">Canonical:</span> ${data.canonicalUrl || 'None'}</div>
                            <div><span class="text-gray-300">Robots:</span> ${data.robotsMeta || 'None'}</div>
                            <div><span class="text-gray-300">Language:</span> ${data.langAttribute || 'None'}</div>
                        </div>
                    </div>
                    <div>
                        <h3 class="font-semibold text-purple-300 mb-3">Technical Checks</h3>
                        <div class="space-y-2 text-sm">
                            <div>${data.robotsTxtExists ? '✅' : '❌'} Robots.txt</div>
                            <div>${data.sitemapExists ? '✅' : '❌'} Sitemap.xml</div>
                            <div>${data.hasSSL ? '✅' : '❌'} SSL Certificate</div>
                            <div>${data.viewportMeta ? '✅' : '❌'} Viewport Meta</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
  }

  private generateOffPageSection(data: WebAnalysisData): string {
    if (!data.offPageData) {
      return '';
    }

    const offPage = data.offPageData;
    return `
        <section class="mb-8">
            <div class="card rounded-lg p-6">
                <h2 class="text-xl font-bold mb-6">OffPage Analysis</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h3 class="font-semibold text-purple-300 mb-3">Domain Authority</h3>
                        <div class="text-2xl font-bold ${offPage.domainAuthority >= 70 ? 'text-green-400' : offPage.domainAuthority >= 40 ? 'text-yellow-400' : 'text-red-400'}">${offPage.domainAuthority}/100</div>
                    </div>
                    <div>
                        <h3 class="font-semibold text-purple-300 mb-3">Backlinks</h3>
                        <div class="text-2xl font-bold text-blue-400">${offPage.backlinks?.totalBacklinks || 0}</div>
                    </div>
                    <div>
                        <h3 class="font-semibold text-purple-300 mb-3">Referring Domains</h3>
                        <div class="text-2xl font-bold text-green-400">${offPage.backlinks?.referringDomains || 0}</div>
                    </div>
                </div>
                
                ${offPage.socialPresence ? `
                    <div class="mt-6">
                        <h3 class="font-semibold text-purple-300 mb-3">Social Presence</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            ${offPage.socialPresence.platforms?.map((platform: any) => `
                                <div class="text-center">
                                    <div class="text-lg font-bold text-blue-400">${platform.mentions}</div>
                                    <div class="text-sm text-gray-300">${platform.platform}</div>
                                </div>
                            `).join('') || ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        </section>
    `;
  }

  private generateRecommendationsSection(data: WebAnalysisData): string {
    if (!data.recommendations) {
      return '';
    }

    const recommendations = data.recommendations;
    return `
        <section class="mb-8">
            <div class="card rounded-lg p-6">
                <h2 class="text-xl font-bold mb-6">Recommendations</h2>
                
                ${Object.entries(recommendations).map(([category, items]: [string, any]) => {
                  if (!Array.isArray(items) || items.length === 0) return '';
                  
                  return `
                    <div class="mb-6">
                        <h3 class="font-semibold text-purple-300 mb-4 capitalize">${category}</h3>
                        <div class="space-y-3">
                            ${items.slice(0, 5).map((item: any) => `
                                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                    <div class="flex items-start justify-between">
                                        <div class="flex-1">
                                            <h4 class="font-medium text-white mb-2">${item.title || 'Optimization Opportunity'}</h4>
                                            <p class="text-sm text-gray-300">${item.description || item.displayValue || 'No description available'}</p>
                                        </div>
                                        <div class="ml-4 text-right">
                                            ${item.score !== undefined ? `<div class="text-sm font-medium ${item.score >= 90 ? 'text-green-400' : item.score >= 50 ? 'text-yellow-400' : 'text-red-400'}">${item.score}</div>` : ''}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                  `;
                }).join('')}
            </div>
        </section>
    `;
  }
}