import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding LedgerJi database...');

  // Clean existing data
  await prisma.reminder.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // ---- Create Demo User ----
  const passwordHash = await bcrypt.hash('demo1234', 12);
  const user = await prisma.user.create({
    data: {
      name: 'Rajesh Kumar',
      email: 'demo@ledgerji.com',
      phone: '9876543210',
      passwordHash,
      businessName: 'Sharma General Store',
      upiId: 'rajesh@upi',
      isVerified: true,
    },
  });
  console.log(`✅ Created user: ${user.name} (demo@ledgerji.com / demo1234)`);

  // ---- Create Customers ----
  const customersData = [
    { name: 'Amit Verma', phone: '9811122233', whatsappPhone: '9811122233', address: 'Shop No. 12, Main Market', notes: 'Regular customer, pays monthly' },
    { name: 'Priya Sharma', phone: '9822233344', whatsappPhone: '9822233344', address: 'House 45, Gandhi Nagar', notes: '' },
    { name: 'Vikram Singh', phone: '9833344455', whatsappPhone: '9833344455', address: 'Plot 78, Industrial Area', notes: 'Wholesale buyer' },
    { name: 'Sunita Patel', phone: '9844455566', whatsappPhone: '9844455566', address: 'Flat 302, Shanti Apartment', notes: '' },
    { name: 'Rahul Gupta', phone: '9855566677', whatsappPhone: '9855566677', address: 'Shop 5, Central Plaza', notes: 'Needs reminder for payment' },
    { name: 'Meena Devi', phone: '9866677788', whatsappPhone: '9866677788', address: 'Village Chowk, Near Temple', notes: 'Pays in cash usually' },
    { name: 'Suresh Yadav', phone: '9877788899', whatsappPhone: '9877788899', address: 'Kirana Market, Stall 3', notes: '' },
    { name: 'Anjali Joshi', phone: '9888899900', whatsappPhone: '9888899900', address: 'Beauty Parlor, MG Road', notes: 'Salon owner' },
    { name: 'Deepak Malhotra', phone: '9899900011', whatsappPhone: '9899900011', address: 'Gym Building, 2nd Floor', notes: 'Gym owner, bulk orders' },
    { name: 'Kavita Reddy', phone: '9800011122', whatsappPhone: '9800011122', address: '12, New Colony', notes: '' },
  ];

  const customers = [];
  for (const c of customersData) {
    const customer = await prisma.customer.create({
      data: { ...c, userId: user.id },
    });
    customers.push(customer);
  }
  console.log(`✅ Created ${customers.length} customers`);

  // ---- Create Transactions ----
  const transactionsData = [
    // Amit Verma - owes money
    { customerId: customers[0].id, type: 'CREDIT', amount: 2500, description: 'Groceries - March', status: 'PENDING', dueDate: new Date('2026-04-15') },
    { customerId: customers[0].id, type: 'DEBIT', amount: 1000, description: 'Partial payment', status: 'PAID', paidAt: new Date('2026-03-20') },
    { customerId: customers[0].id, type: 'CREDIT', amount: 800, description: 'Extra items', status: 'PENDING', dueDate: new Date('2026-04-20') },

    // Priya Sharma - mostly paid
    { customerId: customers[1].id, type: 'CREDIT', amount: 5000, description: 'Monthly groceries', status: 'PENDING', dueDate: new Date('2026-04-10') },
    { customerId: customers[1].id, type: 'DEBIT', amount: 5000, description: 'Full payment received', status: 'PAID', paidAt: new Date('2026-04-09') },
    { customerId: customers[1].id, type: 'CREDIT', amount: 1200, description: 'Dairy products', status: 'PENDING', dueDate: new Date('2026-04-25') },

    // Vikram Singh - large pending
    { customerId: customers[2].id, type: 'CREDIT', amount: 15000, description: 'Wholesale order - wheat', status: 'PENDING', dueDate: new Date('2026-04-30') },
    { customerId: customers[2].id, type: 'CREDIT', amount: 8000, description: 'Wholesale order - rice', status: 'PENDING', dueDate: new Date('2026-05-15') },
    { customerId: customers[2].id, type: 'DEBIT', amount: 5000, description: 'Advance payment', status: 'PAID', paidAt: new Date('2026-03-25') },

    // Sunita Patel
    { customerId: customers[3].id, type: 'CREDIT', amount: 350, description: 'Snacks & drinks', status: 'PENDING', dueDate: new Date('2026-04-05') },
    { customerId: customers[3].id, type: 'DEBIT', amount: 350, description: 'Paid in full', status: 'PAID', paidAt: new Date('2026-04-05') },

    // Rahul Gupta
    { customerId: customers[4].id, type: 'CREDIT', amount: 4500, description: 'Monthly supplies', status: 'PENDING', dueDate: new Date('2026-04-01') },
    { customerId: customers[4].id, type: 'CREDIT', amount: 2200, description: 'Additional supplies', status: 'PENDING', dueDate: new Date('2026-04-18') },

    // Meena Devi
    { customerId: customers[5].id, type: 'CREDIT', amount: 750, description: 'Daily items', status: 'PENDING', dueDate: new Date('2026-04-12') },

    // Suresh Yadav
    { customerId: customers[6].id, type: 'CREDIT', amount: 3200, description: 'Kirana supplies', status: 'PENDING', dueDate: new Date('2026-04-22') },
    { customerId: customers[6].id, type: 'DEBIT', amount: 1200, description: 'Partial payment', status: 'PAID', paidAt: new Date('2026-04-20') },

    // Anjali Joshi
    { customerId: customers[7].id, type: 'CREDIT', amount: 1800, description: 'Beauty products', status: 'PENDING', dueDate: new Date('2026-04-14') },

    // Deepak Malhotra
    { customerId: customers[8].id, type: 'CREDIT', amount: 12000, description: 'Bulk order - supplements', status: 'PENDING', dueDate: new Date('2026-05-01') },
    { customerId: customers[8].id, type: 'DEBIT', amount: 6000, description: 'Half payment', status: 'PAID', paidAt: new Date('2026-04-28') },

    // Kavita Reddy - no pending
    { customerId: customers[9].id, type: 'CREDIT', amount: 2000, description: 'Groceries', status: 'PAID', paidAt: new Date('2026-04-01') },
    { customerId: customers[9].id, type: 'DEBIT', amount: 2000, description: 'Full payment', status: 'PAID', paidAt: new Date('2026-04-01') },
  ];

  for (const t of transactionsData) {
    await prisma.transaction.create({
      data: { ...t, userId: user.id },
    });
  }
  console.log(`✅ Created ${transactionsData.length} transactions`);

  // ---- Update Customer Balances ----
  for (const customer of customers) {
    const transactions = await prisma.transaction.findMany({
      where: { customerId: customer.id, userId: user.id },
    });

    let balance = 0;
    let totalCredit = 0;
    let totalDebit = 0;

    for (const txn of transactions) {
      if (txn.type === 'CREDIT' && txn.status === 'PENDING') {
        balance += txn.amount;
      }
      if (txn.type === 'CREDIT') totalCredit += txn.amount;
      if (txn.type === 'DEBIT') totalDebit += txn.amount;
      if (txn.type === 'DEBIT' && txn.status === 'PAID') {
        balance -= txn.amount;
      }
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: { balance: Math.max(0, balance), totalCredit, totalDebit },
    });
  }
  console.log('✅ Updated customer balances');

  console.log('\n🎉 Seed complete!');
  console.log('📧 Demo login: demo@ledgerji.com / demo1234');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });