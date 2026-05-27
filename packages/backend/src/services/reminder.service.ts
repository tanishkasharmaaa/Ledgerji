import prisma from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';

// Backend URL for constructing public QR image links
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

/**
 * Build a public QR image URL that can be embedded in WhatsApp messages.
 * The customer taps this link to view the QR code in their browser.
 */
function buildQrImageUrl(upiId: string, businessName: string, amount: number, note: string): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: businessName,
    am: amount.toString(),
    tn: note,
  });
  return `${BACKEND_URL}/api/public/qr?${params.toString()}`;
}

// WhatsApp reminder templates — unified format with --- separator
// Owner note is injected before the separator by sendReminder()
const REMINDER_TEMPLATES: Record<string, (name: string, amount: number, upiLink: string, qrImageUrl: string, businessName: string) => string> = {
  friendly: (name, amount, upiLink, qrImageUrl, businessName) =>
    `Hi ${name} ji! \n\nHope you are doing well. This is a friendly reminder that a payment of *${amount.toLocaleString('en-IN')}* is pending with ${businessName}.\n\n---\n\n\ *Pay Directly via UPI:*\n${upiLink}\n\n\ *Or Scan the QR Code:*\n${qrImageUrl}\n\nThank you! `,

  polite: (name, amount, upiLink, qrImageUrl, businessName) =>
    `Namaste ${name} ji \n\nWe hope this message finds you well. A payment of *${amount.toLocaleString('en-IN')}* is currently pending with ${businessName}. Kindly clear it at your earliest convenience.\n\n---\n\n *Pay Directly via UPI:*\n${upiLink}\n\n *Or Scan the QR Code:*\n${qrImageUrl}\n\nDhanyavaad! `,

  short: (name, amount, upiLink, qrImageUrl, businessName) =>
    `Hi ${name} ji! \n\nPayment of * ${amount.toLocaleString('en-IN')}* pending with ${businessName}.\n\n---\n\n *Pay via UPI:*\n${upiLink}\n\n *QR:*\n${qrImageUrl}\n\nThank you!`,
};

export class ReminderService {
  // ---- Generate WhatsApp Link ----
  static generateWhatsAppLink(phone: string, message: string): string {
    const cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${cleaned}?text=${encoded}`;
  }

  // ---- Build UPI Payment Link ----
  static buildUpiLink(upiId: string, name: string, amount: number, note: string = ''): string {
    const params = new URLSearchParams({
      pa: upiId,
      pn: name,
      am: amount.toString(),
      cu: 'INR',
      tn: note || `Payment to LedgerJi`,
    });
    return `upi://pay?${params.toString()}`;
  }

  // ---- Send Reminder (creates record + returns WhatsApp link) ----
  static async sendReminder(
    userId: string,
    customerId: string,
    transactionId?: string | null,
    templateName: string = 'friendly',
    customMessage?: string | null,
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, userId },
      include: {
        transactions: {
          where: { status: 'PENDING', type: 'CREDIT' },
        },
      },
    });
    if (!customer) throw new AppError('Customer not found', 404);

    const phone = customer.whatsappPhone || customer.phone;
    if (!phone) {
      throw new AppError('No phone number available for this customer. Please add a phone number first.', 400);
    }

    const upiId = user.upiId || process.env.UPI_ID || 'ledgerji@upi';
    const businessName = user.businessName || 'LedgerJi';

    // Calculate total pending
    let pendingAmount: number;
    if (transactionId) {
      const txn = customer.transactions.find((t) => t.id === transactionId);
      pendingAmount = txn?.amount || customer.balance;
    } else {
      pendingAmount = customer.balance;
    }

    if (pendingAmount <= 0) {
      throw new AppError('No pending payments for this customer! \u{1F389}', 400);
    }

    const upiLink = this.buildUpiLink(upiId, businessName, pendingAmount, `Payment from ${customer.name}`);
    const qrImageUrl = buildQrImageUrl(upiId, businessName, pendingAmount, `Payment from ${customer.name}`);
    const template = REMINDER_TEMPLATES[templateName] || REMINDER_TEMPLATES.friendly;
    let message = template(customer.name, pendingAmount, upiLink, qrImageUrl, businessName);

    // Determine owner note: customMessage takes priority, else customer.notes
    const ownerNote = (customMessage && customMessage.trim()) || (customer.notes && customer.notes.trim());
    if (ownerNote) {
      // Inject note before the --- separator
      message = message.replace('---', ` *Note from the owner:*\n${ownerNote}\n\n---`);
    }

    const whatsappUrl = this.generateWhatsAppLink(phone, message);

    // Generate QR data URL
    const qrDataUrl = await this.generateQrDataUrl(upiLink);

    // Record the reminder
    const reminder = await prisma.reminder.create({
      data: {
        userId,
        customerId,
        transactionId: transactionId || null,
        method: 'WHATSAPP',
        template: templateName,
        message,
        whatsappNumber: phone,
        status: 'SENT',
        upiLink,
        qrGenerated: true,
      },
    });

    return {
      reminder,
      whatsappUrl,
      upiLink,
      qrDataUrl,
      message,
      customerName: customer.name,
      pendingAmount,
    };
  }

  // ---- Generate QR Data URL ----
  static async generateQrDataUrl(upiLink: string): Promise<string> {
    try {
      // Dynamically import qrcode (avoid issues if not installed)
      const QRCode = await import('qrcode');
      const dataUrl = await QRCode.toDataURL(upiLink, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
      return dataUrl;
    } catch {
      return '';
    }
  }

  // ---- Get Reminder History ----
  static async getHistory(userId: string, customerId?: string, page: number = 1, limit: number = 30) {
    const where: any = { userId };
    if (customerId) where.customerId = customerId;

    const [reminders, total] = await Promise.all([
      prisma.reminder.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          transaction: { select: { id: true, amount: true, type: true } },
        },
        orderBy: { sentAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reminder.count({ where }),
    ]);

    return { reminders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ---- Get Reminder Templates ----
  static getTemplates() {
    return {
      templates: Object.keys(REMINDER_TEMPLATES).map((key) => ({
        id: key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        preview: REMINDER_TEMPLATES[key]('Customer', 500, 'upi://pay?...', 'https://ledgerji.app/qr?pa=...', 'LedgerJi'),
      })),
    };
  }
}