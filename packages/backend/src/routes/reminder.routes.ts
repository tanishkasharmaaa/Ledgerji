import { Router, Request, Response, NextFunction } from 'express';
import { ReminderService } from '../services/reminder.service';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReminderSchema } from '../lib/validators';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.use(authenticate);

// ---- Get Reminder Templates ----
router.get('/templates', (_req: Request, res: Response) => {
  const result = ReminderService.getTemplates();
  res.json({ success: true, ...result });
});

// ---- Get Reminder History ----
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { customerId, page, limit } = req.query;
  const result = await ReminderService.getHistory(
    req.user!.userId,
    customerId as string,
    page ? Number(page) : 1,
    limit ? Number(limit) : 30,
  );
  res.json({ success: true, ...result });
}));

// ---- Send Reminder ----
router.post('/', validate(createReminderSchema), asyncHandler(async (req: Request, res: Response) => {
  const { customerId, transactionId, template, customMessage } = req.body;
  const result = await ReminderService.sendReminder(
    req.user!.userId,
    customerId,
    transactionId || null,
    template || 'friendly',
    customMessage || null,
  );
  res.status(201).json({ success: true, ...result });
}));

// ---- Quick Send (from customer page) ----
router.post('/quick', asyncHandler(async (req: Request, res: Response) => {
  const { customerId, transactionId, template, customMessage } = req.body;
  if (!customerId) {
    res.status(400).json({ success: false, message: 'Customer ID is required' });
    return;
  }

  const result = await ReminderService.sendReminder(
    req.user!.userId,
    customerId,
    transactionId || null,
    template || 'friendly',
    customMessage || null,
  );
  res.status(201).json({ success: true, ...result });
}));

export { router as reminderRouter };