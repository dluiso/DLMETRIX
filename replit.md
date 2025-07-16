# DLMETRIX

## Overview

This is a comprehensive full-stack web application for analyzing website performance, Core Web Vitals, accessibility, best practices, and SEO. The application uses Lighthouse for performance analysis, Puppeteer for screenshots, and provides detailed insights with actionable recommendations across mobile and desktop devices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **API Style**: RESTful API endpoints
- **Session Management**: In-memory storage with fallback support for database integration

### Database & ORM
- **ORM**: Drizzle with PostgreSQL dialect
- **Database**: PostgreSQL (configured via Neon Database)
- **Schema**: Centralized in `shared/schema.ts` for type safety
- **Migrations**: Managed through Drizzle Kit

## Key Components

### Frontend Components
- **Performance Overview**: Comprehensive dashboard showing all category scores
- **Core Web Vitals**: Interactive mobile/desktop metrics display with thresholds
- **Screenshots View**: Mobile and desktop page captures with device previews
- **URL Input**: Form for entering websites to analyze
- **Meta Tag Analysis**: Detailed breakdown of title, description, and meta tags
- **Social Media Previews**: Google, Facebook, and Twitter preview cards
- **Recommendations**: Actionable suggestions categorized by performance, accessibility, best practices, and SEO
- **Technical Analysis**: Analysis of robots.txt, sitemap, schema markup, and performance checks

### Backend Services
- **Lighthouse Integration**: Full performance analysis engine using Google Lighthouse
- **Puppeteer Screenshot Capture**: Mobile and desktop page screenshots
- **Core Web Vitals Measurement**: LCP, FID, CLS, FCP, TTFB metrics for both device types
- **Multi-Category Analysis**: Performance, Accessibility, Best Practices, and SEO scoring
- **Diagnostic Engine**: Detailed insights and optimization opportunities extraction
- **SEO Analysis Engine**: Traditional meta tag and HTML structure analysis

### Data Models
- **Web Analysis**: Stores comprehensive analysis results including:
  - Core Web Vitals for mobile and desktop
  - Performance, Accessibility, Best Practices, and SEO scores
  - Mobile and desktop screenshots (base64 encoded)
  - Lighthouse diagnostics and insights
  - Traditional SEO meta tag analysis
  - Categorized recommendations with fix guidelines
- **Users**: Basic user management (prepared for future authentication)

## Data Flow

1. **User Input**: User enters a URL through the frontend interface
2. **API Request**: Frontend sends POST request to `/api/web/analyze`
3. **Lighthouse Analysis**: Backend launches Puppeteer browser and runs Lighthouse for mobile and desktop
4. **Screenshot Capture**: Puppeteer captures page screenshots for both device types
5. **SEO Data Extraction**: Parallel HTML parsing with Cheerio for meta tags, Open Graph, Twitter Cards
6. **Metrics Processing**: Core Web Vitals extraction and performance score calculation
7. **Diagnostics & Insights**: Lighthouse audit results processed into actionable recommendations
8. **Storage**: Complete analysis results saved to database via Drizzle ORM
9. **Response**: Comprehensive analysis data returned to frontend
10. **Visualization**: React components render performance scores, Core Web Vitals, screenshots, and recommendations

## External Dependencies

### Core Libraries
- **lighthouse**: Google's web performance analysis engine
- **puppeteer**: Headless browser automation for screenshots and Lighthouse
- **@neondatabase/serverless**: PostgreSQL database connection
- **axios**: HTTP client for basic SEO data fetching
- **cheerio**: Server-side HTML parsing and manipulation
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/**: Comprehensive UI component primitives

### Development Tools
- **TypeScript**: Type safety across the entire stack
- **Vite**: Fast development server and build tool
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: JavaScript bundling for production

### Third-party Services
- **Neon Database**: Managed PostgreSQL hosting
- **Replit**: Development environment integration

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite development server with HMR
- **API Server**: Express server with TypeScript compilation via tsx
- **Database**: Neon Database with connection pooling

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild compiles TypeScript server to `dist/index.js`
- **Database**: Drizzle migrations ensure schema consistency
- **Static Assets**: Served directly by Express in production

### Build Commands
- `npm run dev`: Development with hot reloading
- `npm run build`: Production build for both frontend and backend
- `npm run start`: Production server
- `npm run db:push`: Apply database schema changes

## Recent Changes (January 2025)

### Advanced SEO Recommendations System with Technical File-Specific Guidance (January 16, 2025)
- **Comprehensive Technical Information**: Completely redesigned SEO recommendations to include specific files causing problems, exact code locations, and detailed technical solutions
- **Affected Files Identification**: Each recommendation now shows exactly which files need to be modified (HTML templates, CSS files, JS files, CMS settings)
- **Technical Location Precision**: Specific DOM selectors, HTML locations, and code positioning for each issue
- **Detection Method Scripts**: Actual JavaScript/DOM queries developers can use to verify issues in browser console
- **Code Examples**: Before/after code comparisons showing current problematic code and optimized solutions
- **Step-by-Step Implementation**: Detailed numbered instructions for fixing each issue
- **SEO Impact Analysis**: Clear explanation of how each issue affects search engine ranking and user experience
- **External Resources**: Curated links to Google guidelines, MDN documentation, and authoritative SEO resources
- **Testing Tools Recommendations**: Specific tools for verifying fixes (Google Search Console, WAVE, Lighthouse, etc.)
- **Enhanced Frontend Display**: Expandable recommendation cards with technical details, file locations, and implementation guidance
- **Professional Developer Experience**: Technical information organized in categorized sections with proper syntax highlighting
- **Cost Efficiency Focus**: Accurate solutions provided on first attempt with comprehensive guidance to prevent multiple iterations
- **Real-World Application**: Recommendations based on actual DOM analysis rather than generic suggestions
- **User Impact**: Developers can now identify exact problems, locate specific files, and implement precise fixes with confidence

### Enhanced Heading Structure Analysis Component (January 16, 2025)
- **Advanced Hierarchy Detection**: Completely rewrote heading analysis to detect pages that don't start with H1 as critical SEO deficiency
- **Real Order Extraction**: Updated server-side analysis to extract headings in the exact order they appear on the page, not grouped by type
- **Critical Edge Case Fix**: Now properly detects and flags websites that start with unusual heading levels (H6, H5, etc.) as major SEO issues
- **Tabbed Interface Implementation**: Added sophisticated "Current Structure" vs "Suggested Structure" tabs with visual comparison
- **Scroll Removal**: Eliminated scroll from heading tree display for better user experience and complete visibility
- **Visual Error Highlighting**: First heading that's not H1 is highlighted in red with warning icons in Current Structure tab
- **Smart Suggestions**: Suggested Structure tab shows optimized hierarchy with green highlighting for changes and arrows indicating improvements
- **Enhanced Translations**: Complete Spanish localization including new error messages and recommendations for heading structure issues
- **Dark Mode Optimization**: Full dark mode support with proper contrast and theming for all new UI elements
- **Real-time Analysis**: Server now extracts `headingStructure` array with proper order and level detection for accurate analysis
- **Complete Export Integration**: Updated both PDF and CSV exports to include comprehensive heading structure analysis
- **PDF Export Enhancement**: Added dedicated "Heading Structure Analysis" section with SEO hierarchy scoring, visual warnings for critical issues, and detailed recommendations
- **CSV Export Enhancement**: Included heading structure data with order analysis, hierarchy evaluation, and comprehensive heading information by type
- **User Impact**: Users can now see exactly how their heading structure appears to search engines and get specific visual guidance on optimal restructuring, with complete export capabilities

## Recent Changes (January 2025)

### ARM64 Server Performance Analysis Implementation Success (January 16, 2025)
- **Complete ARM64 Compatibility Achieved**: Successfully replaced Lighthouse with manual performance analysis specifically optimized for ARM64 servers
- **Core Web Vitals Working**: Real Core Web Vitals measurements (LCP, FCP, CLS, TTFB, FID) functioning perfectly on both mobile and desktop
- **Screenshot Capture Optimized**: Mobile and desktop screenshots working with ARM64-specific configurations (mobile: 375×600, desktop: 1350×940)
- **Puppeteer Direct Integration**: Bypassed Lighthouse dependency using Puppeteer directly for better ARM64 compatibility with /usr/bin/chromium-browser
- **Performance Timeouts Optimized**: Mobile (25s), Desktop (35s), and navigation timeouts specifically tuned for ARM64 server performance
- **PNG Quality Fix**: Eliminated incompatible quality parameter from PNG screenshots, ensuring clean capture without errors
- **Graceful Error Handling**: Screenshots that timeout return null without breaking the entire analysis, maintaining Core Web Vitals functionality
- **Manual Performance Measurement**: Custom performance scoring system compatible with ARM64 architecture using direct Puppeteer metrics
- **Production Deployment Success**: User confirmed complete functionality on ARM64 server with PM2 process management
- **User Impact**: Full DLMETRIX functionality restored with real performance data, screenshots, and Core Web Vitals on ARM64 servers

### Critical Production Deployment Fix (January 16, 2025)
- **Resolved Critical Rendering Issue**: Fixed production deployment where obfuscation scripts caused React to fail rendering, showing raw HTML/code instead of the interface
- **Simplified Security Approach**: Removed complex obfuscation systems that interfered with React rendering in production environments
- **Production-Safe main.tsx**: Cleaned client/src/main.tsx to contain only essential React initialization without security imports
- **HTML Script Removal**: Eliminated all inline obfuscation scripts from client/index.html that could interfere with DOM rendering
- **Dependency Conflict Resolution**: Documented solution for npm ERESOLVE conflicts using --legacy-peer-deps flag
- **ARM64 Server Architecture Support**: Identified user's server uses ARM64 architecture, created specific Chrome/Chromium installation guides for ARM64 compatibility
- **Core Web Vitals Setup**: Documented complete process for enabling Lighthouse analysis with Puppeteer on ARM64 servers using Chromium browser
- **Fallback Analysis System**: Application works perfectly with SEO analysis when browser automation unavailable, showing appropriate "Not Available" messages for Core Web Vitals and Screenshots
- **Emergency Deployment Procedures**: Created comprehensive troubleshooting guides (EMERGENCY_FIX.md, QUICK_FIX.md, UPDATE_SERVER.md, LIGHTHOUSE_FIX.md, ARM64_CHROME_INSTALL.md)
- **User Impact**: Application deploys successfully on production servers without rendering interference, maintains full functionality with SEO analysis, and can be enhanced with Core Web Vitals when browser is installed
- **Architecture Detection**: Proper handling of different server architectures (ARM64 vs x86_64) for browser installation
- **Lesson Learned**: Obfuscation systems must never interfere with core React rendering, and browser dependencies must match server architecture

### Complete Technical SEO Analysis Overhaul (January 16, 2025)
- **Real DOM Analysis Implementation**: Completely rewrote Technical SEO Analysis to extract actual data from website HTML instead of hardcoded false values
- **Comprehensive Content Analysis**: Now analyzes headings structure (H1-H6), content word count, paragraph count, and proper heading hierarchy
- **Advanced Image Analysis**: Extracts real data about images with alt text, dimensions, and responsive image techniques (srcset)
- **Link Structure Analysis**: Analyzes internal vs external links, link quality, and navigation structure
- **Technical Performance Checks**: Real analysis of inline vs external CSS/JS, minification detection, and code structure quality
- **Endpoint Verification**: Actually checks for robots.txt and sitemap.xml files existence via HTTP requests
- **Accessibility Analysis**: Form label analysis, ARIA attributes detection, skip links, and accessibility scoring
- **Security Header Detection**: Checks for Content-Security-Policy, X-Frame-Options, and other security measures
- **Performance Optimization Detection**: Identifies preload/prefetch resources and performance best practices
- **Enhanced Recommendations**: Specific, actionable recommendations based on actual findings rather than generic suggestions
- **Favicon and Meta Analysis**: Comprehensive detection of favicon, meta robots, keywords, author, and generator tags
- **User Impact**: Technical SEO Analysis now provides accurate, website-specific results instead of identical reports for all sites

### Enhanced Security & Code Protection (January 16, 2025)
- **Discrete Code Protection**: Moved security scripts to external minified files (`app.js`) to reduce source code visibility
- **Simplified Meta Tags**: Reduced verbose technology and hosting meta tags to minimal, non-revealing information
- **Clean Server Headers**: Simplified HTTP headers to show only "DLMETRIX" and "Web Server" instead of detailed fake technology stack
- **Compact Security Implementation**: Compressed security code using variable arrays and shortened function names
- **Production-Only Protection**: Security measures only activate outside development environments (localhost, replit, 127.0.0.1)
- **Non-Intrusive Approach**: Security doesn't interfere with normal development workflow or debugging
- **User Impact**: Source code appears cleaner and more professional without revealing internal security measures or hosting details

### Advanced Technology Stack & Hosting Obfuscation (January 16, 2025) - DEPRECATED
- **Technology Detection Prevention**: Comprehensive system to prevent browser addons like Wappalyzer from detecting React, Vite, TypeScript, and other frameworks
- **Hosting Environment Hiding**: Complete obfuscation of Replit hosting, development environment, and .replit.app domain references
- **Server-Side Header Obfuscation**: Custom HTTP headers (X-Powered-By: DLMETRIX Enterprise Server, X-Hosting: Private Cloud Infrastructure) replace standard technology and hosting indicators
- **Client-Side Framework Hiding**: JavaScript obfuscation removes React DevTools, Vite HMR indicators, and framework globals from window object
- **Development Environment Masking**: Removal of REPLIT_* environment variables, development server indicators, and hosting platform references
- **Domain Spoofing**: Location object manipulation to show dlmetrix.com instead of .replit.app domains
- **Source Map Removal**: Automatic deletion of .map files and source mapping references that could reveal build tools
- **Console Log Filtering**: Framework and development-related console messages filtered to prevent technology detection
- **Meta Tag Deception**: Custom generator, framework, and hosting meta tags that mislead technology scanners
- **Performance Entry Masking**: Browser performance API filtered to hide framework-related network requests
- **Build Artifact Cleanup**: Removal of data-react, data-vite, and other framework-specific DOM attributes
- **Storage Cleaning**: Automatic removal of localStorage/sessionStorage keys that contain development or hosting references
- **User Agent Obfuscation**: Browser identification modified to hide development tools and show custom DLMETRIX browser
- **Network Request Filtering**: Fetch and XMLHttpRequest overrides to hide hosting-related API calls
- **Fake Infrastructure Headers**: Server responds with "Private Cloud Infrastructure" and "Production Enterprise" instead of revealing Replit hosting
- **Anti-Detection Script**: Inline HTML script that immediately removes framework and hosting fingerprints on page load
- **User Impact**: Application appears to use proprietary "DLMETRIX Custom Framework" hosted on "Private Cloud Infrastructure" instead of revealing React/Vite/Node.js on Replit stack

### Complete Application Rebranding to DLMETRIX (January 16, 2025)
- **Application Name Change**: Changed from "Web Performance Analyzer" to "DLMETRIX" across entire application
- **Updated Components**: 
  - Main page title and navigation header (with clickable logo/title for home navigation)
  - Help dialog titles in both English and Spanish
  - Footer copyright notices and legal information (both components and main page)
  - PDF export headers and footers
  - Translation files for both languages
  - Removed subtitle from navigation bar for cleaner appearance
- **Navigation Enhancement**: Logo and title now clickable to return to homepage with hover effects
- **New Navigation Elements**:
  - "Why DLMETRIX" dialog explaining mission and purpose with full Spanish translations
  - "Contact" dialog with support email (support@dlmetrix.com) and multilingual support
  - "Enjoying DLMETRIX?" support button with PayPal donation link and language switching
- **Enhanced CSV Export System**: Complete rewrite of CSV export functionality
  - Comprehensive data coverage including all analysis sections
  - Structured format with clear section headers and detailed metrics
  - Includes Performance Overview, Core Web Vitals with thresholds, SEO metadata analysis
  - Open Graph and Twitter Cards data, Technical SEO checks, AI Search Analysis
  - Complete keyword analysis with primary/secondary keywords and missed opportunities
  - All recommendations with priority levels and detailed diagnostics
  - Professional formatting with proper escaping and UTF-8 encoding
- **Documentation Updates**: Updated replit.md project title and references
- **Advanced Security Implementation**: Comprehensive source code protection system
  - Anti-inspection measures preventing developer tools access and right-click context menu
  - Keyboard shortcut blocking (F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S)
  - DevTools detection with automatic page protection when tools are opened
  - Text selection disabled except for input fields, console clearing, and print prevention
  - Anti-debugging techniques and source code obfuscation
  - Admin override system with temporary disable functionality
- **Enhanced SEO Optimization**: Complete meta tag and structured data implementation
  - Comprehensive meta tags for search engines with targeted SEO keywords
  - Open Graph and Twitter Card optimization for social media sharing
  - Structured data (JSON-LD) for rich search results and application recognition
  - Canonical URLs, preconnect hints, and performance optimization headers
  - Security headers including X-Frame-Options, Content-Type-Options, and XSS Protection
  - Cache control headers for additional security measures
- **Mobile Menu Optimization**: Reorganized header with elegant hamburger menu for mobile devices
  - Desktop menu shows all elements with responsive hiding of text labels on smaller screens
  - Mobile menu with clear grid organization, sectioned layout with separators
  - History button only visible when there's analysis history available
  - Export options only displayed when analysis data is present
  - All essential elements always accessible in both desktop and mobile views
- **User Impact**: All user-facing text now consistently shows "DLMETRIX" branding with improved navigation, comprehensive data export options, enterprise-level security protection, and optimized mobile experience

## Previous Changes

### PDF Export Quality Enhancement (January 15, 2025)
- **Complete PDF Report Generation**: Fixed PDF export to include ALL sections of the analysis report
- **Multi-Page Layout**: Enhanced pagination with proper page breaks ensuring comprehensive coverage
- **Visual Improvements**: Added color-coded section headers, better spacing, and professional formatting
- **Fixed Data Issues**: Resolved "undefined" keywords and "[object Object]" display problems
- **Enhanced Content**: Added AI content insights, recommendations, and all diagnostic sections
- **Professional Styling**: Improved header design, footer with separator lines, and section backgrounds
- **Comprehensive Coverage**: Includes Performance Overview, Core Web Vitals, SEO Analysis, Open Graph, Twitter Cards, Technical Checks, Recommendations, AI Analysis, Keywords, Diagnostics, and Performance Insights

### Legal Notice Footer Enhancement (January 15, 2025)
- **Added Legal Notice Modal**: Integrated clickable "Legal Notice" link in footer opening modal dialog
- **Complete Legal Information**: Added Luis Mena Hernandez full legal details including address and EU VAT registration
- **Professional Presentation**: Modal includes structured sections for rights, legal address, and registration number
- **Consistent Implementation**: Updated across all pages using the centralized Footer component and homepage footer
- **Updated Legal Registration Information**: Now shows official DLMETRIX trademark and US registration details (DLM-2025-US-01783) with copyright reference (TXu 2-974-635)
- **Dual Footer Support**: Updated both general Footer component and homepage-specific footer with identical Legal Notice functionality

### SSL/HTTPS Detection Fix (January 15, 2025)
- **Fixed Critical SSL Detection Issue**: Resolved false negative SSL/HTTPS checks in Technical SEO Analysis
- **Improved Redirect Handling**: Added proper redirect following (maxRedirects: 5) in HTTP requests
- **Enhanced Final URL Detection**: Now checks the final URL after redirects for HTTPS, not just the input URL
- **Better Certificate Support**: Properly detects Let's Encrypt and other SSL certificates even when sites redirect
- **User Impact**: Technical SEO Analysis now correctly shows "Pass" for HTTPS/SSL on sites with valid certificates

### Major Architecture Expansion
- **Transformed from SEO-focused to comprehensive web performance analyzer**
- **Lighthouse Integration**: Full Google Lighthouse analysis engine implementation
- **Core Web Vitals**: Real-time measurement of LCP, FID, CLS, FCP, TTFB for mobile and desktop
- **Screenshot Capture**: Automated mobile (375×667) and desktop (1350×940) page screenshots
- **Multi-Category Scoring**: Performance, Accessibility, Best Practices, and SEO scores
- **Enhanced Recommendations**: Categorized fix guidelines with code examples

### Advanced PDF Export System (January 15, 2025)
- **Comprehensive PDF Reports**: Full multi-page exports including all analysis sections
- **Visual PDF Export**: Screenshots of web components using html2canvas for web-like appearance
- **Smart Fallback System**: Automatically switches between visual and text-based export methods
- **Complete Content Coverage**: 
  - Performance overview with generated circular progress charts
  - Complete SEO analysis with meta tags, keywords, canonical URLs
  - Social media optimization (Open Graph and Twitter Cards)
  - All recommendations with priority coding and fix instructions
  - Technical SEO checks with passed/failed summaries
  - Performance diagnostics and optimization opportunities
- **Professional Styling**: Color-coded sections, branded headers, proper pagination
- **Multi-Page Layout**: Automatic page breaks ensuring all content fits properly

### Enhanced Technical SEO Analysis
- **Expandable Fix Guides**: Failed checks show detailed step-by-step repair instructions
- **Code Examples**: Copy-paste HTML/meta tag examples for technical fixes
- **Location Guidance**: Specific instructions on where to implement each fix
- **Comprehensive Checks**: 25+ technical SEO validation points

### Database Schema Updates
- Expanded from `seoAnalyses` to `webAnalyses` table
- Added Core Web Vitals fields for mobile and desktop
- Added performance scores for all four categories
- Added screenshot storage (base64 encoded)
- Added structured diagnostics and insights storage

### Frontend Enhancements
- **Performance Overview**: Circular progress indicators for all scores
- **Core Web Vitals Component**: Tabbed mobile/desktop metrics with color-coded thresholds
- **Screenshots View**: Device-specific preview with viewport information
- **Technical SEO**: Expandable fix recommendations with detailed guidance
- **PDF Export Button**: Smart export with loading states and error handling
- **Updated Branding**: "DLMETRIX" with comprehensive analysis description

### Technical Implementation
- **Puppeteer Integration**: Browser automation for Lighthouse and screenshot capture
- **Lighthouse Configuration**: Device-specific analysis with proper throttling
- **Parallel Processing**: Simultaneous mobile/desktop analysis and screenshot capture
- **Intelligent Fallback**: SEO-focused analysis when browser automation unavailable
- **PDF Generation**: jsPDF and html2canvas integration for visual report exports
- **Error Handling**: Robust browser management and analysis failure recovery
- **Type Safety**: Updated TypeScript definitions for comprehensive analysis results

The application provides complete web performance analysis with professional PDF reporting capabilities, maintaining full functionality even when Lighthouse/Puppeteer are unavailable in restricted environments.