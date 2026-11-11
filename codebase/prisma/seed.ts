import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial users...');

  const cashierPassword = await bcrypt.hash('cashier123', 10);
  const accountantPassword = await bcrypt.hash('accountant123', 10);

  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@shammah.co.ke' },
    update: {},
    create: {
      email: 'cashier@shammah.co.ke',
      name: 'Faith Chebet (Cashier)',
      passwordHash: cashierPassword,
      role: 'CASHIER',
    },
  });

  const accountant = await prisma.user.upsert({
    where: { email: 'finance@shammah.co.ke' },
    update: {},
    create: {
      email: 'finance@shammah.co.ke',
      name: 'David Mwangi (Accountant)',
      passwordHash: accountantPassword,
      role: 'ACCOUNTANT',
    },
  });

  // Seed sample initial transactions for demonstration
  const sampleTx = await prisma.transaction.upsert({
    where: { receiptNumber: 'SHM-2026-0001' },
    update: {},
    create: {
      receiptNumber: 'SHM-2026-0001',
      guestName: 'Alexander Wright',
      guestPhone: '+254712345678',
      guestEmail: 'a.wright@corp.com',
      subtotal: 25050,
      vatAmount: 4008,
      totalAmount: 29058,
      paymentMethod: 'MPESA',
      status: 'SETTLED',
      cashierId: cashier.id,
      items: {
        create: [
          {
            category: 'ROOM',
            description: 'Deluxe Suite (3 Nights @ KSh 6,500/night)',
            datesLabel: 'Nov 07 → Nov 10',
            nights: 3,
            amount: 19500,
          },
          {
            category: 'FNB',
            description: 'Shammah Restaurant (Dinner & Drinks)',
            datesLabel: 'Nov 08',
            nights: 0,
            amount: 3200,
          },
          {
            category: 'MINIBAR',
            description: 'Minibar (Beverages & Snacks)',
            datesLabel: 'Nov 09',
            nights: 0,
            amount: 850,
          },
          {
            category: 'SERVICE',
            description: 'Late Checkout Fee (2 Hours)',
            datesLabel: 'Nov 10',
            nights: 0,
            amount: 1500,
          },
        ],
      },
      deliveries: {
        create: [
          {
            channel: 'WHATSAPP',
            recipient: '+254712345678',
            status: 'SENT',
            detail: 'PDF dispatched to WhatsApp',
          },
          {
            channel: 'EMAIL',
            recipient: 'a.wright@corp.com',
            status: 'SENT',
            detail: 'Emailed PDF invoice',
          },
        ],
      },
    },
  });

  console.log('Seeded users and sample transaction:', {
    cashier: cashier.email,
    accountant: accountant.email,
    sampleTx: sampleTx.receiptNumber,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
