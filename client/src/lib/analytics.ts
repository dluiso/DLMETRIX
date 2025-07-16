// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics - simplified since it's already in HTML
export const initGA = () => {
  // Check if gtag is already loaded from HTML
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('Google Analytics initialized from HTML');
    return;
  }
  
  // Fallback initialization if needed
  const measurementId = 'G-EQ2SPJYM5Y';
  
  if (typeof window !== 'undefined' && !window.gtag) {
    // Wait for script to load
    const checkGtag = setInterval(() => {
      if (window.gtag) {
        clearInterval(checkGtag);
        console.log('Google Analytics loaded');
      }
    }, 100);
    
    // Clear interval after 5 seconds
    setTimeout(() => clearInterval(checkGtag), 5000);
  }
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = 'G-EQ2SPJYM5Y';
  
  window.gtag('config', measurementId, {
    page_path: url
  });
};

// Track events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};