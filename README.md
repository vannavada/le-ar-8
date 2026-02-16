# Multi-Platform Content & Analytics Hub

## 🚀 Overview

A highly scalable, low-latency content platform with integrated financial tools, supporting web, iOS, and Android. Built with enterprise-grade architecture for sub-second response times and seamless scaling from dozens to millions of users.

## 📱 Platform Sections

### 1. **TechVault** - Product Reviews & Showcases
Curated reviews and insights on:
- Technology products and gadgets
- Men's lifestyle products
- Automotive excellence
- Innovation showcases

### 2. **ThoughtForge** - Professional Discourse
Medium-style platform for:
- Workplace experiences and insights
- Technology industry analysis
- Arguments for/against industry practices
- Professional development discussions
- Technical deep-dives

### 3. **MindStream** - Personal Expressions
Quick thoughts and expansive articles:
- One-liners that spark conversations
- Personal opinions on any topic
- Silly to serious content spectrum
- Threading and discussion capabilities

### 4. **FinanceHub** - Financial Tools & Dashboards
Comprehensive financial management suite:

#### Investment Tracking
- **Stock Portfolio**: Real-time monitoring, P&L tracking
- **Crypto Tracker**: Multi-currency portfolio
- **Investment Calculator**: ROI, compound interest, retirement planning

#### Expense Management
- **Expense Tracker**: Categorized spending
- **Budget Planner**: Monthly/annual budgets
- **Bill Reminders**: Recurring payment alerts
- **Receipt Scanner**: OCR for expense capture

#### Financial Planning
- **Net Worth Tracker**: Assets vs liabilities
- **Tax Calculator**: Estimate federal/state taxes
- **Financial Goals**: Track savings objectives
- **Debt Payoff Calculator**: Loan amortization

#### Price & Deal Monitoring
- **Product Price Tracker**: Monitor items across retailers
- **Price Alerts**: Notifications on price drops
- **Historical Pricing**: Track price trends

#### Secure Vault
- **Encrypted Storage**: Bank accounts, cards, credentials
- **Document Storage**: Financial documents, statements
- **Plaid Integration**: Bank account connections (US)
- **Manual Entry**: International account support

#### Dashboards & Analytics
- **Overview Dashboard**: Complete financial snapshot
- **Spending Analysis**: Category breakdowns, trends
- **Investment Performance**: Returns, allocations
- **Custom Reports**: Export to PDF/Excel
- **Data Visualization**: Interactive charts and graphs

### 5. **LearnHub** - Educational Platform
Multi-subject learning:
- Course creation and management
- Video content hosting
- Progress tracking
- Quizzes and assessments
- Certificates of completion

### 6. **CommunitySpace** - Social Platform
Topic-based discussions:
- Technology discussions
- Engineering best practices
- Humor and entertainment
- Real-time chat
- User profiles and following

## 🏗️ Architecture

### Tech Stack

**Frontend (Web)**
- Next.js 14 (App Router) with React 18
- TypeScript for type safety
- TailwindCSS + Framer Motion
- tRPC for type-safe APIs
- React Query for state management

**Mobile Apps**
- React Native (Expo SDK 50+)
- Shared business logic
- Native performance
- iOS & Android support

**Backend**
- Node.js 20+ with Express
- tRPC + REST APIs
- GraphQL for complex queries
- WebSocket for real-time

**Database & Cache**
- PostgreSQL 16
- Prisma ORM
- Redis 7
- Elasticsearch (optional)

**Infrastructure**
- Docker containers
- Kubernetes orchestration
- Nginx load balancing
- CDN (Cloudflare/Vercel)
- Auto-scaling (3-10 replicas)

## ⚡ Performance

- **p50 Response**: < 100ms
- **p95 Response**: < 300ms
- **Database Queries**: < 50ms
- **Cache Hit Rate**: > 80%
- **Uptime SLA**: 99.9%
- **Lighthouse Score**: 95+

## 🔐 Security & Access

- **Granular Permissions**: Section/subsection level
- **Authentication**: JWT + API keys
- **Authorization**: RBAC with subscription tiers
- **Rate Limiting**: Per endpoint and user
- **Data Encryption**: At rest and in transit
- **Plaid Security**: Bank-grade encryption for financial data

## 💰 Monetization

### Subscription Tiers
1. **Free**: Limited access, ads
2. **Basic ($9/mo)**: Ad-free, full content
3. **Pro ($29/mo)**: All features + API access
4. **Enterprise (Custom)**: Unlimited, white-label

### Revenue Streams
- Subscription fees
- API monetization
- Premium content
- Affiliate commissions

## How to run it

**Prerequisites**

- **Node.js 18 or newer** – Required. Check with `node -v`. If you see Turbo errors like `SyntaxError: Unexpected token .`, upgrade Node (e.g. [nvm](https://github.com/nvm-sh/nvm): `nvm install 18` then `nvm use 18`).
- **Postgres** – Either **Docker** (e.g. [Docker Desktop](https://www.docker.com/products/docker-desktop/)) so you can run `docker compose up -d`, or install Postgres locally (e.g. [Postgres.app](https://postgresapp.com/) on Mac), or use a free hosted DB (e.g. [Neon](https://neon.tech)) and put its URL in `DATABASE_URL`.

You don’t need a cloud database for local development if you use Docker or a local Postgres install. For production (e.g. when you deploy and use a Squarespace domain), use a managed database from Google Cloud, AWS, or another provider.

### 1. Env

```bash
cp .env.example .env
```

Edit `.env` and set at least:

- **DATABASE_URL** – For local Docker use:  
  `postgresql://admin:devpassword@localhost:5432/content_platform`
- **NEXTAUTH_SECRET** – Required for auth. Generate one:
  ```bash
  ./scripts/generate-secrets.sh
  ```
  Copy the `NEXTAUTH_SECRET` line into `.env`.

Optional for Google sign-in:

- **GOOGLE_CLIENT_ID** / **GOOGLE_CLIENT_SECRET** – From [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web application). Set authorized redirect URI to `http://localhost:3000/api/auth/callback/google`.

### 2. Database (local)

**Option A – Docker (recommended)**  
Install [Docker Desktop](https://www.docker.com/products/docker-desktop/), then:

```bash
docker compose up -d
```

**Option B – No Docker**  
Install [Postgres](https://www.postgresql.org/download/) (or use [Postgres.app](https://postgresapp.com/) on Mac). Create a database named `content_platform` and set `DATABASE_URL` in `.env` to your connection string (e.g. `postgresql://localhost:5432/content_platform` with your username).  
Or use a free hosted Postgres (e.g. [Neon](https://neon.tech)) and paste the connection string into `DATABASE_URL`.

**Then** from the repo root:

```bash
npm run db:generate --workspace=@content-platform/database
npm run db:push --workspace=@content-platform/database
npm run db:seed --workspace=@content-platform/database
```

That creates the DB, applies the schema, and seeds a demo user. No separate database install or cloud account is required for local run.

### 3. Install and run the app

From the repo root:

```bash
npm install
npm run dev:web
```

If `npm run dev:web` fails (e.g. “workspace not found” or Turbo errors), run the web app directly:

```bash
cd apps/web && npm install && npm run dev
```

To run db commands without the root workspace: `cd packages/database && npm install && npm run db:generate && npm run db:push && npm run db:seed`

### 4. Use the app

- Open **http://localhost:3000**
- Go to **TechVault** → sign in (e.g. Google) → **New review** to create a review.

The standalone API (`npm run dev:api`) is optional; the web app uses the tRPC route inside Next.js, so only the web app and DB need to be running.

### Access points (local)

| What        | URL |
|------------|-----|
| Web app    | http://localhost:3000 |
| TechVault  | http://localhost:3000/tech-vault |
| Sign in    | http://localhost:3000/api/auth/signin |
| Standalone API (optional) | http://localhost:4000 (run `npm run dev:api`) |

---

### Production / deployment (e.g. Squarespace domain)

When you deploy (e.g. Next.js on Vercel and your domain on Squarespace), **don’t use the local Docker Postgres**. Use a hosted database and point the app at it with `DATABASE_URL`.

**Hosted Postgres options:**

- **Google Cloud:** [Cloud SQL for PostgreSQL](https://cloud.google.com/sql/postgresql) – create an instance, then use the connection name or public IP in `DATABASE_URL`.
- **AWS:** [RDS for PostgreSQL](https://aws.amazon.com/rds/postgresql/) – create a DB instance, then set `DATABASE_URL` to the provided endpoint.
- **Other options:** [Neon](https://neon.tech), [Supabase](https://supabase.com), [Vercel Postgres](https://vercel.com/storage/postgres) – all work with Prisma; use the connection string they give you as `DATABASE_URL`.

In production, set `NEXTAUTH_URL` to your real URL (e.g. `https://www.yourdomain.com`) and use strong, unique values for `NEXTAUTH_SECRET` and `JWT_SECRET`.

## 🛠️ Development

```bash
# Install dependencies
npm install

# Database (after docker compose up -d)
npm run db:generate --workspace=@content-platform/database
npm run db:push --workspace=@content-platform/database   # or db:migrate for production
npm run db:seed --workspace=@content-platform/database

# Development
npm run dev              # All services (web + API)
npm run dev:web          # Web only (tRPC inside Next.js)

# Testing
npm test                 # Unit tests
npm run test:e2e         # E2E tests

# Building
npm run build            # Production build
```

## 📚 Documentation

- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Architecture Overview](docs/architecture.md)
- [Contributing Guide](CONTRIBUTING.md)

## 📄 License

MIT License - See [LICENSE](LICENSE) file

## 🆘 Support

- **Issues**: GitHub Issues
- **Email**: support@yourplatform.com
- **Discord**: discord.gg/yourplatform

---

**Built for performance. Designed for scale. Ready for production.**
