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
    
    // Helper functions
    const getScoreColor = (score: number) => {
      if (score >= 90) return 'text-green-600';
      if (score >= 50) return 'text-orange-500';
      return 'text-red-500';
    };

    const getScoreStroke = (score: number) => {
      if (score >= 90) return '#10b981';
      if (score >= 50) return '#f59e0b';
      return '#ef4444';
    };

    const formatMetric = (value: any, unit: string = 'ms') => {
      if (value === null || value === undefined) return 'N/A';
      if (typeof value === 'number') return `${value.toFixed(0)}${unit}`;
      return value;
    };

    const formatCLS = (value: any) => {
      if (value === null || value === undefined) return 'N/A';
      if (typeof value === 'number') return value.toFixed(3);
      return value;
    };

    const createProgressRing = (score: number, size: number = 64) => {
      const radius = 28;
      const circumference = 2 * Math.PI * radius;
      const strokeDasharray = `${(score / 100) * circumference}, ${circumference}`;
      
      return `
        <svg class="w-${size/4} h-${size/4}" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="${radius}" fill="none" stroke="#e5e7eb" stroke-width="4"/>
          <circle cx="32" cy="32" r="${radius}" fill="none" stroke="${getScoreStroke(score)}" stroke-width="4" 
                  stroke-dasharray="${strokeDasharray}" stroke-linecap="round" transform="rotate(-90 32 32)"/>
          <text x="32" y="36" text-anchor="middle" font-size="14" font-weight="bold" fill="${getScoreColor(score)}">${score}</text>
        </svg>
      `;
    };

    // Helper function to format object data correctly
    const formatOffPageData = (offPageData: any) => {
      if (!offPageData) return { domainAuthority: 0, backlinks: { totalBacklinks: 0, referringDomains: 0 } };
      
      return {
        domainAuthority: offPageData.domainAuthority || 0,
        backlinks: {
          totalBacklinks: offPageData.backlinks?.totalBacklinks || 0,
          referringDomains: offPageData.backlinks?.referringDomains || 0
        },
        socialPresence: offPageData.socialPresence || null,
        wikipedia: offPageData.wikipedia || null,
        trustMetrics: offPageData.trustMetrics || null
      };
    };

    // Helper function to check if we should show a section
    const shouldShowSection = (sectionData: any) => {
      if (!sectionData) return false;
      if (Array.isArray(sectionData)) return sectionData.length > 0;
      if (typeof sectionData === 'object') {
        return Object.keys(sectionData).length > 0 && Object.values(sectionData).some(v => v !== null && v !== undefined);
      }
      return sectionData !== null && sectionData !== undefined;
    };

    const offPageFormatted = formatOffPageData(data.offPageData);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DLMETRIX Analysis Report - ${data.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .report-container { 
            background: white; 
            margin: 0 auto; 
            max-width: 1200px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border-radius: 12px;
            overflow: hidden;
        }
        .report-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        .logo-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 16px;
        }
        .logo-bg {
            width: 48px;
            height: 48px;
            background: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .logo-text {
            font-size: 1.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .section-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .screenshot-container {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            background: #f9fafb;
        }
        .metric-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
        }
        .metric-value {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
        }
        .metric-label {
            font-size: 0.875rem;
            color: #6b7280;
            margin-top: 4px;
        }
        .check-pass { color: #10b981; }
        .check-fail { color: #ef4444; }
        .text-gray-900 { color: #111827; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-500 { color: #6b7280; }
        .bg-gray-50 { background-color: #f9fafb; }
        .border-gray-200 { border-color: #e5e7eb; }
        
        @media print {
            body { 
                -webkit-print-color-adjust: exact; 
                background: white !important;
                margin: 0;
                padding: 0;
            }
            .report-container {
                box-shadow: none;
                margin: 0;
                border-radius: 0;
            }
            .report-header {
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <!-- Header -->
        <div class="report-header">
            <div class="logo-section">
                <div class="logo-bg">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                </div>
                <span class="logo-text">DLMETRIX</span>
            </div>
            <h1 class="text-xl font-semibold mb-2">SEO Analysis Report</h1>
            <p class="text-blue-100 text-sm">⏰ This report expires in 24 hours • Generated by DLMETRIX</p>
        </div>

        <!-- Content -->
        <div class="p-6" style="color: #111827;">
            <!-- Website Overview -->
            <div class="section-card">
                <h2 class="text-xl font-bold mb-4 text-gray-900">Website Overview</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>URL:</strong> ${data.url}</div>
                    <div><strong>Title:</strong> ${data.title || 'N/A'}</div>
                    <div><strong>Description:</strong> ${data.description || 'N/A'}</div>
                    <div><strong>SSL Status:</strong> ${data.hasSSL ? '✅ Secure' : '❌ Not Secure'}</div>
                </div>
            </div>

            <!-- Performance Overview -->
            <div class="section-card">
                <h2 class="text-xl font-bold mb-6 text-gray-900">Performance Overview</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div class="text-center">
                        <div class="mb-3">
                            ${createProgressRing(data.performanceScore || 0)}
                        </div>
                        <p class="text-sm font-medium text-gray-600">Performance</p>
                    </div>
                    <div class="text-center">
                        <div class="mb-3">
                            ${createProgressRing(data.accessibilityScore || 0)}
                        </div>
                        <p class="text-sm font-medium text-gray-600">Accessibility</p>
                    </div>
                    <div class="text-center">
                        <div class="mb-3">
                            ${createProgressRing(data.bestPracticesScore || 0)}
                        </div>
                        <p class="text-sm font-medium text-gray-600">Best Practices</p>
                    </div>
                    <div class="text-center">
                        <div class="mb-3">
                            ${createProgressRing(data.seoScore || 0)}
                        </div>
                        <p class="text-sm font-medium text-gray-600">SEO</p>
                    </div>
                </div>
            </div>

            <!-- Core Web Vitals -->
            <div class="section-card">
                <h2 class="text-xl font-bold mb-6 text-gray-900">Core Web Vitals</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Mobile -->
                    <div>
                        <h3 class="font-semibold text-gray-700 mb-4">📱 Mobile</h3>
                        <div class="space-y-3">
                            <div class="metric-card">
                                <div class="metric-value">${formatMetric(data.mobileLCP)}</div>
                                <div class="metric-label">LCP</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">${formatMetric(data.mobileFID)}</div>
                                <div class="metric-label">FID</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">${formatCLS(data.mobileCLS)}</div>
                                <div class="metric-label">CLS</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">${formatMetric(data.mobileFCP)}</div>
                                <div class="metric-label">FCP</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">${formatMetric(data.mobileTTFB)}</div>
                                <div class="metric-label">TTFB</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Desktop -->
                    <div>
                        <h3 class="font-semibold text-gray-700 mb-4">🖥️ Desktop</h3>
                        <div class="space-y-3">
                            <div class="metric-card">
                                <div class="metric-value">${formatMetric(data.desktopLCP)}</div>
                                <div class="metric-label">LCP</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">${formatMetric(data.desktopFID)}</div>
                                <div class="metric-label">FID</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">${formatCLS(data.desktopCLS)}</div>
                                <div class="metric-label">CLS</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">${formatMetric(data.desktopFCP)}</div>
                                <div class="metric-label">FCP</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">${formatMetric(data.desktopTTFB)}</div>
                                <div class="metric-label">TTFB</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Screenshots -->
            ${data.mobileScreenshot || data.desktopScreenshot ? `
            <div class="section-card">
                <h2 class="text-xl font-bold mb-6 text-gray-900">Screenshots</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${data.mobileScreenshot ? `
                    <div>
                        <h3 class="font-semibold text-gray-700 mb-3">📱 Mobile (375×667)</h3>
                        <div class="screenshot-container">
                            <img src="${data.mobileScreenshot}" alt="Mobile screenshot" class="w-full h-auto" />
                        </div>
                    </div>
                    ` : ''}
                    ${data.desktopScreenshot ? `
                    <div>
                        <h3 class="font-semibold text-gray-700 mb-3">🖥️ Desktop (1350×940)</h3>
                        <div class="screenshot-container">
                            <img src="${data.desktopScreenshot}" alt="Desktop screenshot" class="w-full h-auto" />
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}

            <!-- SEO Analysis -->
            <div class="section-card">
                <h2 class="text-xl font-bold mb-6 text-gray-900">SEO Analysis</h2>
                <div class="space-y-4">
                    <div>
                        <h3 class="font-semibold text-gray-700 mb-2">Meta Information</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div><strong>Keywords:</strong> ${data.keywords?.join(', ') || 'None'}</div>
                            <div><strong>Canonical:</strong> ${data.canonicalUrl || 'N/A'}</div>
                            <div><strong>Robots:</strong> ${data.robotsMeta || 'N/A'}</div>
                            <div><strong>Language:</strong> ${data.langAttribute || 'N/A'}</div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 class="font-semibold text-gray-700 mb-2">Technical Checks</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div class="${data.robotsTxtExists ? 'check-pass' : 'check-fail'}">
                                ${data.robotsTxtExists ? '✅' : '❌'} Robots.txt
                            </div>
                            <div class="${data.sitemapExists ? 'check-pass' : 'check-fail'}">
                                ${data.sitemapExists ? '✅' : '❌'} Sitemap.xml
                            </div>
                            <div class="${data.hasSSL ? 'check-pass' : 'check-fail'}">
                                ${data.hasSSL ? '✅' : '❌'} SSL Certificate
                            </div>
                            <div class="${data.viewportMeta ? 'check-pass' : 'check-fail'}">
                                ${data.viewportMeta ? '✅' : '❌'} Viewport Meta
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- OffPage Analysis -->
            ${data.offPageData ? `
            <div class="section-card">
                <h2 class="text-xl font-bold mb-6 text-gray-900">OffPage Analysis</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-blue-600">${data.offPageData.domainAuthority || 0}</div>
                        <div class="text-sm text-gray-600">Domain Authority</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-green-600">${data.offPageData.backlinks?.totalBacklinks || 0}</div>
                        <div class="text-sm text-gray-600">Backlinks</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-purple-600">${data.offPageData.backlinks?.referringDomains || 0}</div>
                        <div class="text-sm text-gray-600">Referring Domains</div>
                    </div>
                </div>
                
                ${data.offPageData.socialPresence ? `
                <div class="mt-6">
                    <h3 class="font-semibold text-gray-700 mb-3">Social Presence</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${data.offPageData.socialPresence.platforms?.map((platform: any) => `
                            <div class="text-center">
                                <div class="text-xl font-bold text-blue-600">${platform.mentions}</div>
                                <div class="text-sm text-gray-600">${platform.platform}</div>
                            </div>
                        `).join('') || ''}
                    </div>
                </div>
                ` : ''}
            </div>
            ` : ''}

            <!-- Technical SEO Analysis -->
            ${shouldShowSection(data.technicalAnalysis) ? `
            <div class="section-card">
                <h2 class="text-xl font-bold mb-6 text-gray-900">Technical SEO Analysis</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    ${Object.entries(data.technicalAnalysis).map(([key, value]: [string, any]) => {
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        const isPass = value === true || value === 'true';
                        return `
                            <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span>${label}</span>
                                <span class="${isPass ? 'check-pass' : 'check-fail'}">
                                    ${isPass ? '✅ Pass' : '❌ Fail'}
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Meta Tags Analysis -->
            ${shouldShowSection(data.openGraphTags) || shouldShowSection(data.twitterCardTags) ? `
            <div class="section-card">
                <h2 class="text-xl font-bold mb-6 text-gray-900">Meta Tags Analysis</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${shouldShowSection(data.openGraphTags) ? `
                    <div>
                        <h3 class="font-semibold text-gray-700 mb-3">Open Graph Tags</h3>
                        <div class="space-y-2 text-sm">
                            ${Object.entries(data.openGraphTags).map(([key, value]: [string, any]) => 
                                value ? `<div><strong>${key}:</strong> ${value}</div>` : ''
                            ).join('')}
                        </div>
                    </div>
                    ` : ''}
                    ${shouldShowSection(data.twitterCardTags) ? `
                    <div>
                        <h3 class="font-semibold text-gray-700 mb-3">X Cards</h3>
                        <div class="space-y-2 text-sm">
                            ${Object.entries(data.twitterCardTags).map(([key, value]: [string, any]) => 
                                value ? `<div><strong>${key}:</strong> ${value}</div>` : ''
                            ).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}

            <!-- Heading Structure -->
            ${shouldShowSection(data.contentAnalysis?.headingStructure) ? `
            <div class="section-card">
                <h2 class="text-xl font-bold mb-6 text-gray-900">Heading Structure</h2>
                <div class="space-y-2">
                    ${data.contentAnalysis.headingStructure.map((heading: any) => `
                        <div class="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <span class="font-mono text-sm bg-blue-100 px-2 py-1 rounded">${heading.level}</span>
                            <span class="text-sm">${heading.text}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- AI Content Analysis -->
            ${shouldShowSection(data.aiSearchAnalysis) ? `
            <div class="section-card">
                <h2 class="text-xl font-bold mb-6 text-gray-900">AI Content Analysis</h2>
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <span class="font-semibold">Overall AI Score</span>
                        <span class="text-xl font-bold ${data.aiSearchAnalysis.overallScore >= 80 ? 'text-green-600' : data.aiSearchAnalysis.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'}">
                            ${data.aiSearchAnalysis.overallScore}/100
                        </span>
                    </div>
                    ${data.aiSearchAnalysis.contentAnalysis ? `
                    <div>
                        <h3 class="font-semibold text-gray-700 mb-2">Content Quality</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div><strong>Readability Score:</strong> ${data.aiSearchAnalysis.contentAnalysis.readabilityScore || 'N/A'}</div>
                            <div><strong>Semantic Richness:</strong> ${data.aiSearchAnalysis.contentAnalysis.semanticRichness || 'N/A'}</div>
                            <div><strong>Content Depth:</strong> ${data.aiSearchAnalysis.contentAnalysis.contentDepth || 'N/A'}</div>
                            <div><strong>Expertise Level:</strong> ${data.aiSearchAnalysis.contentAnalysis.expertiseLevel || 'N/A'}</div>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}

            <!-- Keyword Analysis -->
            ${shouldShowSection(data.keywordAnalysis) ? `
            <div class="section-card">
                <h2 class="text-xl font-bold mb-6 text-gray-900">Keyword Analysis</h2>
                <div class="space-y-4">
                    ${data.keywordAnalysis.primaryKeywords?.length > 0 ? `
                    <div>
                        <h3 class="font-semibold text-gray-700 mb-2">Primary Keywords</h3>
                        <div class="flex flex-wrap gap-2">
                            ${data.keywordAnalysis.primaryKeywords.map((keyword: any) => `
                                <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                    ${keyword.keyword} (${keyword.density}%)
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    ${data.keywordAnalysis.secondaryKeywords?.length > 0 ? `
                    <div>
                        <h3 class="font-semibold text-gray-700 mb-2">Secondary Keywords</h3>
                        <div class="flex flex-wrap gap-2">
                            ${data.keywordAnalysis.secondaryKeywords.map((keyword: any) => `
                                <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                                    ${keyword.keyword} (${keyword.density}%)
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}

            <!-- Waterfall Analysis -->
            ${shouldShowSection(data.waterfallAnalysis) ? `
            <div class="section-card">
                <h2 class="text-xl font-bold mb-6 text-gray-900">Waterfall Analysis</h2>
                <div class="space-y-4">
                    ${data.waterfallAnalysis.mobile ? `
                    <div>
                        <h3 class="font-semibold text-gray-700 mb-3">📱 Mobile Resources</h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div class="text-center">
                                <div class="text-xl font-bold text-blue-600">${data.waterfallAnalysis.mobile.totalResources || 0}</div>
                                <div class="text-gray-600">Total Resources</div>
                            </div>
                            <div class="text-center">
                                <div class="text-xl font-bold text-green-600">${data.waterfallAnalysis.mobile.totalLoadTime || 0}ms</div>
                                <div class="text-gray-600">Load Time</div>
                            </div>
                            <div class="text-center">
                                <div class="text-xl font-bold text-purple-600">${data.waterfallAnalysis.mobile.totalSize || 0}KB</div>
                                <div class="text-gray-600">Total Size</div>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    ${data.waterfallAnalysis.desktop ? `
                    <div>
                        <h3 class="font-semibold text-gray-700 mb-3">🖥️ Desktop Resources</h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div class="text-center">
                                <div class="text-xl font-bold text-blue-600">${data.waterfallAnalysis.desktop.totalResources || 0}</div>
                                <div class="text-gray-600">Total Resources</div>
                            </div>
                            <div class="text-center">
                                <div class="text-xl font-bold text-green-600">${data.waterfallAnalysis.desktop.totalLoadTime || 0}ms</div>
                                <div class="text-gray-600">Load Time</div>
                            </div>
                            <div class="text-center">
                                <div class="text-xl font-bold text-purple-600">${data.waterfallAnalysis.desktop.totalSize || 0}KB</div>
                                <div class="text-gray-600">Total Size</div>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}

            <!-- Diagnostics -->
            ${shouldShowSection(data.diagnostics) ? `
            <div class="section-card">
                <h2 class="text-xl font-bold mb-6 text-gray-900">Performance Diagnostics</h2>
                <div class="space-y-3">
                    ${(Array.isArray(data.diagnostics) ? data.diagnostics.slice(0, 10) : []).map((diagnostic: any) => `
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <div class="font-medium text-sm">${diagnostic.title || 'Diagnostic'}</div>
                            <div class="text-xs text-gray-600 mt-1">${diagnostic.description || diagnostic.displayValue || ''}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Performance Insights -->
            ${shouldShowSection(data.insights) ? `
            <div class="section-card">
                <h2 class="text-xl font-bold mb-6 text-gray-900">Performance Insights</h2>
                <div class="space-y-3">
                    ${(Array.isArray(data.insights) ? data.insights.slice(0, 8) : []).map((insight: any) => `
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <div class="font-medium text-sm">${insight.title || 'Insight'}</div>
                            <div class="text-xs text-gray-600 mt-1">${insight.description || insight.displayValue || ''}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Recommendations -->
            ${data.recommendations ? `
            <div class="section-card">
                <h2 class="text-xl font-bold mb-6 text-gray-900">Recommendations</h2>
                <div class="space-y-4">
                    ${Object.entries(data.recommendations).map(([category, recs]: [string, any]) => {
                        if (!recs || !Array.isArray(recs) || recs.length === 0) return '';
                        return `
                            <div>
                                <h3 class="font-semibold text-gray-700 mb-3 capitalize">${category}</h3>
                                <div class="space-y-2">
                                    ${recs.slice(0, 5).map((rec: any) => `
                                        <div class="bg-gray-50 p-3 rounded-lg">
                                            <div class="font-medium text-sm">${rec.title || 'Recommendation'}</div>
                                            <div class="text-xs text-gray-600 mt-1">${rec.description || ''}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    </div>
</body>
</html>`;
  }
}