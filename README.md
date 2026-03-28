# ChosenInvest

AI-guided asset operating dashboard. Enter your portfolio manually, get instant allocation charts, AI-generated analysis, and financial health diagnostics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (dark theme) |
| Auth | Auth.js v5 (Google OAuth) |
| Database | Turso (libSQL) + Drizzle ORM |
| Backend DB | Supabase |
| AI | Google Gemini 1.5 + Anthropic Claude |
| Charts | Recharts |
| Market Data | Finnhub API |

----

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/jsh349/Chosen-invest-rev0.git
cd chosen-invest-rev0
npm install
```

### 2. Set up environment variables

```bash
copy .env.local.example .env.local
```

`.env.local` 에 실제 값을 입력하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# AI
GOOGLE_GENERATIVE_AI_API_KEY=...
ANTHROPIC_API_KEY=...

# Market Data
NEXT_PUBLIC_FINNHUB_API_KEY=...

# Auth.js v5
AUTH_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_URL=http://localhost:3001
AUTH_TRUST_HOST=true
NEXTAUTH_URL=http://localhost:3001

# Turso
TURSO_CONNECTION_URL=file:local.db
TURSO_AUTH_TOKEN=
```

### 3. Run

```bash
npm run dev
# → http://localhost:3001
```

---

## Project Structure

```
chosen-invest/
├── auth.ts                  # Auth.js v5 config
├── middleware.ts            # Route protection
├── drizzle.config.ts
│
├── app/
│   ├── (marketing)/         # Public pages
│   │   └── page.tsx         # Landing page
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (app)/               # Protected pages
│   │   ├── dashboard/
│   │   ├── portfolio/input/
│   │   ├── analysis/        # Stub
│   │   ├── ai/              # Stub
│   │   └── settings/        # Stub
│   └── api/auth/[...nextauth]/
│
├── components/
│   ├── layout/              # AppShell, Sidebar, Header, AuthShell
│   ├── ui/                  # Button, Card, Input, Label, Container
│   ├── dashboard/           # Overview, AllocationChart, AISummary, HealthCards
│   ├── portfolio/           # AssetRow, CategorySelect
│   ├── charts/              # AllocationChart (Recharts)
│   └── stub/                # ComingSoonPage
│
├── features/
│   ├── portfolio/           # Types, helpers, schemas
│   ├── dashboard/           # Summary builder, diagnosis logic
│   └── ai/                  # Summary generator
│
└── lib/
    ├── ai/                  # gemini.ts, anthropic.ts
    ├── db/                  # schema.ts, turso.ts (Drizzle)
    ├── market/              # finnhub.ts
    ├── supabase/            # client.ts, server.ts
    ├── types/               # asset, dashboard, health-card, user
    ├── mock/                # assets, dashboard, user
    ├── constants/           # routes, asset-categories, app-nav
    └── utils/               # cn, currency, percentage
```

---

## MVP Flow

```
/ (Landing)  →  /login  →  /portfolio/input  →  /dashboard
```

Dashboard shows:
- **Overview** — Total assets, count, top category
- **Allocation Chart** — Donut chart by category
- **AI Summary** — Gemini-generated portfolio analysis
- **Health Cards** — Diversification · Concentration · Liquidity · Growth Balance

---

## Development Phases

| Phase | Status | Description |
|---|---|---|
| 0 | ✅ | Foundation — stable shell, routing, design system |
| 1 | ✅ | Static Dashboard Shell — mock data, all cards |
| 2 | 🔜 | Data Contracts & Mock Models |
| 3 | 🔜 | Chosen AI Chat UI |
| 4 | 🔜 | Financial Analysis Engine |
| 5 | 🔜 | Real Data Integration (read-only) |
| 6–12 | 📋 | Goals, Transactions, Household, AI Orchestration, TLH, Launch |

See `plan.md` for full phase definitions.

---

## Database (Turso + Drizzle)

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate
```

Schema is defined in `lib/db/schema.ts`.

---

## Notes

- `.env.local` is gitignored — never commit real keys
- Port is **3001** (not 3000)
- All financial output is informational only — not investment advice
- Phase 1 dashboard uses mock data; real persistence comes in Phase 5
