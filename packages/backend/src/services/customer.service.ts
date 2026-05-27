import prisma from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import type { CreateCustomerInput, UpdateCustomerInput } from '../lib/validators';

export class CustomerService {
  // ---- Create ----
  static async create(userId: string, input: CreateCustomerInput) {
    const customer = await prisma.customer.create({
      data: {
        ...input,
        userId,
        whatsappPhone: input.whatsappPhone || input.phone,
      },
    });
    return customer;
  }

  // ---- List all (with search) ----
  static async list(userId: string, search?: string, page: number = 1, limit: number = 50) {
    const where: any = { userId, isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: [{ balance: 'desc' }, { name: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);

    return { customers, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ---- Get by ID ----
  static async getById(userId: string, customerId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });
    if (!customer) throw new AppError('Customer not found', 404);
    return customer;
  }

  // ---- Update ----
  static async update(userId: string, customerId: string, input: UpdateCustomerInput) {
    const customer = await prisma.customer.findFirst({ where: { id: customerId, userId } });
    if (!customer) throw new AppError('Customer not found', 404);

    return prisma.customer.update({
      where: { id: customerId },
      data: input,
    });
  }

  // ---- Delete (soft) ----
  static async deactivate(userId: string, customerId: string) {
    const customer = await prisma.customer.findFirst({ where: { id: customerId, userId } });
    if (!customer) throw new AppError('Customer not found', 404);

    return prisma.customer.update({
      where: { id: customerId },
      data: { isActive: false },
    });
  }

  // ---- Get customer summary for WhatsApp ----
  static async getSummary(userId: string, customerId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, userId },
      include: {
        transactions: {
          where: { status: 'PENDING' },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!customer) throw new AppError('Customer not found', 404);
    return customer;
  }
}