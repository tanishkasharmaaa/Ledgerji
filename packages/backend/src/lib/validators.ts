import { z } from 'zod';

// ---- Auth ----
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  businessName: z.string().max(200).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

// ---- Customer ----
export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  phone: z.string().min(10).max(15).optional().nullable(),
  whatsappPhone: z.string().min(10).max(15).optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

// ---- Transaction ----
export const createTransactionSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  type: z.enum(['CREDIT', 'DEBIT'], { errorMap: () => ({ message: 'Type must be CREDIT or DEBIT' }) }),
  amount: z.number().positive('Amount must be positive').max(99999999, 'Amount too large'),
  description: z.string().max(500).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const updateTransactionSchema = z.object({
  type: z.enum(['CREDIT', 'DEBIT']).optional(),
  amount: z.number().positive().max(99999999).optional(),
  description: z.string().max(500).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  status: z.enum(['PENDING', 'PAID', 'CANCELLED']).optional(),
});

// ---- Reminder ----
export const createReminderSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  transactionId: z.string().uuid().optional().nullable(),
  method: z.enum(['WHATSAPP', 'SMS', 'MANUAL']).default('WHATSAPP'),
  template: z.string().optional(),
  customMessage: z.string().max(500).optional().nullable(),
});

// ---- UPI ----
export const generateUpiQrSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(99999999),
  customerId: z.string().uuid().optional(),
  transactionId: z.string().uuid().optional(),
  note: z.string().max(100).optional(),
});

// ---- Profile ----
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).max(15).optional(),
  businessName: z.string().max(200).optional().nullable(),
  upiId: z.string().max(100).optional().nullable(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type GenerateUpiQrInput = z.infer<typeof generateUpiQrSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;