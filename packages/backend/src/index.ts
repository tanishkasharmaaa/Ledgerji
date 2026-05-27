import dotenv from 'dotenv';

// Load .env from the backend package directory (packages/backend/.env)
// This runs BEFORE any Prisma-importing modules execute
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { authRouter } from './routes/auth.routes';
import { customerRouter } from './routes/customer.routes';
import { transactionRouter } from './routes/transaction.routes';
import { reminderRouter } from './routes/reminder.routes';
import { dashboardRouter } from './routes/dashboard.routes';
import { upiRouter } from './routes/upi.routes';
import { publicRouter } from './routes/public.routes';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';

const app = express();
const PORT = process.env.PORT || 5000;

// ----- Trust Proxy (Crucial for Render Deployment) -----
// Render uses a reverse proxy. Without this, express-rate-limit will treat 
// ALL incoming traffic as originating from the same proxy IP, blocking legitimate users.
app.set('trust proxy', 1);

// ----- Security Middleware -----
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Dynamically handle multiple origins (Dev + Production Vercel URL)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Common Vite port if needed
  'https://ledgerji-frontend.vercel.app'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Error: Origin ${origin} not allowed by configurations.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
}));

// ----- Rate Limiting -----
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Skip rate limiting for the local health check endpoint
app.use((req, res, next) => {
  if (req.path === '/api/health') return next();
  limiter(req, res, next);
});

// ----- Body Parsing -----
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ----- Health Check -----
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'LedgerJi API is running', timestamp: new Date().toISOString() });
});

// ----- Routes -----
// Public routes (no auth required) — must be registered first
app.use('/api/public', publicRouter);

// Authenticated routes
app.use('/api/auth', authRouter);
app.use('/api/customers', customerRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/reminders', reminderRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/upi', upiRouter);

// ----- Error Handling -----
app.use(notFoundHandler);
app.use(errorHandler);

// ----- Start Server -----
app.listen(PORT, () => {
  console.log(`🚀 LedgerJi API running on port ${PORT}`);
  console.log(`📋 Health check available at /api/health`);
});

export default app;