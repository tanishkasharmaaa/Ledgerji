import prisma from '../lib/prisma';

export class DashboardService {
  // ---- Get Dashboard Summary ----
  static async getSummary(userId: string) {
    const now = new Date();

    // Start of today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Start of this month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Start of last month
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total pending (CREDIT - DEBIT balance sum where positive)
    const [totalPendingResult, todayCollection, monthCollection, lastMonthCollection,
      totalCustomers, activeCustomersWithBalance, recentTransactions, recentReminders,
    ] = await Promise.all([
      // Total pending money (sum of positive customer balances)
      prisma.customer.aggregate({
        where: { userId, isActive: true, balance: { gt: 0 } },
        _sum: { balance: true },
      }),
      // Today's collection (DEBIT entries today)
      prisma.transaction.aggregate({
        where: { userId, type: 'DEBIT', paidAt: { gte: todayStart, lt: todayEnd } },
        _sum: { amount: true },
      }),
      // This month's collection
      prisma.transaction.aggregate({
        where: { userId, type: 'DEBIT', paidAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
      // Last month's collection (for comparison)
      prisma.transaction.aggregate({
        where: { userId, type: 'DEBIT', paidAt: { gte: lastMonthStart, lt: lastMonthEnd } },
        _sum: { amount: true },
      }),
      // Total customers
      prisma.customer.count({ where: { userId, isActive: true } }),
      // Customers with pending balance
      prisma.customer.count({ where: { userId, isActive: true, balance: { gt: 0 } } }),
      // Recent 5 transactions
      prisma.transaction.findMany({
        where: { userId },
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Recent 5 reminders
      prisma.reminder.findMany({
        where: { userId },
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { sentAt: 'desc' },
        take: 5,
      }),
    ]);

    // Top 5 debtors
    const topDebtors = await prisma.customer.findMany({
      where: { userId, isActive: true, balance: { gt: 0 } },
      orderBy: { balance: 'desc' },
      take: 5,
      select: { id: true, name: true, phone: true, balance: true },
    });

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyTransactions = await prisma.transaction.groupBy({
      by: ['type'],
      where: { userId, createdAt: { gte: sixMonthsAgo } },
      _sum: { amount: true },
    });

    return {
      totalPendingMoney: totalPendingResult._sum.balance || 0,
      todayCollection: todayCollection._sum.amount || 0,
      monthCollection: monthCollection._sum.amount || 0,
      lastMonthCollection: lastMonthCollection._sum.amount || 0,
      collectionGrowth: lastMonthCollection._sum.amount
        ? ((monthCollection._sum.amount || 0) - lastMonthCollection._sum.amount) / lastMonthCollection._sum.amount * 100
        : 0,
      totalCustomers,
      customersWithBalance: activeCustomersWithBalance,
      recentTransactions,
      recentReminders,
      topDebtors,
      monthlySummary: monthlyTransactions,
    };
  }

  // ---- Quick Stats for Mobile Dashboard ----
  static async getQuickStats(userId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [pendingMoney, todayCollection, totalCustomers, pendingCustomers] = await Promise.all([
      prisma.customer.aggregate({
        where: { userId, isActive: true, balance: { gt: 0 } },
        _sum: { balance: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, createdAt: { gte: todayStart }, type: 'DEBIT' },
        _sum: { amount: true },
      }),
      prisma.customer.count({ where: { userId, isActive: true } }),
      prisma.customer.count({ where: { userId, isActive: true, balance: { gt: 0 } } }),
    ]);

    return {
      pendingMoney: pendingMoney._sum.balance || 0,
      todayCollection: todayCollection._sum.amount || 0,
      totalCustomers,
      pendingCustomers,
      paidCustomers: totalCustomers - pendingCustomers,
    };
  }
}