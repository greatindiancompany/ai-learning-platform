# inspir AI Learning Platform

A React and Express AI study companion prototype with student tools, streaming chat, Supabase, and safety controls.

## Mission

Learning software should feel like a study partner, not a worksheet factory. This platform explores chat-first tutoring, playful tools, parent-aware flows, and safer AI support for students.

## What This Repository Contains

Full-stack prototype with a Vite/React frontend, Express backend, Supabase/Postgres data layer, Claude-powered chat and tools, content moderation, student/parent routes, memory services, SEO/blog tooling, and monitoring setup docs.

## Highlights

- AI chat interface with study tools such as quizzes, flashcards, math solving, image analysis, notes, timers, planners, and goals.
- Student login, parent routes, sessions, tracking, memory, and personalization services.
- Content moderation and age-aware safety controls.
- SEO/blog database scripts and operational setup guides.

## Tech Stack

- React 19 and Vite
- Tailwind CSS
- Node.js and Express
- Claude API
- Supabase/Postgres
- Stripe, Resend, Sentry, and monitoring setup files

## Getting Started

```bash
cd frontend && npm install
cd ../backend && npm install
npm run dev
```

## Quality Checks

```bash
cd frontend && npm run build
```

## Repository Notes

- Use frontend/.env.example and backend/.env.example as templates.
- Keep API keys, email credentials, Stripe secrets, JWT secrets, and Supabase credentials out of git.

## Contributing

Contributions are welcome. The best contributions are specific, tested, and grounded in the product mission. Good places to help include documentation, accessibility, tests, bug reports, UI polish, data validation, and safer AI behavior.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Security

Please do not open public issues for secrets, auth bypasses, data exposure, provider key leaks, or abuse vectors. Follow [SECURITY.md](SECURITY.md).

## Code of Conduct

This project follows [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Be direct, kind, and useful.

## License

MIT. See [LICENSE](LICENSE).
