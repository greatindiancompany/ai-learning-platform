/**
 * Sentry Server-Side Configuration
 * Tracks errors in Next.js server components and API routes
 */

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
    sendDefaultPii: false,
  })
}
