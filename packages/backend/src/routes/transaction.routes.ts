import { Router, Request, Response, NextFunction } from 'express';
import { TransactionService } from '../services/transaction.service';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTransactionSchema, updateTransactionSchema } from '../lib/validators';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.use(authenticate);

// ---- List Transactions ----
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { customerId, type, status, fromDate, toDate, page, limit } = req.query;
  const result = await TransactionService.list(
    req.user!.userId,
    { customerId: customerId as string, type: type as string, status: status as string, fromDate: fromDate as string, toDate: toDate as string },
    page ? Number(page) : 1,
    limit ? Number(limit) : 50,
  );
  res.json({ success: true, ...result });
}));

// ---- Get Transaction by ID ----
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const transaction = await TransactionService.getById(req.user!.userId, req.params.id as string);
  res.json({ success: true, transaction });
}));

// ---- Get Pending for Customer ----
router.get('/pending/:customerId', asyncHandler(async (req: Request, res: Response) => {
  const transactions = await TransactionService.getPendingByCustomer(req.user!.userId, req.params.customerId as string);
  res.json({ success: true, transactions });
}));

// ---- Create Transaction ----
router.post('/', validate(createTransactionSchema), asyncHandler(async (req: Request, res: Response) => {
  const transaction = await TransactionService.create(req.user!.userId, req.body);
  res.status(201).json({ success: true, transaction });
}));

// ---- Update Transaction ----
router.patch('/:id', validate(updateTransactionSchema), asyncHandler(async (req: Request, res: Response) => {
  const transaction = await TransactionService.update(req.user!.userId, req.params.id as string, req.body);
  res.json({ success: true, transaction });
}));

// ---- Mark as Paid ----
router.post('/:id/paid', asyncHandler(async (req: Request, res: Response) => {
  const transaction = await TransactionService.markPaid(req.user!.userId, req.params.id as string);
  res.json({ success: true, transaction });
}));

// ---- Mark as Cancelled ----
router.post('/:id/cancel', asyncHandler(async (req: Request, res: Response) => {
  const transaction = await TransactionService.markCancelled(req.user!.userId, req.params.id as string);
  res.json({ success: true, transaction });
}));

export { router as transactionRouter };