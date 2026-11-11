'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Hotel,
  CheckCircle2,
  Printer,
  MessageCircle,
  Mail,
  Send,
  ArrowLeft
} from 'lucide-react';

interface FolioItem {
  id: string;
  category: string;
  description: string;
  datesLabel?: string | null;
  amount: number;
}

interface DeliveryLog {
  id: string;
  channel: string;
  recipient: string;
  status: string;
  detail?: string | null;
}

interface TransactionData {
  id: string;
  receiptNumber: string;
  guestName: string;
  guestPhone?: string | null;
  guestEmail?: string | null;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  items: FolioItem[];
  deliveries: DeliveryLog[];
}

export default function ReceiptPage({
  params,
}: {
  params: Promise<{ receiptNumber: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReceipt() {
      try {
        const res = await fetch(`/api/checkouts/${resolvedParams.receiptNumber}`);
        if (!res.ok) throw new Error('Receipt not found');
        const data = await res.json();
        setTransaction(data.transaction);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReceipt();
  }, [resolvedParams.receiptNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <p className="text-xs text-slate-500 font-medium">Loading official receipt...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-800">Receipt Not Found</p>
        <button
          onClick={() => router.push('/cashier')}
          className="text-xs text-blue-600 hover:underline"
        >
          ← Return to Cashier Terminal
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 antialiased p-4 md:p-8 font-sans flex flex-col items-center">
      
      {/* Top Bar */}
      <div className="w-full max-w-xl mb-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/cashier')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cashier Terminal</span>
        </button>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 flex items-center gap-1.5 transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Copy</span>
        </button>
      </div>

      {/* Printable Receipt Card */}
      <main className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
        
        {/* Hotel Receipt Header */}
        <div className="text-center pb-5 border-b border-slate-100">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <Hotel className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Shammah Hotel
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official Guest Folio & Settlement Receipt
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Settled in Full</span>
          </div>
        </div>

        {/* Receipt Meta */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-100">
            <span>Guest Name:</span>
            <span className="font-semibold text-slate-900">{transaction.guestName}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-100">
            <span>Date & Time:</span>
            <span className="font-mono text-slate-900">
              {new Date(transaction.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-100">
            <span>Receipt Reference:</span>
            <span className="font-mono text-slate-900 font-bold">
              #{transaction.receiptNumber}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-100">
            <span>Payment Method:</span>
            <span className="font-semibold text-slate-900">
              {transaction.paymentMethod === 'MPESA'
                ? '📱 M-Pesa'
                : transaction.paymentMethod === 'CARD'
                ? '💳 Card'
                : '💵 Cash'}
            </span>
          </div>

          {/* Itemized Table */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs mt-3">
            {transaction.items.map((it) => (
              <div key={it.id} className="flex justify-between text-slate-600">
                <span>{it.description}</span>
                <span className="font-mono font-medium text-slate-900">
                  KSh {it.amount.toLocaleString()}
                </span>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-600">
              <span>VAT (16%):</span>
              <span className="font-mono font-medium text-slate-900">
                KSh {Math.round(transaction.vatAmount).toLocaleString()}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold">
              <span className="text-slate-900">Total Paid:</span>
              <span className="font-mono text-emerald-600">
                KSh {Math.round(transaction.totalAmount).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Channel Delivery Logs */}
        {transaction.deliveries && transaction.deliveries.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Receipt Dispatch Confirmations:
            </p>
            <div className="space-y-1.5">
              {transaction.deliveries.map((del) => (
                <div
                  key={del.id}
                  className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-emerald-800">
                    {del.channel === 'WHATSAPP' && <MessageCircle className="w-3.5 h-3.5" />}
                    {del.channel === 'EMAIL' && <Mail className="w-3.5 h-3.5" />}
                    {del.channel === 'SMS' && <Send className="w-3.5 h-3.5" />}
                    <span className="font-medium">{del.channel}</span>
                    <span className="text-[11px] text-slate-500 font-mono">({del.recipient})</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {del.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-400">
          <p>Thank you for choosing Shammah Hotel. Safe travels!</p>
        </div>

      </main>

    </div>
  );
}
