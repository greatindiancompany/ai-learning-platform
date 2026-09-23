# Security Policy

This repository includes authentication flows, student and parent routes, Supabase access, AI provider calls, payment/email integrations, uploaded content handling, and operational scripts. Treat security issues as private until a fix is ready.

## Reporting A Vulnerability

Do not open a public GitHub issue for security problems.

Use GitHub private vulnerability reporting if it is enabled for this repository, or contact the repository owner privately. Include:

- A short summary.
- Steps to reproduce.
- Affected route, page, API, package, script, or workflow.
- Expected impact.
- Screenshots or logs with secrets and private content removed.

If you are unsure whether something is security-sensitive, report it privately first.

## Report Privately

- Exposed API keys, OAuth secrets, Supabase keys, JWT secrets, payment credentials, email credentials, or deployment tokens.
- Authentication or authorization bypasses.
- Parent/student cross-account data access.
- Prompt or tool behavior that leaks private user content.
- Unsafe uploads or file processing.
- SQL injection, stored XSS, reflected XSS, CSRF, SSRF, or CORS bypasses.
- Production data leaks, database dumps, logs, or screenshots containing private content.

## Secrets And Data

- Never commit `.env` files, provider keys, database URLs, tokens, production logs, or user content.
- Keep model provider keys and Supabase service-role keys on the backend only.
- Treat every `VITE_` environment variable as public because it is bundled into the browser.
- Avoid logging prompts, uploaded files, student messages, tokens, or personally identifying data.
- Rotate any credential that may have been exposed.

## Supported Branch

Security fixes target the current default branch unless maintainers announce a separate release policy.

## Developer Guidance

- Validate and sanitize user input.
- Use server-side authorization checks for protected resources.
- Review CORS changes carefully.
- Check upload handling for file type, size, and parsing risk.
- Do not run seed or migration scripts against production without a backup and rollback plan.
- Chat reads and writes are scoped to the signed-in account, or to an HttpOnly cookie for anonymous study sessions. Conversation ids are not enough.
- Browser origins come from `CORS_ORIGIN`. Production startup refuses a placeholder `JWT_SECRET`.
- `database/migrations/20260923_tighten_chat_rls.sql` removes public chat policies. The founder applies it in Supabase. The service role still bypasses RLS.

## Founder rotation

The historical Supabase project `ksdnbkxixbywurohugkx` had a service-role key in git history. Regenerating that key in the Supabase dashboard is still required. Put the new value only in the environment. Do not paste it into the repo, a pull request, or a chat. If the database password was ever set to that key, rotate the database password too.
