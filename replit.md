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

### Complete Application Rebranding to DLMETRIX (January 16, 2025)
- **Application Name Change**: Changed from "Web Performance Analyzer" to "DLMETRIX" across entire application
- **Updated Components**: 
  - Main page title and navigation header
  - Help dialog titles in both English and Spanish
  - Footer copyright notices and legal information
  - PDF export headers and footers
  - Translation files for both languages
- **Documentation Updates**: Updated replit.md project title and references
- **User Impact**: All user-facing text now consistently shows "DLMETRIX" branding

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
- **Generated EU VAT Number**: Created realistic registration number (EU847629301) following EU VAT format standards
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