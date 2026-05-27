import { Router, Request, Response, NextFunction } from 'express';
import QRCode from 'qrcode';

const router = Router();

/**
 * Public endpoint: returns a PNG QR code image.
 * No authentication required — customers open this link from WhatsApp messages.
 *
 * Query params:
 *   pa - UPI ID (payee address)
 *   pn - Payee name (business name)
 *   am - Amount
 *   tn - Transaction note
 *   cu - Currency (default: INR)
 */
router.get('/qr', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pa, pn, am, tn, cu } = req.query;

    if (!pa || !pn || !am) {
      res.status(400).json({ success: false, message: 'Missing required query params: pa, pn, am' });
      return;
    }

    const params = new URLSearchParams({
      pa: String(pa),
      pn: String(pn),
      am: String(am),
      cu: String(cu || 'INR'),
      tn: String(tn || `Payment to ${pn}`),
    });

    const upiUri = `upi://pay?${params.toString()}`;

    const buffer = await QRCode.toBuffer(upiUri, {
      width: 400,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
      type: 'png',
    });

    // Cache for 1 hour — QR codes for the same params don't change
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

export { router as publicRouter };