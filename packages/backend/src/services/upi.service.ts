import QRCode from 'qrcode';
import { AppError } from '../middleware/error.middleware';
import type { GenerateUpiQrInput } from '../lib/validators';

const DEFAULT_UPI_ID = process.env.UPI_ID || 'ledgerji@upi';
const DEFAULT_BUSINESS_NAME = process.env.BUSINESS_NAME || 'LedgerJi';

export class UpiService {
  // ---- Generate UPI Payment Link ----
  static generatePaymentLink(input: GenerateUpiQrInput, upiId?: string, businessName?: string) {
    const pa = upiId || DEFAULT_UPI_ID;
    const pn = businessName || DEFAULT_BUSINESS_NAME;

    const params = new URLSearchParams({
      pa,
      pn,
      am: input.amount.toString(),
      cu: 'INR',
      tn: input.note || `Payment to ${pn}`,
    });

    // Add reference ID if provided
    if (input.transactionId) {
      params.append('tr', input.transactionId);
    }

    const upiUri = `upi://pay?${params.toString()}`;

    // Also generate a web-friendly UPI intent URL (for browsers)
    const upiIntentUrl = this.generateUpiIntentUrl(pa, pn, input.amount, input.note, input.transactionId);

    return { upiUri, upiIntentUrl, amount: input.amount, payee: pn };
  }

  // ---- Generate UPI Intent URL (works in browsers) ----
  private static generateUpiIntentUrl(
    upiId: string,
    name: string,
    amount: number,
    note?: string,
    tr?: string,
  ): string {
    const params = new URLSearchParams({
      pa: upiId,
      pn: name,
      am: amount.toString(),
      cu: 'INR',
      tn: note || `Payment to ${name}`,
      mode: '00',
      purpose: '00',
    });

    if (tr) params.append('tr', tr);

    return `intent://pay?${params.toString()}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
  }

  // ---- Generate QR Code as Data URL ----
  static async generateQrDataUrl(text: string, size: number = 300): Promise<string> {
    try {
      return await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        color: { dark: '#1a1a2e', light: '#ffffff' },
      });
    } catch (error) {
      throw new AppError('Failed to generate QR code', 500);
    }
  }

  // ---- Generate QR Code as Buffer (for download) ----
  static async generateQrBuffer(text: string, size: number = 300): Promise<Buffer> {
    try {
      return await QRCode.toBuffer(text, {
        width: size,
        margin: 2,
        color: { dark: '#1a1a2e', light: '#ffffff' },
        type: 'png',
      });
    } catch (error) {
      throw new AppError('Failed to generate QR code', 500);
    }
  }

  // ---- Generate Full QR Response (link + QR image + share data) ----
  static async generateFullQrResponse(input: GenerateUpiQrInput, upiId?: string, businessName?: string) {
    const { upiUri, upiIntentUrl, amount, payee } = this.generatePaymentLink(input, upiId, businessName);
    const qrDataUrl = await this.generateQrDataUrl(upiUri);

    // Generate shareable text
    const shareText = `\u{1F4B3} Pay \u20B9${amount.toLocaleString('en-IN')} to ${payee}\n\nUse any UPI app to scan or click:\n${upiUri}`;

    return {
      upiUri,
      upiIntentUrl,
      qrDataUrl,
      amount,
      payee,
      shareText,
      note: input.note,
    };
  }

  // ---- Generate Customer-specific QR ----
  static async generateCustomerQr(
    amount: number,
    customerName: string,
    upiId?: string,
    businessName?: string,
  ) {
    const note = `Payment from ${customerName}`;
    return this.generateFullQrResponse({ amount, note }, upiId, businessName);
  }
}