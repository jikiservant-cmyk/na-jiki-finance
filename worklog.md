---
Task ID: 2
Agent: Main Agent
Task: Restructure into separate pages + switch to Supabase

Work Log:
- Installed @supabase/supabase-js
- Created /src/lib/supabase.ts — Supabase client with isConfigured check, public + admin clients
- Created /src/lib/data.ts — Database abstraction layer that uses Supabase when configured, falls back to Prisma/SQLite for local dev
- Created /scripts/supabase-schema.sql — Full SQL migration with tables (applications, payments, payment_transactions, webhook_logs, portfolio_projects), indexes, RLS policies, triggers, and seed data
- Updated .env with Supabase config placeholders
- Updated /src/app/api/dashboard/route.ts to use data layer
- Updated /src/app/api/projects/route.ts to use data layer
- Updated /src/app/api/webhook/route.ts to use data layer
- Created separate page routes:
  - / (Home) — Hero + section index with links to all pages
  - /work — Projects page with editorial spreads and animated logos
  - /type — Type specimens page with draggable cards
  - /talks — Lectures & talks page with video players
  - /payments — Payment dashboard with revenue analytics
  - /contact — Contact form and studio info
- Updated Navigation component to use Next.js Link for page routing
- Created PageLayout shared component for consistent layout
- Removed old standalone section components
- Fixed smooth scroll Next.js warning with data-scroll-behavior attribute
- Lint passes clean
- Agent Browser verified all 6 pages load correctly, navigation works, dark theme consistent

Stage Summary:
- Full multi-page architecture: 6 routes with proper Next.js page routing
- Supabase integration with automatic fallback to Prisma/SQLite
- SQL migration script ready for Supabase deployment
- All pages verified working in browser
