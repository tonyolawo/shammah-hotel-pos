import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { dispatchReceipt } from '@/lib/receipt-service';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      deliveries: true,
      cashier: {
        select: { name: true, email: true },
      },
    },
  });

  return NextResponse.json({ transactions });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      guestName,
      guestPhone,
      guestEmail,
      items,
      paymentMethod,
      dispatchOptions,
    } = body;

    if (!items || !items.length) {
      return NextResponse.json(
        { error: 'Cannot checkout without folio items' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { amount: number }) => sum + Number(item.amount),
      0
    );
    const vatAmount = subtotal * 0.16;
    const totalAmount = subtotal + vatAmount;

    // Generate receipt number (e.g. SHM-2026-0042)
    const count = await prisma.transaction.count();
    const receiptNumber = `SHM-2026-${String(count + 1).padStart(4, '0')}`;

    // Create database records
    const transaction = await prisma.transaction.create({
      data: {
        receiptNumber,
        guestName: guestName || 'Valued Guest',
        guestPhone: guestPhone || null,
        guestEmail: guestEmail || null,
        subtotal,
        vatAmount,
        totalAmount,
        paymentMethod: paymentMethod || 'CASH',
        status: 'SETTLED',
        cashierId: session.userId,
        items: {
          create: items.map(
            (it: {
              category: string;
              description: string;
              datesLabel?: string;
              nights?: number;
              amount: number;
            }) => ({
              category: it.category || 'ROOM',
              description: it.description,
              datesLabel: it.datesLabel || null,
              nights: it.nights || 0,
              amount: Number(it.amount),
            })
          ),
        },
      },
      include: {
        items: true,
      },
    });

    // Multi-channel dispatch (WhatsApp PDF, Email, SMS link)
    if (dispatchOptions) {
      const deliveryLogs = await dispatchReceipt(
        {
          receiptNumber: transaction.receiptNumber,
          guestName: transaction.guestName,
          totalAmount: transaction.totalAmount,
          paymentMethod: transaction.paymentMethod,
          settledAt: transaction.createdAt.toISOString(),
          items: transaction.items,
        },
        {
          whatsapp: dispatchOptions.whatsapp,
          email: dispatchOptions.email,
          sms: dispatchOptions.sms,
          recipientPhone: guestPhone,
          recipientEmail: guestEmail,
        }
      );

      if (deliveryLogs.length > 0) {
        await prisma.receiptDeliveryLog.createMany({
          data: deliveryLogs.map((log) => ({
            transactionId: transaction.id,
            channel: log.channel,
            recipient: log.recipient,
            status: log.status,
            detail: log.detail,
          })),
        });
      }
    }

    return NextResponse.json({
      success: true,
      receiptNumber: transaction.receiptNumber,
      transaction,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout transaction' },
      { status: 500 }
    );
  }
}
