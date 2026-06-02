# inspir AI Learning Platform

This repository is the chat-first inspir learning-platform prototype: a React and Express app with AI tutoring flows, student and parent routes, memory services, Supabase persistence, SEO tooling, and operational setup notes.

The production quiz-first product with 50 live study tools now lives in [greatindiancompany/ai-study-platform](https://github.com/greatindiancompany/ai-study-platform). Keep this repository for the broader learning-platform prototype, auth experiments, memory work, SEO/blog scripts, monitoring guides, and reference implementations.

## What This Repository Contains

- `frontend/`: Vite and React student app with login, chat, study tools, safety UI, and parent-facing components.
- `backend/`: Express API with auth, student, parent, chat, tracking, billing, tools, sessions, and memory-related services.
- `nextjs-seo/`: Next.js SEO/blog site with structured data, blog pages, tool pages, and metadata helpers.
- `scripts/`: Blog generation, metadata population, SEO seeding, and database utility scripts.
- `*.sql`: Supabase/Postgres schema, seed, migration, and verification scripts.
- `*_GUIDE.md` and `*_SUMMARY.md`: Setup, monitoring, OAuth, Sentry, SEO, database, memory, and implementation notes.

## Product Direction

This repo explores how an AI learning companion can support a student beyond a single tool:

- Chat-first tutoring and study assistance.
- Age-aware safety controls and content moderation.
- Student accounts, parent controls, sessions, tracking, and memory.
- Study tools for quizzes, flashcards, math help, image analysis, notes, timers, planners, and goals.
- SEO and blog content systems for discoverability.

If you are looking for the consolidated 50-tool production app, use `ai-study-platform`.

## Tech Stack

- Frontend: React 19, Vite, Tailwind CSS, Framer Motion, React Router.
- Backend: Node.js, Express, Supabase, Anthropic Claude, JWT auth.
- SEO app: Next.js 15, TypeScript, Tailwind CSS, structured data, sitemap and robots support.
- Integrations and operations: Stripe, Resend, Sentry, UptimeRobot, OAuth setup docs, Supabase/Postgres.

## Local Development

Use Node.js 20 or newer. The frontend currently has a peer-dependency mismatch between React 19 and an older icon package, so use the legacy peer-dependency install mode unless the dependency set is updated.

### Backend API

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Expected local API: `http://localhost:3000`

Required backend environment values:

```bash
PORT=3000
NODE_ENV=development
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=a-long-random-secret
```

### Frontend App

```bash
cd frontend
cp .env.example .env
npm install --legacy-peer-deps
npm run dev
```

Expected local UI: `http://localhost:5173`

Set `frontend/.env`:

```bash
VITE_API_URL=http://localhost:3000/api
```

### SEO Site

```bash
cd nextjs-seo
cp .env.example .env.local
npm install
npm run dev
```

Expected local SEO site: `http://localhost:3001`

## Build And Checks

Frontend build:

```bash
cd frontend
npm run build
```

SEO build:

```bash
cd nextjs-seo
npm run build
```

Backend smoke check:

```bash
cd backend
npm start
curl http://localhost:3000/health
```

Run the database verification scripts only against the intended Supabase project.

## Database Notes

The repository includes multiple schema and migration files because it captures several phases of the platform:

- `database-schema.sql`
- `auth-schema.sql`
- `database-seo-schema.sql`
- `backend/database/migrations/003_memory_system.sql`
- `backend/database/migrations/004_add_student_personalization.sql`
- `backend/database/tools-schema.sql`

Before applying SQL, read the relevant guide and confirm the target Supabase project. Do not run seed scripts against production without a backup and a rollback plan.

## Contribution Areas

Useful contributions include:

- Documentation cleanup and setup simplification.
- Frontend dependency modernization.
- Accessibility and keyboard navigation improvements.
- Safer AI prompts, clearer refusals, and better error states.
- Backend validation, tests, and route hardening.
- Database migration consolidation.
- SEO/blog tooling cleanup.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Security

Do not commit provider keys, Supabase credentials, JWT secrets, OAuth credentials, payment secrets, email credentials, production logs, or user content. Report vulnerabilities privately. See [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
