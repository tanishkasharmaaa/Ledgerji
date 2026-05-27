import { Router, Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.use(authenticate);

// ---- Full Dashboard ----
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const summary = await DashboardService.getSummary(req.user!.userId);
  res.json({ success: true, ...summary });
}));

// ---- Quick Stats (lightweight, for mobile) ----
router.get('/quick', asyncHandler(async (req: Request, res: Response) => {
  const stats = await DashboardService.getQuickStats(req.user!.userId);
  res.json({ success: true, ...stats });
}));

export { router as dashboardRouter };