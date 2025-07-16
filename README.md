# DLMETRIX - Free SEO Analysis Tool

A comprehensive web performance and SEO analysis platform that provides Core Web Vitals assessment, performance diagnostics, accessibility analysis, and best practices evaluation.

## Features

- **Core Web Vitals Analysis**: Real-time measurement of LCP, FID, CLS, FCP, TTFB for mobile and desktop
- **Performance Audits**: Complete Lighthouse-based analysis with actionable recommendations
- **SEO Analysis**: Technical SEO checks, meta tag analysis, and optimization suggestions
- **AI-Powered Insights**: Content analysis and optimization recommendations
- **Screenshot Capture**: Mobile and desktop page previews
- **PDF Export**: Comprehensive reports with visual charts and detailed analysis
- **Multilingual Support**: English and Spanish interface
- **Mobile Optimized**: Responsive design with mobile-first approach

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd DLMETRIX
```

2. Install dependencies:
```bash
npm install
```

3. Build the application:
```bash
npm run build
```

4. Start the production server:
```bash
npm start
```

## Development

For development mode:
```bash
npm run dev
```

This starts both the frontend (Vite) and backend (Express) servers.

## Security Notes

- The application includes advanced technology obfuscation to prevent framework detection
- Security measures are automatically enabled in production builds
- Development environment bypasses security features for easier debugging

## Deployment

1. Ensure all dependencies are installed
2. Run `npm run build` to create production builds
3. Start with `npm start` or deploy the `dist` folder to your server
4. The application serves both frontend and API from the same Express server

## Environment Variables

- `NODE_ENV`: Set to 'production' for production builds
- `DATABASE_URL`: PostgreSQL connection string (optional)
- `PORT`: Server port (defaults to 5000)

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Analysis**: Google Lighthouse, Puppeteer
- **Database**: PostgreSQL with Drizzle ORM
- **PDF Generation**: jsPDF with html2canvas

## Browser Compatibility

- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

Copyright © 2025 DLMETRIX. All rights reserved.
Created by Luis Mena Hernandez.

## Support

For support and questions, contact: support@dlmetrix.com

## Legal Notice

App Registration No. DLM-2025-US-01783
Creator: Luis Mena Hernandez
Address: 461 N Lake Aurora Illinois 60506