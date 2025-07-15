import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { WebAnalysisResult } from '@/types/seo';

// Helper function to capture a DOM element as image
async function captureElement(selector: string): Promise<string | null> {
  try {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) return null;
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true
    });
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.warn('Failed to capture element:', selector, error);
    return null;
  }
}

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

export async function exportToPDF(data: WebAnalysisResult): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Helper function to add text with line wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10): number => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * fontSize * 0.35);
  };

  // Header with styling
  pdf.setFillColor(59, 130, 246); // Blue background
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Web Performance Analysis Report', margin, 25);
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  yPosition = 50;
  pdf.text(`Website: ${data.url}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, yPosition);
  yPosition += 20;

  // Performance Overview Section with Charts
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 41, 59);
  pdf.text('Performance Overview', margin, yPosition);
  yPosition += 12;

  // Create progress charts for each score
  const chartSize = 35;
  const chartSpacing = 45;
  const startX = margin;
  
  // Performance Score Chart
  const perfChart = generateProgressChart(data.performanceScore, 70);
  pdf.addImage(perfChart, 'PNG', startX, yPosition, chartSize, chartSize);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Performance', startX + chartSize/2, yPosition + chartSize + 8, { align: 'center' });
  
  // Accessibility Score Chart
  const a11yChart = generateProgressChart(data.accessibilityScore, 70);
  pdf.addImage(a11yChart, 'PNG', startX + chartSpacing, yPosition, chartSize, chartSize);
  pdf.text('Accessibility', startX + chartSpacing + chartSize/2, yPosition + chartSize + 8, { align: 'center' });
  
  // Best Practices Score Chart
  const bpChart = generateProgressChart(data.bestPracticesScore, 70);
  pdf.addImage(bpChart, 'PNG', startX + chartSpacing * 2, yPosition, chartSize, chartSize);
  pdf.text('Best Practices', startX + chartSpacing * 2 + chartSize/2, yPosition + chartSize + 8, { align: 'center' });
  
  // SEO Score Chart
  const seoChart = generateProgressChart(data.seoScore, 70);
  pdf.addImage(seoChart, 'PNG', startX + chartSpacing * 3, yPosition, chartSize, chartSize);
  pdf.text('SEO', startX + chartSpacing * 3 + chartSize/2, yPosition + chartSize + 8, { align: 'center' });
  
  yPosition += chartSize + 20;

  // SEO Analysis Section with visual styling
  pdf.setFillColor(248, 250, 252); // Light gray background
  pdf.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 60, 'F');
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 41, 59);
  pdf.text('SEO Analysis', margin, yPosition + 5);
  yPosition += 15;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(51, 65, 85);
  
  if (data.title) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Page Title:', margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    yPosition = addWrappedText(data.title, margin + 25, yPosition, pageWidth - 2 * margin - 25, 11);
    yPosition += 5;
  }
  
  if (data.description) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Meta Description:', margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    yPosition = addWrappedText(data.description, margin + 35, yPosition, pageWidth - 2 * margin - 35, 11);
    yPosition += 5;
  } else {
    pdf.setTextColor(239, 68, 68);
    pdf.text('Meta Description: Missing', margin, yPosition);
    yPosition += 5;
  }
  
  yPosition += 10;

  // Open Graph Tags
  if (data.openGraphTags && Object.keys(data.openGraphTags).length > 0) {
    yPosition += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Open Graph Tags:', margin, yPosition);
    yPosition += 6;
    pdf.setFont('helvetica', 'normal');
    
    Object.entries(data.openGraphTags).forEach(([key, value]) => {
      yPosition = addWrappedText(`${key}: ${value}`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 10);
      yPosition += 2;
    });
  }

  // Twitter Cards
  if (data.twitterCardTags && Object.keys(data.twitterCardTags).length > 0) {
    yPosition += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Twitter Card Tags:', margin, yPosition);
    yPosition += 6;
    pdf.setFont('helvetica', 'normal');
    
    Object.entries(data.twitterCardTags).forEach(([key, value]) => {
      yPosition = addWrappedText(`${key}: ${value}`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 10);
      yPosition += 2;
    });
  }

  // Check if we need a new page
  if (yPosition > pageHeight - 50) {
    pdf.addPage();
    yPosition = margin;
  }

  // Core Web Vitals Section with visual metrics
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Core Web Vitals', margin, yPosition);
  yPosition += 12;

  const mobileMetrics = data.coreWebVitals.mobile;
  const desktopMetrics = data.coreWebVitals.desktop;
  
  // Check if we have real data
  const hasRealData = mobileMetrics.lcp !== null || desktopMetrics.lcp !== null;
  
  if (!hasRealData) {
    pdf.setFillColor(255, 251, 235); // Amber background
    pdf.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 25, 'F');
    pdf.setTextColor(146, 64, 14);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Core Web Vitals data not available - requires performance measurement tools', margin, yPosition + 5);
    pdf.text('Current analysis provides SEO and technical insights only', margin, yPosition + 12);
    yPosition += 30;
  } else {
    // Mobile and Desktop metrics in columns
    const columnWidth = (pageWidth - 2 * margin - 10) / 2;
    
    // Mobile column
    pdf.setFillColor(239, 246, 255); // Light blue background
    pdf.rect(margin - 5, yPosition - 5, columnWidth, 45, 'F');
    
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Mobile', margin, yPosition + 5);
    yPosition += 12;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`LCP: ${mobileMetrics.lcp ? `${mobileMetrics.lcp}ms` : 'N/A'}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`FID: ${mobileMetrics.fid ? `${mobileMetrics.fid}ms` : 'N/A'}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`CLS: ${mobileMetrics.cls ? mobileMetrics.cls.toFixed(3) : 'N/A'}`, margin, yPosition);
    
    // Desktop column
    const desktopX = margin + columnWidth + 10;
    yPosition -= 22; // Reset for desktop column
    
    pdf.setFillColor(240, 253, 244); // Light green background
    pdf.rect(desktopX - 5, yPosition - 5, columnWidth, 45, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Desktop', desktopX, yPosition + 5);
    yPosition += 12;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`LCP: ${desktopMetrics.lcp ? `${desktopMetrics.lcp}ms` : 'N/A'}`, desktopX, yPosition);
    yPosition += 5;
    pdf.text(`FID: ${desktopMetrics.fid ? `${desktopMetrics.fid}ms` : 'N/A'}`, desktopX, yPosition);
    yPosition += 5;
    pdf.text(`CLS: ${desktopMetrics.cls ? desktopMetrics.cls.toFixed(3) : 'N/A'}`, desktopX, yPosition);
    
    yPosition += 20;
  }

  // Check if we need a new page
  if (yPosition > pageHeight - 80) {
    pdf.addPage();
    yPosition = margin;
  }

  // Recommendations Section with visual styling
  if (data.recommendations && data.recommendations.length > 0) {
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recommendations', margin, yPosition);
    yPosition += 12;

    data.recommendations.forEach((rec, index) => {
      // Check if we need a new page for this recommendation
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = margin;
      }

      // Priority indicator with color coding
      let bgColor, textColor;
      if (rec.priority === 'high') {
        bgColor = [239, 68, 68]; // Red
        textColor = [255, 255, 255];
      } else if (rec.priority === 'medium') {
        bgColor = [245, 158, 11]; // Amber
        textColor = [255, 255, 255];
      } else {
        bgColor = [34, 197, 94]; // Green
        textColor = [255, 255, 255];
      }
      
      // Priority badge
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 40, 'F');
      
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      const priorityText = `${index + 1}. ${rec.priority.toUpperCase()} ${rec.type.toUpperCase()}`;
      pdf.text(priorityText, margin, yPosition + 2);
      
      // Title
      pdf.setFontSize(12);
      yPosition = addWrappedText(rec.title, margin, yPosition + 8, pageWidth - 2 * margin, 12);
      
      // Description
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      yPosition = addWrappedText(rec.description, margin, yPosition + 2, pageWidth - 2 * margin, 10);
      
      // How to fix (if available)
      if (rec.howToFix) {
        pdf.setFont('helvetica', 'italic');
        yPosition = addWrappedText(`How to fix: ${rec.howToFix}`, margin, yPosition + 2, pageWidth - 2 * margin, 9);
      }
      
      yPosition += 15;
      pdf.setTextColor(0, 0, 0); // Reset to black
    });
  }

  // Technical Checks Section with visual summary
  if (data.technicalChecks) {
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Technical SEO Checks', margin, yPosition);
    yPosition += 12;

    const checks = Object.entries(data.technicalChecks);
    const passedChecks = checks.filter(([_, passed]) => passed);
    const failedChecks = checks.filter(([_, passed]) => !passed);
    const passRate = Math.round((passedChecks.length / checks.length) * 100);

    // Summary with visual indicator
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 25, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(passRate >= 80 ? 34 : passRate >= 60 ? 245 : 239, 
                     passRate >= 80 ? 197 : passRate >= 60 ? 158 : 68, 
                     passRate >= 80 ? 94 : passRate >= 60 ? 11 : 68);
    pdf.text(`Overall Score: ${passedChecks.length}/${checks.length} (${passRate}%)`, margin, yPosition + 5);
    
    pdf.setTextColor(51, 65, 85);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Passed: ${passedChecks.length} | Failed: ${failedChecks.length}`, margin, yPosition + 15);
    yPosition += 30;

    // Failed checks with visual styling
    if (failedChecks.length > 0) {
      pdf.setFillColor(254, 242, 242); // Light red background
      pdf.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, Math.min(failedChecks.length * 5 + 15, 50), 'F');
      
      pdf.setTextColor(185, 28, 28);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Issues Found:', margin, yPosition + 5);
      yPosition += 10;
      
      pdf.setTextColor(127, 29, 29);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');

      failedChecks.slice(0, 8).forEach(([checkName]) => {
        const formattedName = checkName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        pdf.text(`✗ ${formattedName}`, margin + 5, yPosition);
        yPosition += 4;
      });
      
      if (failedChecks.length > 8) {
        pdf.text(`... and ${failedChecks.length - 8} more issues`, margin + 5, yPosition);
        yPosition += 4;
      }
    }
  }

  // Add footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
    pdf.text('Generated by Web Performance Analyzer', margin, pageHeight - 10);
  }

  // Save the PDF
  const fileName = `web-analysis-${data.url.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}

// Enhanced PDF export that captures visual components from the web interface
export async function exportVisualPDF(data: WebAnalysisResult): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Header with styling
  pdf.setFillColor(59, 130, 246);
  pdf.rect(0, 0, pageWidth, 35, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Web Performance Analysis Report', margin, 22);
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  yPosition = 45;
  pdf.text(`Website: ${data.url} | Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 15;

  // Try to capture performance overview component
  try {
    const perfOverview = document.querySelector('[data-component="performance-overview"]') as HTMLElement;
    if (perfOverview) {
      const canvas = await html2canvas(perfOverview, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      if (yPosition + imgHeight > pageHeight - 20) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    } else {
      // Fallback to generated charts
      yPosition = await addPerformanceCharts(pdf, data, yPosition, pageWidth, margin);
    }
  } catch (error) {
    console.warn('Failed to capture performance overview, using fallback charts');
    yPosition = await addPerformanceCharts(pdf, data, yPosition, pageWidth, margin);
  }

  // Try to capture Core Web Vitals component
  try {
    const coreWebVitals = document.querySelector('[data-component="core-web-vitals"]') as HTMLElement;
    if (coreWebVitals && yPosition < pageHeight - 50) {
      const canvas = await html2canvas(coreWebVitals, {
        scale: 1.2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      if (yPosition + imgHeight > pageHeight - 20) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    }
  } catch (error) {
    console.warn('Failed to capture Core Web Vitals component');
  }

  // Add text-based sections for recommendations and technical checks
  if (yPosition > pageHeight - 80) {
    pdf.addPage();
    yPosition = margin;
  }

  // Recommendations section
  if (data.recommendations && data.recommendations.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text('Key Recommendations', margin, yPosition);
    yPosition += 10;

    const topRecommendations = data.recommendations.slice(0, 5);
    topRecommendations.forEach((rec, index) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      const bgColor = rec.priority === 'high' ? [254, 242, 242] : 
                     rec.priority === 'medium' ? [255, 251, 235] : [240, 253, 244];
      
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 25, 'F');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(rec.priority === 'high' ? 185 : rec.priority === 'medium' ? 146 : 34,
                       rec.priority === 'high' ? 28 : rec.priority === 'medium' ? 64 : 197,
                       rec.priority === 'high' ? 28 : rec.priority === 'medium' ? 14 : 94);
      
      pdf.text(`${index + 1}. ${rec.title}`, margin, yPosition + 5);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const descLines = pdf.splitTextToSize(rec.description, pageWidth - 2 * margin);
      pdf.text(descLines.slice(0, 2), margin, yPosition + 12);
      
      yPosition += 30;
    });
  }

  // Add footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
    pdf.text('Generated by Web Performance Analyzer', margin, pageHeight - 10);
  }

  // Save the PDF
  const fileName = `web-analysis-visual-${data.url.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}

// Helper function to add performance charts
async function addPerformanceCharts(pdf: any, data: WebAnalysisResult, yPosition: number, pageWidth: number, margin: number): Promise<number> {
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 41, 59);
  pdf.text('Performance Overview', margin, yPosition);
  yPosition += 12;

  const chartSize = 30;
  const chartSpacing = 40;
  const startX = margin;
  
  const perfChart = generateProgressChart(data.performanceScore, 60);
  pdf.addImage(perfChart, 'PNG', startX, yPosition, chartSize, chartSize);
  pdf.setFontSize(8);
  pdf.text('Performance', startX + chartSize/2, yPosition + chartSize + 6, { align: 'center' });
  
  const a11yChart = generateProgressChart(data.accessibilityScore, 60);
  pdf.addImage(a11yChart, 'PNG', startX + chartSpacing, yPosition, chartSize, chartSize);
  pdf.text('Accessibility', startX + chartSpacing + chartSize/2, yPosition + chartSize + 6, { align: 'center' });
  
  const bpChart = generateProgressChart(data.bestPracticesScore, 60);
  pdf.addImage(bpChart, 'PNG', startX + chartSpacing * 2, yPosition, chartSize, chartSize);
  pdf.text('Best Practices', startX + chartSpacing * 2 + chartSize/2, yPosition + chartSize + 6, { align: 'center' });
  
  const seoChart = generateProgressChart(data.seoScore, 60);
  pdf.addImage(seoChart, 'PNG', startX + chartSpacing * 3, yPosition, chartSize, chartSize);
  pdf.text('SEO', startX + chartSpacing * 3 + chartSize/2, yPosition + chartSize + 6, { align: 'center' });
  
  return yPosition + chartSize + 20;
}

// Helper function to capture component as image and add to PDF
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