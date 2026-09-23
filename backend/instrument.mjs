/**
 * Sentry Instrumentation for Express Backend (ESM)
 * This file MUST be imported first in server.js
 */

import * as Sentry from "@sentry/node";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
    sendDefaultPii: false,
    environment: process.env.NODE_ENV || "development",
  });
}

export default Sentry;
