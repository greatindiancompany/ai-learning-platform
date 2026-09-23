/**
 * Sentry Edge Runtime Configuration
 * Tracks errors in Edge functions and middleware
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
