# Contributing To inspir AI Learning Platform

Thanks for helping improve the inspir learning-platform prototype. This repo is a reference and experimentation space for AI tutoring, student workflows, parent controls, memory, SEO tooling, and operational setup.

For the production 50-tool quiz-first app, contribute to [greatindiancompany/ai-study-platform](https://github.com/greatindiancompany/ai-study-platform).

## How To Contribute Here

- Keep pull requests focused and easy to review.
- Explain what changed, why it changed, and how it was tested.
- Include screenshots or short recordings for UI changes.
- Include schema and environment notes for backend or database changes.
- Never commit secrets, production data, private user content, or local env files.

## Local Setup

Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Frontend:

```bash
cd frontend
cp .env.example .env
npm install --legacy-peer-deps
npm run dev
```

SEO site:

```bash
cd nextjs-seo
cp .env.example .env.local
npm install
npm run dev
```

## Checks

Run the checks related to your change:

```bash
cd frontend
npm run build
```

```bash
cd nextjs-seo
npm run build
```

For backend work, start the API and confirm the health endpoint:

```bash
cd backend
npm start
curl http://localhost:3000/health
```

## Pull Request Checklist

Before asking for review, confirm:

- The relevant app starts locally.
- The relevant build passes, or the failure is documented.
- UI changes include screenshots or a recording.
- API changes include request/response notes.
- Database changes include migration and rollback notes.
- New secrets or env variables are documented in the appropriate `.env.example`.

## Good Contribution Areas

- Make setup simpler and less fragile.
- Modernize dependencies carefully.
- Improve accessibility, empty states, and error states.
- Add focused tests around auth, safety, and data access.
- Consolidate migration files and document schema ownership.
- Improve security around uploads, auth, CORS, logging, and provider keys.
- Keep SEO and blog tooling understandable.

## Style And Scope

- Follow the patterns already in the relevant app.
- Prefer small changes over broad rewrites.
- Avoid new dependencies unless they clearly reduce complexity.
- Keep provider credentials server-side.
- Treat student content as private.

## Community

Be clear, kind, and specific. Good reviews make the project easier to work on, not just more correct.
