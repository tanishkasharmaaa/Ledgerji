import prisma from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import type { CreateTransactionInput, UpdateTransactionInput } from '../lib/validators';

export class TransactionService {
  // ---- Create ----
  static async create(userId: string, input: CreateTransactionInput) {
    const customer = await prisma.customer.findFirst({
      where: { id: input.customerId, userId },
    });
    if (!customer) throw new AppError('Customer not found', 404);

    const transaction = await prisma.$transaction(async (tx) => {
      const txn = await tx.transaction.create({
        data: {
          userId,
          customerId: input.customerId,
          type: input.type,
          amount: input.amount,
          description: input.description || null,
          notes: input.notes || null,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        },
      });

      // Update customer balance
      const balanceChange = input.type === 'CREDIT' ? input.amount : -input.amount;
      await tx.customer.update({
        where: { id: input.customerId },
        data: {
          totalCredit: input.type === 'CREDIT' ? { increment: input.amount } : undefined,
          totalDebit: input.type === 'DEBIT' ? { increment: input.amount } : undefined,
          balance: { increment: balanceChange },
        },
      });

      return txn;
    });

    return transaction;
  }

  // ---- List ----
  static async list(
    userId: string,
    filters?: { customerId?: string; type?: string; status?: string; fromDate?: string; toDate?: string },
    page: number = 1,
    limit: number = 50,
  ) {
    const where: any = { userId };

    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    if (filters?.fromDate || filters?.toDate) {
      where.createdAt = {};
      if (filters.fromDate) where.createdAt.gte = new Date(filters.fromDate);
      if (filters.toDate) where.createdAt.lte = new Date(filters.toDate);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { customer: { select: { id: true, name: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ---- Get by ID ----
  static async getById(userId: string, transactionId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
      include: { customer: true },
    });
    if (!transaction) throw new AppError('Transaction not found', 404);
    return transaction;
  }

  // ---- Update ----
  static async update(userId: string, transactionId: string, input: UpdateTransactionInput) {
    const txn = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });
    if (!txn) throw new AppError('Transaction not found', 404);

    return prisma.$transaction(async (tx) => {
      // Reverse old balance effect
      const oldBalanceChange = txn.type === 'CREDIT' ? -txn.amount : txn.amount;
      await tx.customer.update({
        where: { id: txn.customerId },
        data: {
          totalCredit: txn.type === 'CREDIT' ? { decrement: txn.amount } : undefined,
          totalDebit: txn.type === 'DEBIT' ? { decrement: txn.amount } : undefined,
          balance: { increment: oldBalanceChange },
        },
      });

      // Apply new values
      const newType = input.type || txn.type;
      const newAmount = input.amount || txn.amount;
      const newBalanceChange = newType === 'CREDIT' ? newAmount : -newAmount;

      await tx.customer.update({
        where: { id: txn.customerId },
        data: {
          totalCredit: newType === 'CREDIT' ? { increment: newAmount } : undefined,
          totalDebit: newType === 'DEBIT' ? { increment: newAmount } : undefined,
          balance: { increment: newBalanceChange },
        },
      });

      const updated = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          ...input,
          ...(input.status === 'PAID' ? { paidAt: new Date() } : {}),
        },
      });

      return updated;
    });
  }

  // ---- Mark as Paid ----
  static async markPaid(userId: string, transactionId: string) {
    return this.update(userId, transactionId, { status: 'PAID' });
  }

  // ---- Mark as Cancelled ----
  static async markCancelled(userId: string, transactionId: string) {
    return this.update(userId, transactionId, { status: 'CANCELLED' });
  }

  // ---- Get Pending for Customer ----
  static async getPendingByCustomer(userId: string, customerId: string) {
    return prisma.transaction.findMany({
      where: { userId, customerId, status: 'PENDING', type: 'CREDIT' },
      orderBy: { createdAt: 'desc' },
    });
  }
}