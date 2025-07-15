import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { WebAnalysisResult } from '@/shared/schema';

// Generate circular progress chart as base64 image
function generateProgressChart(score: number, size: number = 100): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 10;
  const progress = score / 100;
  
  // Background circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 8;
  ctx.stroke();
  
  // Progress circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, (-Math.PI / 2) + (progress * 2 * Math.PI));
  ctx.strokeStyle = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.stroke();
  
  // Score text
  ctx.fillStyle = '#1f2937';
  ctx.font = `bold ${size / 4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(score.toString(), centerX, centerY);
  
  return canvas.toDataURL('image/png');
}

// Complete PDF export function with ALL report data
export async function exportCompletePDF(data: WebAnalysisResult): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;
  
  // Function to add new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
  };

  // Helper function to add text with line wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10): number => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * fontSize * 0.35);
  };

  // Helper function to add section header
  const addSectionHeader = (title: string, bgColor = [59, 130, 246]) => {
    checkPageBreak(20);
    pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    pdf.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 15, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, yPosition + 5);
    yPosition += 20;
    pdf.setTextColor(0, 0, 0);
  };

  // Header with styling
  pdf.setFillColor(59, 130, 246);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Complete Web Performance Analysis Report', margin, 25);
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  yPosition = 50;
  pdf.text(`Website: ${data.url}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, yPosition);
  yPosition += 20;

  // 1. PERFORMANCE OVERVIEW SECTION
  addSectionHeader('Performance Overview');
  
  // Create progress charts for each score
  const chartSize = 25;
  const chartSpacing = 35;
  const startX = margin;
  
  // Overall Score
  const overallScore = Math.round((data.performanceScore + data.accessibilityScore + data.bestPracticesScore + data.seoScore) / 4);
  const overallChart = generateProgressChart(overallScore, 60);
  pdf.addImage(overallChart, 'PNG', startX, yPosition, chartSize + 10, chartSize + 10);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Overall Score', startX + (chartSize + 10)/2, yPosition + chartSize + 18, { align: 'center' });
  
  // Individual scores
  const scores = [
    { name: 'Performance', score: data.performanceScore },
    { name: 'Accessibility', score: data.accessibilityScore },
    { name: 'Best Practices', score: data.bestPracticesScore },
    { name: 'SEO', score: data.seoScore }
  ];
  
  scores.forEach((scoreData, index) => {
    const chart = generateProgressChart(scoreData.score, 50);
    const xPos = startX + chartSpacing + 40 + (index * chartSpacing);
    pdf.addImage(chart, 'PNG', xPos, yPosition, chartSize, chartSize);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text(scoreData.name, xPos + chartSize/2, yPosition + chartSize + 8, { align: 'center' });
  });
  
  yPosition += chartSize + 25;

  // 2. CORE WEB VITALS SECTION
  addSectionHeader('Core Web Vitals', [34, 197, 94]);
  
  const mobileMetrics = data.coreWebVitals.mobile;
  const desktopMetrics = data.coreWebVitals.desktop;
  
  // Mobile metrics
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Mobile Metrics:', margin, yPosition);
  yPosition += 8;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const mobileData = [
    ['LCP (Largest Contentful Paint)', mobileMetrics.lcp ? `${mobileMetrics.lcp}ms` : 'Not available'],
    ['FID (First Input Delay)', mobileMetrics.fid ? `${mobileMetrics.fid}ms` : 'Not available'],
    ['CLS (Cumulative Layout Shift)', mobileMetrics.cls ? mobileMetrics.cls.toFixed(3) : 'Not available'],
    ['FCP (First Contentful Paint)', mobileMetrics.fcp ? `${mobileMetrics.fcp}ms` : 'Not available'],
    ['TTFB (Time to First Byte)', mobileMetrics.ttfb ? `${mobileMetrics.ttfb}ms` : 'Not available']
  ];
  
  mobileData.forEach(([metric, value]) => {
    pdf.text(`• ${metric}: ${value}`, margin + 5, yPosition);
    yPosition += 5;
  });
  
  yPosition += 5;
  
  // Desktop metrics
  pdf.setFont('helvetica', 'bold');
  pdf.text('Desktop Metrics:', margin, yPosition);
  yPosition += 8;
  pdf.setFont('helvetica', 'normal');
  
  const desktopData = [
    ['LCP (Largest Contentful Paint)', desktopMetrics.lcp ? `${desktopMetrics.lcp}ms` : 'Not available'],
    ['FID (First Input Delay)', desktopMetrics.fid ? `${desktopMetrics.fid}ms` : 'Not available'],
    ['CLS (Cumulative Layout Shift)', desktopMetrics.cls ? desktopMetrics.cls.toFixed(3) : 'Not available'],
    ['FCP (First Contentful Paint)', desktopMetrics.fcp ? `${desktopMetrics.fcp}ms` : 'Not available'],
    ['TTFB (Time to First Byte)', desktopMetrics.ttfb ? `${desktopMetrics.ttfb}ms` : 'Not available']
  ];
  
  desktopData.forEach(([metric, value]) => {
    pdf.text(`• ${metric}: ${value}`, margin + 5, yPosition);
    yPosition += 5;
  });
  
  yPosition += 10;

  // 3. SEO ANALYSIS SECTION
  addSectionHeader('SEO Analysis', [139, 69, 19]);
  
  // Basic SEO info
  const seoInfo = [
    ['Page Title', data.title || 'Not found'],
    ['Meta Description', data.description || 'Not found'],
    ['Keywords', data.keywords || 'Not specified'],
    ['Canonical URL', data.canonicalUrl || 'Not specified'],
    ['Robots Meta', data.robotsMeta || 'Not specified'],
    ['Language', data.language || 'Not specified'],
    ['Viewport', data.viewport || 'Not specified']
  ];
  
  seoInfo.forEach(([label, value]) => {
    checkPageBreak(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${label}:`, margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    yPosition = addWrappedText(value, margin + 35, yPosition, pageWidth - 2 * margin - 35, 10);
    yPosition += 3;
  });
  
  yPosition += 10;

  // 4. OPEN GRAPH TAGS SECTION
  if (data.openGraphTags && Object.keys(data.openGraphTags).length > 0) {
    addSectionHeader('Open Graph Tags', [29, 78, 216]);
    
    Object.entries(data.openGraphTags).forEach(([key, value]) => {
      checkPageBreak(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${key}:`, margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      yPosition = addWrappedText(value, margin + 35, yPosition, pageWidth - 2 * margin - 35, 10);
      yPosition += 3;
    });
    yPosition += 10;
  }

  // 5. TWITTER CARDS SECTION
  if (data.twitterCardTags && Object.keys(data.twitterCardTags).length > 0) {
    addSectionHeader('Twitter Card Tags', [29, 161, 242]);
    
    Object.entries(data.twitterCardTags).forEach(([key, value]) => {
      checkPageBreak(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${key}:`, margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      yPosition = addWrappedText(value, margin + 35, yPosition, pageWidth - 2 * margin - 35, 10);
      yPosition += 3;
    });
    yPosition += 10;
  }

  // 6. TECHNICAL SEO CHECKS SECTION
  if (data.technicalChecks) {
    addSectionHeader('Technical SEO Checks', [220, 38, 127]);
    
    const checks = Object.entries(data.technicalChecks);
    const passedChecks = checks.filter(([_, passed]) => passed);
    const failedChecks = checks.filter(([_, passed]) => !passed);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Summary: ${passedChecks.length}/${checks.length} checks passed`, margin, yPosition);
    yPosition += 10;
    
    if (failedChecks.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(239, 68, 68);
      pdf.text('Failed Checks:', margin, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'normal');
      
      failedChecks.forEach(([checkName]) => {
        checkPageBreak(6);
        const formattedName = checkName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        pdf.text(`✗ ${formattedName}`, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
    }
    
    if (passedChecks.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(34, 197, 94);
      pdf.text('Passed Checks:', margin, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'normal');
      
      passedChecks.forEach(([checkName]) => {
        checkPageBreak(6);
        const formattedName = checkName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        pdf.text(`✓ ${formattedName}`, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
    }
    
    pdf.setTextColor(0, 0, 0);
    yPosition += 10;
  }

  // 7. RECOMMENDATIONS SECTION
  if (data.recommendations && data.recommendations.length > 0) {
    addSectionHeader('Optimization Recommendations', [245, 158, 11]);
    
    data.recommendations.forEach((rec, index) => {
      checkPageBreak(30);
      
      // Priority badge
      const priorityColors = {
        high: [239, 68, 68],
        medium: [245, 158, 11],
        low: [34, 197, 94]
      };
      const color = priorityColors[rec.priority] || [107, 114, 128];
      
      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.rect(margin - 5, yPosition - 3, 25, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(rec.priority.toUpperCase(), margin, yPosition + 2);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      yPosition = addWrappedText(`${index + 1}. ${rec.title}`, margin + 30, yPosition, pageWidth - 2 * margin - 30, 11);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      yPosition = addWrappedText(rec.description, margin + 5, yPosition + 2, pageWidth - 2 * margin - 5, 10);
      
      if (rec.howToFix) {
        pdf.setFont('helvetica', 'italic');
        yPosition = addWrappedText(`How to fix: ${rec.howToFix}`, margin + 5, yPosition + 2, pageWidth - 2 * margin - 5, 9);
      }
      
      yPosition += 10;
    });
  }

  // 8. AI SEARCH ANALYSIS SECTION
  if (data.aiSearchAnalysis) {
    addSectionHeader('AI Search Content Analysis', [168, 85, 247]);
    
    if (data.aiSearchAnalysis.contentQuality !== undefined) {
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Content Quality Score: ${data.aiSearchAnalysis.contentQuality}/100`, margin, yPosition);
      yPosition += 10;
    }
    
    if (data.aiSearchAnalysis.insights && data.aiSearchAnalysis.insights.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Content Insights:', margin, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'normal');
      
      data.aiSearchAnalysis.insights.forEach((insight) => {
        checkPageBreak(15);
        yPosition = addWrappedText(`• ${insight.title}: ${insight.description}`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 10);
        yPosition += 5;
      });
      yPosition += 5;
    }
    
    if (data.aiSearchAnalysis.recommendations && data.aiSearchAnalysis.recommendations.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('AI Content Recommendations:', margin, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'normal');
      
      data.aiSearchAnalysis.recommendations.forEach((rec) => {
        checkPageBreak(15);
        yPosition = addWrappedText(`• ${rec.title}: ${rec.description}`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 10);
        yPosition += 5;
      });
      yPosition += 10;
    }
  }

  // 9. KEYWORD ANALYSIS SECTION
  if (data.keywordAnalysis) {
    addSectionHeader('SEO Keywords Analysis', [34, 197, 94]);
    
    if (data.keywordAnalysis.score) {
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Keyword Score: ${data.keywordAnalysis.score}/100`, margin, yPosition);
      yPosition += 10;
    }
    
    if (data.keywordAnalysis.primaryKeywords && data.keywordAnalysis.primaryKeywords.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Primary Keywords:', margin, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'normal');
      
      data.keywordAnalysis.primaryKeywords.forEach((keyword) => {
        checkPageBreak(6);
        pdf.text(`• ${keyword.term} (${keyword.frequency} occurrences)`, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
    }
    
    if (data.keywordAnalysis.secondaryKeywords && data.keywordAnalysis.secondaryKeywords.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Secondary Keywords:', margin, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'normal');
      
      data.keywordAnalysis.secondaryKeywords.forEach((keyword) => {
        checkPageBreak(6);
        pdf.text(`• ${keyword.term} (${keyword.frequency} occurrences)`, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
    }
    
    if (data.keywordAnalysis.longTailKeywords && data.keywordAnalysis.longTailKeywords.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Long-tail Keywords:', margin, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'normal');
      
      data.keywordAnalysis.longTailKeywords.forEach((keyword) => {
        checkPageBreak(6);
        pdf.text(`• ${keyword}`, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 10;
    }
  }

  // 10. PERFORMANCE DIAGNOSTICS SECTION
  if (data.diagnostics) {
    addSectionHeader('Performance Diagnostics', [239, 68, 68]);
    
    if (data.diagnostics.performance && data.diagnostics.performance.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Performance Issues:', margin, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'normal');
      
      data.diagnostics.performance.forEach((diagnostic) => {
        checkPageBreak(20);
        pdf.setFont('helvetica', 'bold');
        yPosition = addWrappedText(`• ${diagnostic.title}`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 10);
        pdf.setFont('helvetica', 'normal');
        yPosition = addWrappedText(`  ${diagnostic.description}`, margin + 10, yPosition + 2, pageWidth - 2 * margin - 10, 9);
        yPosition += 8;
      });
      yPosition += 5;
    }
    
    if (data.diagnostics.seo && data.diagnostics.seo.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('SEO Diagnostics:', margin, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'normal');
      
      data.diagnostics.seo.forEach((diagnostic) => {
        checkPageBreak(20);
        pdf.setFont('helvetica', 'bold');
        yPosition = addWrappedText(`• ${diagnostic.title}`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 10);
        pdf.setFont('helvetica', 'normal');
        yPosition = addWrappedText(`  ${diagnostic.description}`, margin + 10, yPosition + 2, pageWidth - 2 * margin - 10, 9);
        yPosition += 8;
      });
      yPosition += 10;
    }
  }

  // 11. PERFORMANCE INSIGHTS SECTION
  if (data.insights && (data.insights.opportunities.length > 0 || data.insights.diagnostics.length > 0)) {
    addSectionHeader('Performance Insights & Opportunities', [146, 64, 14]);
    
    if (data.insights.opportunities.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Optimization Opportunities:', margin, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'normal');
      
      data.insights.opportunities.forEach((opportunity) => {
        checkPageBreak(20);
        pdf.setFont('helvetica', 'bold');
        yPosition = addWrappedText(`• ${opportunity.title}`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 10);
        pdf.setFont('helvetica', 'normal');
        if (opportunity.displayValue) {
          yPosition = addWrappedText(`  Potential savings: ${opportunity.displayValue}`, margin + 10, yPosition + 2, pageWidth - 2 * margin - 10, 9);
        }
        yPosition = addWrappedText(`  ${opportunity.description}`, margin + 10, yPosition + 2, pageWidth - 2 * margin - 10, 9);
        yPosition += 8;
      });
      yPosition += 10;
    }
  }

  // Footer
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
    pdf.text(`Generated by Web Performance Analyzer - ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);
  }

  pdf.save(`web-analysis-complete-${data.url.replace(/https?:\/\//, '').replace(/[^\w]/g, '-')}.pdf`);
}

// Visual PDF export using html2canvas for web-like appearance
export async function exportVisualPDF(data: WebAnalysisResult): Promise<void> {
  try {
    // Try to capture the main content area
    const element = document.querySelector('.analysis-results') || document.querySelector('.space-y-6') || document.body;
    if (!element) {
      throw new Error('No content found to export');
    }

    const canvas = await html2canvas(element as HTMLElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      width: element.scrollWidth,
      height: element.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    
    // Add additional pages if content is longer than one page
    while (position + imgHeight > pageHeight) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    }

    pdf.save(`web-analysis-visual-${data.url.replace(/https?:\/\//, '').replace(/[^\w]/g, '-')}.pdf`);
  } catch (error) {
    console.warn('Visual PDF export failed, falling back to comprehensive PDF:', error);
    // Fallback to comprehensive PDF
    await exportCompletePDF(data);
  }
}

// Main export function with smart fallback
export async function exportToPDF(data: WebAnalysisResult): Promise<void> {
  try {
    // Try visual export first, fall back to comprehensive text-based export
    await exportVisualPDF(data);
  } catch (error) {
    console.warn('Visual export failed, using comprehensive text export:', error);
    await exportCompletePDF(data);
  }
}

// Individual component capture for development
export async function captureComponentAsPDF(elementId: string, fileName: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(fileName);
}