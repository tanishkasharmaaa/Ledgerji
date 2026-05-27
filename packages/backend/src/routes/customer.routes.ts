import { Router, Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCustomerSchema, updateCustomerSchema } from '../lib/validators';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.use(authenticate);

// ---- List Customers ----
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { search, page, limit } = req.query;
  const result = await CustomerService.list(
    req.user!.userId,
    search as string,
    page ? Number(page) : 1,
    limit ? Number(limit) : 50,
  );
  res.json({ success: true, ...result });
}));

// ---- Get Customer by ID ----
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const customer = await CustomerService.getById(req.user!.userId, req.params.id as string);
  res.json({ success: true, customer });
}));

// ---- Get Customer Summary (for WhatsApp) ----
router.get('/:id/summary', asyncHandler(async (req: Request, res: Response) => {
  const customer = await CustomerService.getSummary(req.user!.userId, req.params.id as string);
  res.json({ success: true, customer });
}));

// ---- Create Customer ----
router.post('/', validate(createCustomerSchema), asyncHandler(async (req: Request, res: Response) => {
  const customer = await CustomerService.create(req.user!.userId, req.body);
  res.status(201).json({ success: true, customer });
}));

// ---- Update Customer ----
router.patch('/:id', validate(updateCustomerSchema), asyncHandler(async (req: Request, res: Response) => {
  const customer = await CustomerService.update(req.user!.userId, req.params.id as string, req.body);
  res.json({ success: true, customer });
}));

// ---- Deactivate Customer ----
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await CustomerService.deactivate(req.user!.userId, req.params.id as string);
  res.json({ success: true, message: 'Customer removed' });
}));

export { router as customerRouter };