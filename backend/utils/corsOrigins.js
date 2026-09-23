const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3001',
  'http://127.0.0.1:3001'
];

export function parseAllowedOrigins(env = process.env) {
  const listed = String(env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (listed.length > 0) return listed;
  if (env.NODE_ENV === 'production') return [];
  return DEV_ORIGINS;
}

export function isOriginAllowed(origin, env = process.env) {
  if (!origin) return true;
  return parseAllowedOrigins(env).includes(origin);
}
