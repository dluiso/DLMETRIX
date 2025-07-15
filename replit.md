# SEO Tag Analyzer

## Overview

This is a full-stack web application for analyzing SEO meta tags and providing recommendations. The application scrapes websites, extracts meta tags, evaluates SEO performance, and provides detailed analysis with social media previews and actionable recommendations.

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
- **URL Input**: Form for entering websites to analyze
- **SEO Score**: Visual dashboard showing overall SEO performance
- **Meta Tag Analysis**: Detailed breakdown of title, description, and meta tags
- **Social Media Previews**: Google, Facebook, and Twitter preview cards
- **Recommendations**: Actionable suggestions for SEO improvements
- **Technical SEO**: Analysis of robots.txt, sitemap, schema markup

### Backend Services
- **SEO Analysis Engine**: Web scraping with Cheerio for HTML parsing
- **Meta Tag Extraction**: Comprehensive extraction of standard and social meta tags
- **Scoring Algorithm**: Calculates SEO scores based on best practices
- **Recommendation Engine**: Generates prioritized improvement suggestions

### Data Models
- **SEO Analysis**: Stores complete analysis results including scores and recommendations
- **Users**: Basic user management (prepared for future authentication)

## Data Flow

1. **User Input**: User enters a URL through the frontend interface
2. **API Request**: Frontend sends POST request to `/api/seo/analyze`
3. **Web Scraping**: Backend fetches website content using Axios
4. **HTML Parsing**: Cheerio extracts meta tags, Open Graph, Twitter Cards
5. **Analysis**: Backend evaluates SEO elements and calculates scores
6. **Storage**: Results saved to database via Drizzle ORM
7. **Response**: Structured analysis data returned to frontend
8. **Visualization**: React components render analysis results and recommendations

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database connection
- **axios**: HTTP client for web scraping
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

The application uses a monorepo structure with shared TypeScript definitions, enabling type safety between frontend and backend while maintaining clear separation of concerns.