import { Router, Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import { AuthService } from '../services/auth.service';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, updateProfileSchema } from '../lib/validators';
import { AppError } from '../middleware/error.middleware';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Auth-specific rate limiter — only on sensitive mutations (login/register/google)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

// ---- Register ----
router.post('/register', authLimiter, validate(registerSchema), asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);
  console.log(result)

  res.cookie('accessToken', result.accessToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: 15 * 60 * 1000, path: '/',
  });
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth',
  });

  res.status(201).json({ success: true, user: result.user, accessToken: result.accessToken });
}));

// ---- Login ----
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);

  res.cookie('accessToken', result.accessToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: 15 * 60 * 1000, path: '/',
  });
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth',
  });

  res.json({ success: true, user: result.user, accessToken: result.accessToken });
}));

// ---- Google OAuth ----
router.post('/google', authLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { googleId, name, email, avatarUrl } = req.body;
  if (!googleId || !name || !email) {
    throw new AppError('Missing Google profile data', 400);
  }

  const result = await AuthService.googleAuth({ googleId, name, email, avatarUrl });

  res.cookie('accessToken', result.accessToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: 15 * 60 * 1000, path: '/',
  });
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth',
  });

  res.json({ success: true, user: result.user, accessToken: result.accessToken });
}));

// ---- Refresh Token ----
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) throw new AppError('Refresh token required', 400);

  const result = await AuthService.refreshTokens(token);

  res.cookie('accessToken', result.accessToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: 15 * 60 * 1000, path: '/',
  });
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth',
  });

  res.json({ success: true, accessToken: result.accessToken });
}));

// ---- Logout ----
router.post('/logout', authenticate, asyncHandler(async (req: Request, res: Response) => {
  await AuthService.logout(req.user!.userId);
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
}));

// ---- Get Profile ----
router.get('/me', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const profile = await AuthService.getProfile(req.user!.userId);
  res.json({ success: true, user: profile });
}));

// ---- Update Profile ----
router.patch('/me', authenticate, validate(updateProfileSchema), asyncHandler(async (req: Request, res: Response) => {
  const profile = await AuthService.updateProfile(req.user!.userId, req.body);
  res.json({ success: true, user: profile });
}));

export { router as authRouter };