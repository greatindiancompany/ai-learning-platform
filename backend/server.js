import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pathToFileURL } from 'node:url';
import chatRoutes from './routes/chat.js';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import parentRoutes from './routes/parent.js';
import { isOriginAllowed, parseAllowedOrigins } from './utils/corsOrigins.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const trustProxy = process.env.TRUST_PROXY_HOPS ?? '1';
app.set('trust proxy', trustProxy === 'false' ? false : Number(trustProxy));

app.use((req, res, next) => {
  console.log(`\n📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log(`   Origin: ${req.headers.origin || 'none'}`);
  next();
});

app.use(cors({
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, origin || true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'inspir API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/chat', chatRoutes);

app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (res.headersSent) {
    next(err);
    return;
  }
  const status = Number(err.status || err.statusCode) || 500;
  const safeStatus = status >= 400 && status < 600 ? status : 500;
  res.status(safeStatus).json({
    error: safeStatus === 400 ? 'Bad request' : 'Something went wrong!'
  });
});

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  app.listen(PORT, '0.0.0.0', () => {
    const origins = parseAllowedOrigins();
    console.log(`\n${'='.repeat(50)}`);
    console.log(`inspir API running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`CORS allowlist: ${origins.length ? origins.join(', ') : '(browser origins denied until CORS_ORIGIN is set)'}`);
    console.log(`${'='.repeat(50)}\n`);
  });
}

export default app;
