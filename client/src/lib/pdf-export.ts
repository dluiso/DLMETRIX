import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { WebAnalysisResult } from '@/types/seo';

export async function exportToPDF(data: WebAnalysisResult): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function to add text with line wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10): number => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * fontSize * 0.35);
  };

  // Header
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Web Performance Analysis Report', margin, yPosition);
  yPosition += 15;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Website: ${data.url}`, margin, yPosition);
  yPosition += 8;
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 15;

  // Performance Overview Section
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Performance Overview', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Performance Score: ${data.performanceScore}/100`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Accessibility Score: ${data.accessibilityScore}/100`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Best Practices Score: ${data.bestPracticesScore}/100`, margin, yPosition);
  yPosition += 6;
  pdf.text(`SEO Score: ${data.seoScore}/100`, margin, yPosition);
  yPosition += 15;

  // SEO Analysis Section
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SEO Analysis', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  if (data.title) {
    yPosition = addWrappedText(`Title: ${data.title}`, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 4;
  }
  
  if (data.description) {
    yPosition = addWrappedText(`Description: ${data.description}`, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 4;
  }

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

  // Core Web Vitals Section
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Core Web Vitals', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');

  // Mobile metrics
  pdf.setFont('helvetica', 'bold');
  pdf.text('Mobile:', margin, yPosition);
  yPosition += 6;
  pdf.setFont('helvetica', 'normal');

  const mobileMetrics = data.coreWebVitals.mobile;
  pdf.text(`LCP: ${mobileMetrics.lcp ? `${mobileMetrics.lcp}ms` : 'N/A'}`, margin + 5, yPosition);
  yPosition += 5;
  pdf.text(`FID: ${mobileMetrics.fid ? `${mobileMetrics.fid}ms` : 'N/A'}`, margin + 5, yPosition);
  yPosition += 5;
  pdf.text(`CLS: ${mobileMetrics.cls ? mobileMetrics.cls.toFixed(3) : 'N/A'}`, margin + 5, yPosition);
  yPosition += 8;

  // Desktop metrics
  pdf.setFont('helvetica', 'bold');
  pdf.text('Desktop:', margin, yPosition);
  yPosition += 6;
  pdf.setFont('helvetica', 'normal');

  const desktopMetrics = data.coreWebVitals.desktop;
  pdf.text(`LCP: ${desktopMetrics.lcp ? `${desktopMetrics.lcp}ms` : 'N/A'}`, margin + 5, yPosition);
  yPosition += 5;
  pdf.text(`FID: ${desktopMetrics.fid ? `${desktopMetrics.fid}ms` : 'N/A'}`, margin + 5, yPosition);
  yPosition += 5;
  pdf.text(`CLS: ${desktopMetrics.cls ? desktopMetrics.cls.toFixed(3) : 'N/A'}`, margin + 5, yPosition);
  yPosition += 15;

  // Check if we need a new page
  if (yPosition > pageHeight - 80) {
    pdf.addPage();
    yPosition = margin;
  }

  // Recommendations Section
  if (data.recommendations && data.recommendations.length > 0) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recommendations', margin, yPosition);
    yPosition += 8;

    data.recommendations.forEach((rec, index) => {
      // Check if we need a new page for this recommendation
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      
      // Priority and type indicator
      const priorityText = `${index + 1}. [${rec.priority.toUpperCase()} ${rec.type.toUpperCase()}]`;
      pdf.text(priorityText, margin, yPosition);
      yPosition += 6;

      // Title
      yPosition = addWrappedText(rec.title, margin, yPosition, pageWidth - 2 * margin, 11);
      yPosition += 3;

      // Description
      pdf.setFont('helvetica', 'normal');
      yPosition = addWrappedText(rec.description, margin, yPosition, pageWidth - 2 * margin, 10);
      yPosition += 3;

      // How to fix (if available)
      if (rec.howToFix) {
        pdf.setFont('helvetica', 'italic');
        yPosition = addWrappedText(`Fix: ${rec.howToFix}`, margin, yPosition, pageWidth - 2 * margin, 10);
      }
      
      yPosition += 8;
    });
  }

  // Technical Checks Section
  if (data.technicalChecks) {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Technical SEO Checks', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const checks = Object.entries(data.technicalChecks);
    const passedChecks = checks.filter(([_, passed]) => passed);
    const failedChecks = checks.filter(([_, passed]) => !passed);

    pdf.text(`Passed: ${passedChecks.length}/${checks.length} checks`, margin, yPosition);
    yPosition += 8;

    // Failed checks
    if (failedChecks.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Failed Checks:', margin, yPosition);
      yPosition += 5;
      pdf.setFont('helvetica', 'normal');

      failedChecks.forEach(([checkName]) => {
        const formattedName = checkName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        pdf.text(`• ${formattedName}`, margin + 5, yPosition);
        yPosition += 4;
      });
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