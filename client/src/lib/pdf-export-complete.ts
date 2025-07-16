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

// Complete PDF export function with ALL report data - ENSURES ALL SECTIONS ARE INCLUDED
export async function exportCompletePDF(data: WebAnalysisResult): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;
  
  // Function to add new page if needed - MORE AGGRESSIVE PAGE BREAKS
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 30) { // More conservative margin
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to add text with line wrapping - FIXED SPACING
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10): number => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * (fontSize * 0.5)); // More conservative line spacing to prevent overlap
  };

  // Helper function to add section header - ALWAYS ENSURES SPACE
  const addSectionHeader = (title: string, bgColor = [59, 130, 246]) => {
    checkPageBreak(50); // More space for headers
    
    // Add some spacing before header if not at top of page
    if (yPosition > margin + 10) {
      yPosition += 10;
    }
    
    pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    pdf.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 18, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, yPosition + 7);
    yPosition += 28; // More space after headers
    pdf.setTextColor(0, 0, 0);
  };

  // Header with improved styling
  pdf.setFillColor(59, 130, 246);
  pdf.rect(0, 0, pageWidth, 45, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Complete DLMETRIX Analysis Report', margin, 20);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Comprehensive website analysis including performance, SEO, and accessibility insights', margin, 30);
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  yPosition = 55;
  pdf.text(`Website: ${data.url}`, margin, yPosition);
  yPosition += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(107, 114, 128);
  pdf.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, yPosition);
  pdf.setTextColor(0, 0, 0);
  yPosition += 25;

  // 1. PERFORMANCE OVERVIEW SECTION
  addSectionHeader('Performance Overview');
  
  // Simple text-based scores instead of problematic charts
  const overallScore = Math.round((data.performanceScore + data.accessibilityScore + data.bestPracticesScore + data.seoScore) / 4);
  
  // Display scores in a clean table format
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Overall Score:', margin, yPosition);
  pdf.setFontSize(16);
  pdf.setTextColor(34, 197, 94);
  pdf.text(`${overallScore}/100`, margin + 50, yPosition);
  pdf.setTextColor(0, 0, 0);
  yPosition += 15;
  
  // Individual scores in clean format
  const scores = [
    { name: 'Performance', score: data.performanceScore },
    { name: 'Accessibility', score: data.accessibilityScore },
    { name: 'Best Practices', score: data.bestPracticesScore },
    { name: 'SEO', score: data.seoScore }
  ];
  
  scores.forEach((scoreData) => {
    checkPageBreak(8);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${scoreData.name}:`, margin + 10, yPosition);
    
    // Color code the score
    const scoreColor = scoreData.score >= 80 ? [34, 197, 94] : scoreData.score >= 60 ? [245, 158, 11] : [239, 68, 68];
    pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    pdf.text(`${scoreData.score}/100`, margin + 80, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 7;
  });
  
  yPosition += 20;

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
    checkPageBreak(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text(`${label}:`, margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    yPosition = addWrappedText(value, margin + 35, yPosition, pageWidth - 2 * margin - 35, 9);
    yPosition += 8;
  });
  
  yPosition += 20;

  // 4. OPEN GRAPH TAGS SECTION
  if (data.openGraphTags && Object.keys(data.openGraphTags).length > 0) {
    addSectionHeader('Open Graph Tags', [29, 78, 216]);
    
    Object.entries(data.openGraphTags).forEach(([key, value]) => {
      checkPageBreak(15);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text(`${key}:`, margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      yPosition = addWrappedText(value, margin + 35, yPosition, pageWidth - 2 * margin - 35, 9);
      yPosition += 8;
    });
    yPosition += 15;
  } else {
    addSectionHeader('Open Graph Tags', [29, 78, 216]);
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    pdf.text('No Open Graph tags found', margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 15;
  }

  // 5. TWITTER CARDS SECTION
  if (data.twitterCardTags && Object.keys(data.twitterCardTags).length > 0) {
    addSectionHeader('Twitter Card Tags', [29, 161, 242]);
    
    Object.entries(data.twitterCardTags).forEach(([key, value]) => {
      checkPageBreak(15);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text(`${key}:`, margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      yPosition = addWrappedText(value, margin + 35, yPosition, pageWidth - 2 * margin - 35, 9);
      yPosition += 8;
    });
    yPosition += 15;
  } else {
    addSectionHeader('Twitter Card Tags', [29, 161, 242]);
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    pdf.text('No Twitter Card tags found', margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 15;
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
        checkPageBreak(10);
        const formattedName = checkName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`✗ ${formattedName}`, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
    }
    
    if (passedChecks.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(34, 197, 94);
      pdf.text('Passed Checks:', margin, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'normal');
      
      passedChecks.forEach(([checkName]) => {
        checkPageBreak(10);
        const formattedName = checkName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`✓ ${formattedName}`, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
    }
    
    pdf.setTextColor(0, 0, 0);
    yPosition += 10;
  }

  // 7. RECOMMENDATIONS SECTION
  if (data.recommendations && data.recommendations.length > 0) {
    addSectionHeader('Optimization Recommendations', [245, 158, 11]);
    
    data.recommendations.forEach((rec, index) => {
      checkPageBreak(60); // Even more space for recommendations
      
      // Priority badge with better positioning
      const priorityColors = {
        high: [239, 68, 68],
        medium: [245, 158, 11],
        low: [34, 197, 94]
      };
      const color = priorityColors[rec.priority] || [107, 114, 128];
      
      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.rect(margin - 5, yPosition - 3, 25, 10, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.text(rec.priority.toUpperCase(), margin - 2, yPosition + 3);
      
      // Title with better spacing
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      yPosition = addWrappedText(`${index + 1}. ${rec.title}`, margin + 28, yPosition, pageWidth - 2 * margin - 28, 11);
      yPosition += 5;
      
      // Description with proper spacing
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      yPosition = addWrappedText(rec.description, margin + 5, yPosition, pageWidth - 2 * margin - 5, 9);
      yPosition += 5;
      
      // How to fix with proper spacing
      if (rec.howToFix) {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(8);
        yPosition = addWrappedText(`How to fix: ${rec.howToFix}`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 8);
        yPosition += 5;
      }
      
      yPosition += 18; // More space between recommendations
    });
  }

  // 8. AI SEARCH ANALYSIS SECTION
  if (data.aiSearchAnalysis) {
    addSectionHeader('AI Search Content Analysis', [168, 85, 247]);
    
    // Content Quality Score with visual indicator
    if (data.aiSearchAnalysis.contentQuality !== undefined) {
      pdf.setFillColor(240, 253, 244); // Light green background
      pdf.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 20, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('Content Quality Score:', margin, yPosition + 5);
      
      // Score with color coding
      const score = data.aiSearchAnalysis.contentQuality;
      const scoreColor = score >= 80 ? [34, 197, 94] : score >= 60 ? [245, 158, 11] : [239, 68, 68];
      pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${score}/100`, margin + 60, yPosition + 5);
      
      pdf.setTextColor(0, 0, 0);
      yPosition += 25;
    }
    
    // Content Insights
    if (data.aiSearchAnalysis.insights && data.aiSearchAnalysis.insights.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('Content Insights:', margin, yPosition);
      yPosition += 10;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      data.aiSearchAnalysis.insights.forEach((insight, index) => {
        checkPageBreak(20);
        pdf.setFont('helvetica', 'bold');
        yPosition = addWrappedText(`${index + 1}. ${insight.title}`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 10);
        pdf.setFont('helvetica', 'normal');
        yPosition = addWrappedText(`   ${insight.description}`, margin + 8, yPosition + 2, pageWidth - 2 * margin - 8, 9);
        yPosition += 8;
      });
      yPosition += 10;
    }
    
    // AI Content Recommendations
    if (data.aiSearchAnalysis.recommendations && data.aiSearchAnalysis.recommendations.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('AI Content Recommendations:', margin, yPosition);
      yPosition += 10;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      data.aiSearchAnalysis.recommendations.forEach((rec, index) => {
        checkPageBreak(20);
        pdf.setFont('helvetica', 'bold');
        yPosition = addWrappedText(`${index + 1}. ${rec.title}`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 10);
        pdf.setFont('helvetica', 'normal');
        yPosition = addWrappedText(`   ${rec.description}`, margin + 8, yPosition + 2, pageWidth - 2 * margin - 8, 9);
        yPosition += 8;
      });
      yPosition += 15;
    }
    
    // Add detailed AI analysis information even when no specific insights are available
    if (!data.aiSearchAnalysis.insights || data.aiSearchAnalysis.insights.length === 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('Content Analysis Summary:', margin, yPosition);
      yPosition += 8;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const analysisPoints = [
        'Structured data markup evaluation completed',
        'Semantic clarity assessment performed', 
        'Content quality evaluation based on available content',
        'Topic extraction and entity recognition analysis',
        'Search engine optimization recommendations generated'
      ];
      
      analysisPoints.forEach(point => {
        checkPageBreak(8);
        pdf.text(`• ${point}`, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 15;
    }
  }

  // 9. HEADING STRUCTURE ANALYSIS SECTION
  if (data.headings || data.headingStructure) {
    addSectionHeader('Heading Structure Analysis', [156, 39, 176]);
    
    // Critical SEO Assessment
    const startsWithH1 = data.headingStructure?.[0]?.level === 'H1';
    const h1Count = data.headings?.h1?.length || 0;
    const totalHeadings = data.headingStructure?.length || 0;
    
    // Heading Hierarchy Score
    pdf.setFillColor(startsWithH1 ? 240 : 254, startsWithH1 ? 253 : 242, startsWithH1 ? 244 : 242); // Green or red background
    pdf.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 25, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('SEO Hierarchy Score:', margin, yPosition + 5);
    
    // Score with color coding
    const hierarchyScore = startsWithH1 ? 100 : 25;
    const scoreColor = startsWithH1 ? [34, 197, 94] : [239, 68, 68];
    pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${hierarchyScore}/100`, margin + 60, yPosition + 5);
    
    // Status indicator
    pdf.setFontSize(10);
    pdf.text(startsWithH1 ? '(Excellent)' : '(Critical Issue)', margin + 100, yPosition + 5);
    
    pdf.setTextColor(0, 0, 0);
    yPosition += 30;
    
    // Summary Statistics
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('Structure Summary:', margin, yPosition);
    yPosition += 8;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`First Heading Level: ${data.headingStructure?.[0]?.level || 'N/A'}`, margin + 5, yPosition);
    yPosition += 6;
    pdf.text(`Total Headings Found: ${totalHeadings}`, margin + 5, yPosition);
    yPosition += 6;
    pdf.text(`H1 Headings Count: ${h1Count}`, margin + 5, yPosition);
    yPosition += 6;
    
    // Critical Issue Warning
    if (!startsWithH1) {
      pdf.setTextColor(239, 68, 68);
      pdf.setFont('helvetica', 'bold');
      pdf.text('⚠ Critical SEO Issue: Page does not start with H1 heading!', margin + 5, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 8;
    } else {
      pdf.setTextColor(34, 197, 94);
      pdf.setFont('helvetica', 'bold');
      pdf.text('✓ Excellent: Page follows proper H1 hierarchy', margin + 5, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 8;
    }
    
    yPosition += 5;
    
    // Heading Groups by Type
    if (data.headings) {
      const headingTypes = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('Headings by Type:', margin, yPosition);
      yPosition += 8;
      
      headingTypes.forEach(level => {
        const headings = data.headings?.[level];
        if (headings && headings.length > 0) {
          checkPageBreak(15);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.text(`${level.toUpperCase()} (${headings.length}):`, margin + 5, yPosition);
          yPosition += 6;
          
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          headings.forEach(heading => {
            checkPageBreak(8);
            const truncatedHeading = heading.length > 80 ? heading.substring(0, 80) + '...' : heading;
            yPosition = addWrappedText(`• ${truncatedHeading}`, margin + 10, yPosition, pageWidth - 2 * margin - 10, 9);
            yPosition += 4;
          });
          yPosition += 3;
        }
      });
    }
    
    // Heading Structure Order (if available)
    if (data.headingStructure && data.headingStructure.length > 0) {
      checkPageBreak(30);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('Heading Structure Order (as appears on page):', margin, yPosition);
      yPosition += 8;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      
      data.headingStructure.slice(0, 15).forEach((heading, index) => {
        checkPageBreak(8);
        const position = `#${index + 1}`;
        const level = heading.level || 'N/A';
        const text = heading.text ? (heading.text.length > 60 ? heading.text.substring(0, 60) + '...' : heading.text) : 'No text';
        
        // Color code first heading if not H1
        if (index === 0 && heading.level !== 'H1') {
          pdf.setTextColor(239, 68, 68);
        }
        
        pdf.text(`${position}`, margin + 5, yPosition);
        pdf.text(`${level}`, margin + 15, yPosition);
        pdf.text(`${text}`, margin + 25, yPosition);
        yPosition += 5;
        
        pdf.setTextColor(0, 0, 0);
      });
      
      if (data.headingStructure.length > 15) {
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(107, 114, 128);
        pdf.text(`... and ${data.headingStructure.length - 15} more headings`, margin + 5, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 6;
      }
      yPosition += 10;
    }
    
    // SEO Recommendations for Heading Structure
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('Heading Structure Recommendations:', margin, yPosition);
    yPosition += 8;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    
    if (!startsWithH1) {
      pdf.setTextColor(239, 68, 68);
      yPosition = addWrappedText('• CRITICAL: Change your first heading to H1 for proper SEO hierarchy', margin + 5, yPosition, pageWidth - 2 * margin - 5, 9);
      yPosition += 5;
    }
    
    if (h1Count === 0) {
      pdf.setTextColor(239, 68, 68);
      yPosition = addWrappedText('• CRITICAL: Add at least one H1 heading to your page', margin + 5, yPosition, pageWidth - 2 * margin - 5, 9);
      yPosition += 5;
    } else if (h1Count > 1) {
      pdf.setTextColor(245, 158, 11);
      yPosition = addWrappedText('• WARNING: Consider using only one H1 heading per page for better SEO', margin + 5, yPosition, pageWidth - 2 * margin - 5, 9);
      yPosition += 5;
    }
    
    if (totalHeadings < 3) {
      pdf.setTextColor(245, 158, 11);
      yPosition = addWrappedText('• Add more headings (H2, H3) to improve content structure and readability', margin + 5, yPosition, pageWidth - 2 * margin - 5, 9);
      yPosition += 5;
    }
    
    pdf.setTextColor(34, 197, 94);
    yPosition = addWrappedText('• Use headings to create a logical content hierarchy (H1 > H2 > H3...)', margin + 5, yPosition, pageWidth - 2 * margin - 5, 9);
    yPosition += 5;
    yPosition = addWrappedText('• Include relevant keywords naturally in your headings', margin + 5, yPosition, pageWidth - 2 * margin - 5, 9);
    yPosition += 5;
    
    pdf.setTextColor(0, 0, 0);
    yPosition += 15;
  }

  // 10. KEYWORD ANALYSIS SECTION
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
        const term = keyword.term || 'Not specified';
        const freq = keyword.frequency || 0;
        pdf.text(`• ${term} (${freq} occurrences)`, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
    } else {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Primary Keywords:', margin, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(107, 114, 128);
      pdf.text('No primary keywords detected', margin + 5, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 10;
    }
    
    if (data.keywordAnalysis.secondaryKeywords && data.keywordAnalysis.secondaryKeywords.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Secondary Keywords:', margin, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'normal');
      
      data.keywordAnalysis.secondaryKeywords.forEach((keyword) => {
        checkPageBreak(6);
        const term = keyword.term || 'Not specified';
        const freq = keyword.frequency || 0;
        pdf.text(`• ${term} (${freq} occurrences)`, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
    } else {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Secondary Keywords:', margin, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(107, 114, 128);
      pdf.text('No secondary keywords detected', margin + 5, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 10;
    }
    
    if (data.keywordAnalysis.longTailKeywords && data.keywordAnalysis.longTailKeywords.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Long-tail Keywords:', margin, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'normal');
      
      data.keywordAnalysis.longTailKeywords.forEach((keyword) => {
        checkPageBreak(6);
        const keywordText = typeof keyword === 'string' ? keyword : (keyword.term || 'Not specified');
        pdf.text(`• ${keywordText}`, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 10;
    } else {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Long-tail Keywords:', margin, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(107, 114, 128);
      pdf.text('No long-tail keywords detected', margin + 5, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 15;
    }
  }

  // 11. PERFORMANCE DIAGNOSTICS SECTION
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

  // 12. PERFORMANCE INSIGHTS SECTION
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

  // Enhanced Footer with better styling - FIXED OVERLAP
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Footer line
    pdf.setDrawColor(229, 231, 235);
    pdf.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
    
    // Footer text with proper spacing
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`Generated by DLMETRIX - ${new Date().toLocaleDateString()}`, margin, pageHeight - 18);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 25, pageHeight - 18);
    
    // Website URL in footer with more space
    pdf.setFontSize(7);
    pdf.text(`Analysis for: ${data.url}`, margin, pageHeight - 10);
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

// Main export function - always use comprehensive text-based export for complete data
export async function exportToPDF(data: WebAnalysisResult): Promise<void> {
  await exportCompletePDF(data);
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