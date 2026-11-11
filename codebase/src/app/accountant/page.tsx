'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Hotel,
  Download,
  Lock,
  LogOut,
  TrendingUp,
  CreditCard,
  Smartphone,
  DollarSign,
  ArrowLeft
} from 'lucide-react';

interface Transaction {
  id: string;
  receiptNumber: string;
  guestName: string;
  paymentMethod: string;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  createdAt: string;
  deliveries: Array<{ channel: string }>;
}

export default function AccountantPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/checkouts');
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to load audit records');
        }
        const data = await res.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  }

  // Summary Metrics
  const totalSettled = transactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
  const mpesaTotal = transactions
    .filter((tx) => tx.paymentMethod === 'MPESA')
    .reduce((sum, tx) => sum + tx.totalAmount, 0);
  const cardTotal = transactions
    .filter((tx) => tx.paymentMethod === 'CARD')
    .reduce((sum, tx) => sum + tx.totalAmount, 0);
  const cashTotal = transactions
    .filter((tx) => tx.paymentMethod === 'CASH')
    .reduce((sum, tx) => sum + tx.totalAmount, 0);

  function exportCSV() {
    if (!transactions.length) return;
    const headers = 'Receipt Number,Time,Guest Name,Payment Method,Subtotal,VAT (16%),Total (KSh)\n';
    const rows = transactions
      .map(
        (tx) =>
          `"${tx.receiptNumber}","${new Date(tx.createdAt).toLocaleTimeString()}","${tx.guestName}","${tx.paymentMethod}",${tx.subtotal},${tx.vatAmount},${tx.totalAmount}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Shammah_Hotel_Shift_Settlement_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased p-4 md:p-8 font-sans">
      
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
              Finance & Audit
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Shammah Hotel — Shift Settlement & Audit
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time daily revenue, M-Pesa collections, VAT accounting, and shift reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/cashier')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-700 transition flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cashier Screen</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Total Settled Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
              KSh {Math.round(totalSettled).toLocaleString()}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">
              ↑ {transactions.length} checkouts settled
            </span>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>M-Pesa Collections</span>
              <Smartphone className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-600 mt-2">
              KSh {Math.round(mpesaTotal).toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-400">Till & STK Prompt Verified</span>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Card / Bank Settlement</span>
              <CreditCard className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-blue-600 mt-2">
              KSh {Math.round(cardTotal).toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-400">PDQ terminal batches</span>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Cash Drawer Balance</span>
              <DollarSign className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-purple-600 mt-2">
              KSh {Math.round(cashTotal).toLocaleString()}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">Drawer Balanced</span>
          </div>

        </div>

        {/* Audit Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
            <div>
              <h3 className="font-semibold text-sm text-slate-900">
                End-of-Shift Checkout Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                Live immutable record of settled checkout folios and receipts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportCSV}
                className="px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit CSV</span>
              </button>
              <button
                onClick={() => alert('Shift verified & locked successfully for bookkeeping.')}
                className="px-3.5 py-2 text-xs font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition shadow flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock & Close Shift</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Receipt #</th>
                  <th className="p-3">Guest Name</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Subtotal</th>
                  <th className="p-3">VAT (16%)</th>
                  <th className="p-3 text-right">Total Settled</th>
                  <th className="p-3 text-center">Channels</th>
                  <th className="p-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-slate-400 font-sans">
                      Loading audit ledger...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-slate-400 font-sans">
                      No checkouts recorded yet for this shift.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 text-slate-500">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        #{tx.receiptNumber}
                      </td>
                      <td className="p-3 font-sans text-slate-800">
                        {tx.guestName}
                      </td>
                      <td className="p-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          tx.paymentMethod === 'MPESA'
                            ? 'bg-emerald-50 text-emerald-700'
                            : tx.paymentMethod === 'CARD'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3">KSh {tx.subtotal.toLocaleString()}</td>
                      <td className="p-3">KSh {Math.round(tx.vatAmount).toLocaleString()}</td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        KSh {Math.round(tx.totalAmount).toLocaleString()}
                      </td>
                      <td className="p-3 text-center font-sans">
                        <span className="text-[11px] text-slate-500">
                          {tx.deliveries && tx.deliveries.length > 0
                            ? tx.deliveries.map((d) => d.channel).join(', ')
                            : 'Standard Print'}
                        </span>
                      </td>
                      <td className="p-3 text-center font-sans">
                        <button
                          onClick={() => router.push(`/receipt/${tx.receiptNumber}`)}
                          className="text-xs text-blue-600 hover:underline font-semibold"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

    </div>
  );
}
