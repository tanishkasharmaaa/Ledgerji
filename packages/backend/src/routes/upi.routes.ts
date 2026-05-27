import { Router, Request, Response, NextFunction } from 'express';
import { UpiService } from '../services/upi.service';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { generateUpiQrSchema } from '../lib/validators';
import prisma from '../lib/prisma';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.use(authenticate);

// Helper: get the authenticated user's UPI details
async function getUserUpiDetails(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { upiId: true, businessName: true },
  });
  return {
    upiId: user?.upiId || process.env.UPI_ID || 'ledgerji@upi',
    businessName: user?.businessName || process.env.BUSINESS_NAME || 'LedgerJi',
  };
}

// ---- Generate QR Code ----
router.post('/qr', validate(generateUpiQrSchema), asyncHandler(async (req: Request, res: Response) => {
  const { upiId, businessName } = await getUserUpiDetails(req.user!.userId);
  const result = await UpiService.generateFullQrResponse(req.body, upiId, businessName);
  res.json({ success: true, ...result });
}));

// ---- Generate QR + Download PNG ----
router.post('/qr/download', validate(generateUpiQrSchema), asyncHandler(async (req: Request, res: Response) => {
  const { upiId, businessName } = await getUserUpiDetails(req.user!.userId);
  const { upiUri } = UpiService.generatePaymentLink(req.body, upiId, businessName);
  const buffer = await UpiService.generateQrBuffer(upiUri);

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'attachment; filename="ledgerji-payment-qr.png"');
  res.send(buffer);
}));

// ---- Generate Customer-specific QR ----
router.post('/qr/customer', asyncHandler(async (req: Request, res: Response) => {
  const { amount, customerName } = req.body;
  if (!amount || !customerName) {
    res.status(400).json({ success: false, message: 'Amount and customer name required' });
    return;
  }

  const { upiId, businessName } = await getUserUpiDetails(req.user!.userId);
  const result = await UpiService.generateCustomerQr(amount, customerName, upiId, businessName);
  res.json({ success: true, ...result });
}));

export { router as upiRouter };