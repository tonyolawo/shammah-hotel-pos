import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ receiptNumber: string }> }
) {
  const { receiptNumber } = await params;

  const transaction = await prisma.transaction.findUnique({
    where: { receiptNumber },
    include: {
      items: true,
      deliveries: true,
    },
  });

  if (!transaction) {
    return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
  }

  return NextResponse.json({ transaction });
}
