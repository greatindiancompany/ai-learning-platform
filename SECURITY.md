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

## Founder action: rotate the Supabase service-role key

A Supabase **service-role** key for project `ksdnbkxixbywurohugkx` was committed in operational scripts. Removing it from the current tree does not revoke it. The key remains in git history, and anyone who cloned or forked the repository can still use the old value to bypass row-level security.

The founder **must** rotate that service-role key in the Supabase dashboard for project `ksdnbkxixbywurohugkx` (Settings → API → service_role → regenerate). This repository does not contain a replacement key, and none should be invented or pasted into source files.

After rotation:

- Put the new key only in environment variables (`SUPABASE_SERVICE_ROLE_KEY`), or in an untracked `.env` file.
- Set `SUPABASE_URL` the same way. Schema scripts that open Postgres directly read `DATABASE_URL` only.
- If the Postgres password was ever set to that service-role JWT, rotate the database password as well.
- Update deployed environments with the new values. Do not commit them.

Scripts that previously embedded the key now exit immediately when those variables are unset.

## Supported Branch

Security fixes target the current default branch unless maintainers announce a separate release policy.

## Developer Guidance

- Validate and sanitize user input.
- Use server-side authorization checks for protected resources.
- Review CORS changes carefully.
- Check upload handling for file type, size, and parsing risk.
- Do not run seed or migration scripts against production without a backup and rollback plan.
