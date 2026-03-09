# DLMETRIX — Professional Web Audit Platform

> Analyze any website for performance, SEO, accessibility, security, and content quality.
> Get real-time scores, actionable diagnostics, and beautiful PDF reports.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://postgresql.org)

---

## What is DLMETRIX?

DLMETRIX is a **self-hosted SaaS platform** that performs comprehensive audits of any public URL. It combines Google Lighthouse analysis with seven custom analyzers to produce a single weighted score and detailed breakdown:

| Category | What it checks |
|---|---|
| **Performance** | Core Web Vitals (LCP, FID, CLS, FCP, TTFB, TTI), load time, resource sizes |
| **SEO** | Title, meta description, headings, canonical, structured data, robots.txt |
| **Accessibility** | ARIA attributes, alt text, color contrast, keyboard navigation, language |
| **Security** | HTTPS, security headers, mixed content, HSTS, CSP, X-Frame-Options |
| **Content** | Word count, readability, keyword density, duplicate content signals |
| **Metadata** | Open Graph, Twitter Cards, favicon, viewport, charset |
| **Links** | Internal/external links, broken links, redirect chains, anchor text |

### Key Features

- **Real-time progress** — WebSocket-powered live status during analysis (crawling → lighthouse → SEO → …)
- **Multi-user SaaS** — Public (guest), PRO, PREMIUM, and Admin roles with daily audit limits
- **Audit history** — Full searchable history with filters, audit-to-audit comparison, and CSV export
- **PDF reports** — One-click export of any audit to a full PDF report
- **Subscription billing** — PayPal integration with monthly and yearly billing cycles, cancel any time
- **Email flows** — Email verification, forgot password, and reset password via SMTP
- **Admin panel** — User management, audit logs, plan editor, revenue and activity charts
- **Internationalization** — English (root `/`) and Spanish (`/es/`) out of the box; easily extendable
- **Installation wizard** — First-launch web UI at `/setup` validates connections and creates the admin account

---

## Tech Stack

```
Frontend              Backend                 Infrastructure
────────────────      ─────────────────────   ──────────────────────
Next.js 14            NestJS 10               PostgreSQL 15
TypeScript            TypeScript              Redis 7
Tailwind CSS          Prisma ORM              Nginx (reverse proxy)
shadcn/ui             BullMQ (queues)         PM2 (process manager)
Recharts              Socket.io               Certbot / Let's Encrypt
Zustand               Lighthouse CLI          Ubuntu 24.04 LTS
next-intl             Puppeteer
                      Nodemailer (SMTP)
                      PayPal REST SDK
```

---

## Project Structure

```
dlmetrix/
├── apps/
│   ├── api/                  # NestJS backend (port 3001)
│   │   ├── src/
│   │   │   ├── auth/         # JWT auth, refresh tokens, email verify, password reset
│   │   │   ├── users/        # User CRUD, stats, profile
│   │   │   ├── audits/       # Audit history, rate limiting, CSV export
│   │   │   ├── audit-engine/ # Lighthouse + 7 custom analyzers, PDF export
│   │   │   ├── payments/     # PayPal integration, subscription management
│   │   │   ├── plans/        # Plan definitions
│   │   │   ├── admin/        # Admin-only endpoints, charts, user management
│   │   │   ├── system/       # Health check, cron jobs (subscription expiry)
│   │   │   ├── setup/        # Installation wizard endpoints
│   │   │   ├── mail/         # SMTP email service
│   │   │   ├── websockets/   # Socket.io audit progress gateway
│   │   │   └── prisma/       # Database client
│   │   └── prisma/
│   │       └── schema.prisma # Full database schema
│   └── web/                  # Next.js 14 frontend (port 3000)
│       └── src/
│           ├── app/[locale]/ # App Router pages (EN root, /es/ Spanish)
│           ├── components/   # UI components (audit results, charts, layout)
│           ├── store/        # Zustand state (auth, theme)
│           └── lib/          # API client, utilities
├── packages/
│   └── shared/               # Shared TypeScript types and score utilities
├── docker-compose.yml        # Local dev: PostgreSQL + Redis
├── turbo.json                # Turborepo build pipeline
└── package.json              # pnpm workspace root
```

---

## Quick Start (Local Development)

### Prerequisites

- **Node.js 20+** (`node -v`)
- **pnpm 9+** (`npm install -g pnpm`)
- **Docker & Docker Compose** (for Postgres + Redis)

### 1. Clone and install

```bash
git clone https://github.com/dluiso/DLMETRIX.git
cd DLMETRIX
pnpm install
```

### 2. Start infrastructure

```bash
docker-compose up -d
```

Starts PostgreSQL on `localhost:5432` and Redis on `localhost:6379`.

### 3. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Open `apps/api/.env` and set **at minimum**:
```env
JWT_SECRET=some_random_32_char_string_here
JWT_REFRESH_SECRET=another_random_32_char_string
```

All other defaults work for local development.

### 4. Run database migrations

```bash
cd apps/api
pnpm prisma migrate deploy
pnpm prisma db seed      # seeds default subscription plans
cd ../..
```

### 5. Start the application

```bash
pnpm dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api/v1 |
| Swagger docs | http://localhost:3001/api/docs |

### 6. Run the setup wizard

Open **http://localhost:3000/setup** and follow three steps:

1. **Database** — verify PostgreSQL connection
2. **Cache** — verify Redis connection
3. **Admin account** — create the first administrator

After completing setup, the `/setup` route is **permanently disabled** for security.

---

## Environment Variables Reference

### `apps/api/.env`

```env
# ── App ───────────────────────────────────────────────────────────────────────
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://dlmetrix.com

# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://dlmetrix:yourpassword@localhost:5432/dlmetrix

# ── Redis ─────────────────────────────────────────────────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=your_redis_password

# ── JWT (generate: openssl rand -hex 32) ──────────────────────────────────────
JWT_SECRET=your_very_long_random_secret_min_32_chars
JWT_REFRESH_SECRET=another_very_long_random_secret_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── Email (SMTP) ──────────────────────────────────────────────────────────────
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your@gmail.com
MAIL_PASS=your_gmail_app_password
MAIL_FROM=noreply@dlmetrix.com

# ── PayPal ────────────────────────────────────────────────────────────────────
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=live    # or sandbox

# ── Chromium (Linux VPS — see DEPLOYMENT.md) ──────────────────────────────────
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
PUPPETEER_HEADLESS=true
```

### `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=https://dlmetrix.com/api/v1
NEXT_PUBLIC_APP_URL=https://dlmetrix.com
NEXT_PUBLIC_WS_URL=https://dlmetrix.com
```

---

## User Roles & Limits

| Role | Daily Audits | History | PDF | Comparison | Billing |
|---|---|---|---|---|---|
| **PUBLIC** (guest) | 10 / IP | ✗ | ✗ | ✗ | — |
| **PRO** | 50 | ✓ | ✓ | ✓ | Monthly / Yearly |
| **PREMIUM** | Unlimited | ✓ | ✓ | ✓ | Monthly / Yearly |
| **ADMIN** | Unlimited | ✓ | ✓ | ✓ | — |

---

## API Overview

All endpoints are prefixed `/api/v1`.

| Group | Key Endpoints |
|---|---|
| **Auth** | `POST /auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email` |
| **Users** | `GET /users/me`, `PATCH /users/me`, `GET /users/me/stats` |
| **Audits** | `POST /audits`, `GET /audits/history`, `GET /audits/history/export` (CSV), `GET /audits/:id` |
| **Reports** | `GET /reports/:id/pdf` |
| **Plans** | `GET /plans` |
| **Payments** | `POST /payments/create-order`, `/payments/capture`, `/payments/cancel` |
| **Admin** | `GET /admin/users`, `/admin/stats`, `/admin/charts`, `/admin/audits`, `/admin/logs` |
| **System** | `GET /system/health`, `/system/config` |
| **Setup** | `GET /setup/status`, `POST /setup/check-db`, `/setup/check-redis`, `/setup/complete` |

Full interactive docs available at `/api/docs` (Swagger, development only).

---

## Scheduled Jobs

| Job | Schedule | Action |
|---|---|---|
| Subscription expiry | Every day at 02:00 UTC | Marks ACTIVE/TRIALING subscriptions past their end date as EXPIRED; downgrades user role to PUBLIC |
| Pending cancellations | Every day at 08:00 UTC | Finalizes subscriptions with `cancelAtPeriodEnd=true`, marks as CANCELLED |

---

## Available Scripts

```bash
# From project root
pnpm dev              # Run all apps in development mode (turbo)
pnpm build            # Build all apps for production
pnpm lint             # Lint all workspaces

# Database (from apps/api/)
pnpm prisma migrate deploy    # Apply pending migrations
pnpm prisma migrate dev       # Create new migration (dev only)
pnpm prisma db seed           # Seed default data (plans)
pnpm prisma studio            # Open visual DB browser
```

---

## Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the complete step-by-step guide to deploy DLMETRIX on a VPS running Ubuntu 24.04 with Nginx, PM2, PostgreSQL, Redis, and SSL via Let's Encrypt.

---

## Payment Gateway Extension

PayPal is the primary gateway. To add Stripe or any other provider:

1. Create a class implementing the `PaymentGateway` interface in `apps/api/src/payments/gateways/`
2. Register it in `PaymentsModule`
3. Update the `payments.service.ts` factory to select the correct gateway

---

## License

MIT © 2024 DLMETRIX
