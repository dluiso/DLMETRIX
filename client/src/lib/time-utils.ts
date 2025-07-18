/**
 * Unified time formatting utility for DLMETRIX
 * Handles consistent time display across Core Web Vitals and Waterfall Analysis
 */

export interface TimeFormatOptions {
  addSlowLoadClass?: boolean;
  precision?: number;
}

/**
 * Format time value according to DLMETRIX specifications:
 * - < 1000ms → show as "ms"
 * - >= 1000ms → convert to seconds with 1 decimal
 * - >= 10000ms → add slow-load class for visual alert
 */
export function formatTime(
  value: number | null, 
  options: TimeFormatOptions = {}
): { 
  formatted: string; 
  cssClass?: string;
  rawValue: number | null;
} {
  const { addSlowLoadClass = true, precision = 1 } = options;

  // Handle null or invalid values
  if (value === null || !Number.isFinite(value) || value < 0) {
    return {
      formatted: 'N/A',
      rawValue: null
    };
  }

  // Very small values
  if (value < 1) {
    return {
      formatted: '0ms',
      rawValue: value
    };
  }

  // Less than 1 second: show in milliseconds
  if (value < 1000) {
    return {
      formatted: `${Math.round(value)}ms`,
      rawValue: value
    };
  }

  // 1 second or more: convert to seconds
  const seconds = value / 1000;
  const formattedSeconds = seconds.toFixed(precision);
  
  const result = {
    formatted: `${formattedSeconds}s`,
    rawValue: value
  };

  // Add slow-load class for values >= 10 seconds (10000ms)
  if (addSlowLoadClass && value >= 10000) {
    result.cssClass = 'slow-load';
  }

  return result;
}

/**
 * Format time for display with optional slow-load styling
 */
export function formatTimeWithClass(value: number | null): string {
  const { formatted, cssClass } = formatTime(value);
  
  if (cssClass) {
    return `<span class="${cssClass}">${formatted}</span>`;
  }
  
  return formatted;
}

/**
 * Format time for timeline scales (simplified version)
 */
export function formatTimeScale(value: number | null): string {
  const { formatted } = formatTime(value, { addSlowLoadClass: false });
  return formatted;
}

/**
 * Get CSS class for slow loading times
 */
export function getTimeClass(value: number | null): string {
  if (value === null || !Number.isFinite(value) || value < 10000) {
    return '';
  }
  return 'slow-load';
}

/**
 * Check if a time value is considered slow (>= 10 seconds)
 */
export function isSlowTime(value: number | null): boolean {
  return value !== null && Number.isFinite(value) && value >= 10000;
}