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

// ----- Security Middleware -----
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

// ----- Rate Limiting -----
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(limiter);

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
// Note: authLimiter is applied only to sensitive routes (login/register/google)
// inside auth.routes.ts — not globally, so GET /me and POST /refresh are not throttled
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
  console.log(`🚀 LedgerJi API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});

export default app;