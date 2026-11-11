'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Hotel,
  Plus,
  Trash2,
  DollarSign,
  CreditCard,
  Smartphone,
  CheckCircle2,
  LogOut,
  Send,
  MessageCircle,
  FileText
} from 'lucide-react';

interface FolioItem {
  id: string;
  datesLabel: string;
  description: string;
  category: string;
  amount: number;
  nights: number;
}

export default function CashierPage() {
  const router = useRouter();

  // Guest & Folio Form State
  const [guestName, setGuestName] = useState('Alexander Wright');
  const [guestPhone, setGuestPhone] = useState('+254712345678');
  const [guestEmail, setGuestEmail] = useState('a.wright@corp.com');

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'MPESA'>('MPESA');

  // Multi-channel delivery checkboxes
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSMS, setSendSMS] = useState(true);

  const [loading, setLoading] = useState(false);

  // Folio Items
  const [items, setItems] = useState<FolioItem[]>([
    {
      id: '1',
      datesLabel: 'Nov 07 → Nov 10',
      description: 'Deluxe Suite (3 Nights @ KSh 6,500/night)',
      category: 'ROOM',
      amount: 19500,
      nights: 3,
    },
    {
      id: '2',
      datesLabel: 'Nov 08',
      description: 'Shammah Restaurant (Dinner & Drinks)',
      category: 'FNB',
      amount: 3200,
      nights: 0,
    },
    {
      id: '3',
      datesLabel: 'Nov 09',
      description: 'Minibar (Beverages & Snacks)',
      category: 'MINIBAR',
      amount: 850,
      nights: 0,
    },
    {
      id: '4',
      datesLabel: 'Nov 10',
      description: 'Late Checkout Fee (2 Hours)',
      category: 'SERVICE',
      amount: 1500,
      nights: 0,
    },
  ]);

  // Modal States
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showIncidentalModal, setShowIncidentalModal] = useState(false);

  // Room Modal State
  const [roomType, setRoomType] = useState('Deluxe Room');
  const [roomRate, setRoomRate] = useState(6500);
  const [checkIn, setCheckIn] = useState('2026-11-10');
  const [checkOut, setCheckOut] = useState('2026-11-12');
  const [nights, setNights] = useState(2);

  // Incidental Modal State
  const [incidentalItem, setIncidentalItem] = useState('Restaurant - Dinner Buffet (KSh 2,500)');
  const [incidentalPrice, setIncidentalPrice] = useState(2500);
  const [incidentalCat, setIncidentalCat] = useState('F&B');

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.16;
  const totalDue = subtotal + vat;

  function handleDateChange(d1Str: string, d2Str: string) {
    const d1 = new Date(d1Str);
    const d2 = new Date(d2Str);
    let diffNights = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    if (isNaN(diffNights) || diffNights < 1) diffNights = 1;
    setNights(diffNights);
  }

  function addRoomCharge() {
    const d1 = new Date(checkIn + 'T00:00:00');
    const d2 = new Date(checkOut + 'T00:00:00');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const datesLabel = `${months[d1.getMonth()]} ${String(d1.getDate()).padStart(2, '0')} → ${months[d2.getMonth()]} ${String(d2.getDate()).padStart(2, '0')}`;
    const totalAmount = nights * roomRate;

    const newItem: FolioItem = {
      id: Math.random().toString(),
      datesLabel,
      description: `${roomType} (${nights} Night${nights > 1 ? 's' : ''} @ KSh ${roomRate.toLocaleString()}/night)`,
      category: 'ROOM',
      amount: totalAmount,
      nights,
    };

    setItems([...items, newItem]);
    setShowRoomModal(false);
  }

  function addIncidental() {
    const newItem: FolioItem = {
      id: Math.random().toString(),
      datesLabel: 'Nov 10',
      description: incidentalItem,
      category: incidentalCat,
      amount: incidentalPrice,
      nights: 0,
    };

    setItems([...items, newItem]);
    setShowIncidentalModal(false);
  }

  function removeItem(id: string) {
    setItems(items.filter((i) => i.id !== id));
  }

  async function handleCompleteCheckout() {
    if (!items.length) {
      alert('Please add at least one charge item to checkout');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/checkouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName,
          guestPhone,
          guestEmail,
          items,
          paymentMethod,
          dispatchOptions: {
            whatsapp: sendWhatsApp,
            email: sendEmail,
            sms: sendSMS,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete checkout');

      // Navigate to the newly generated receipt page
      router.push(`/receipt/${data.receiptNumber}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('An unexpected error occurred during checkout');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased p-4 md:p-8 font-sans">
      
      {/* Top Header */}
      <header className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Front-Desk Terminal
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Shammah Hotel — Guest Checkout
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time folio adjustments, payment processing, and multi-channel receipt delivery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/accountant')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
          >
            📊 Accountant Audit
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

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Guest Info & Folio Table (8 Cols) */}
        <section className="lg:col-span-8 flex flex-col gap-5">
          
          {/* Guest Information Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-medium">Guest Full Name</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-medium">Phone (WhatsApp / SMS)</label>
              <input
                type="text"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-medium">Email Address</label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
              />
            </div>
          </div>

          {/* Charges Ledger */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white">
              <div>
                <h2 className="font-semibold text-sm text-slate-900">Itemized Charges</h2>
                <p className="text-xs text-slate-500">Add room nights by date or append hotel incidentals</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRoomModal(true)}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Room Charge</span>
                </button>
                <button
                  onClick={() => setShowIncidentalModal(true)}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Incidental</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Dates / Time</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td className="p-3 text-slate-500 font-mono">{it.datesLabel}</td>
                      <td className="p-3 font-medium text-slate-900">{it.description}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          it.category === 'ROOM' ? 'bg-blue-50 text-blue-700' :
                          it.category === 'FNB' ? 'bg-amber-50 text-amber-700' :
                          it.category === 'MINIBAR' ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {it.category}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-medium text-slate-900">
                        KSh {it.amount.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => removeItem(it.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold text-slate-900">
                  KSh {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>VAT (16%):</span>
                <span className="font-mono font-semibold text-slate-900">
                  KSh {Math.round(vat).toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-900">Total Due:</span>
                <span className="font-mono text-base text-blue-600">
                  KSh {Math.round(totalDue).toLocaleString()}
                </span>
              </div>
            </div>

          </div>

        </section>

        {/* Right Column: Payment & Multi-Channel Receipt Dispatch (4 Cols) */}
        <section className="lg:col-span-4 flex flex-col gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-full space-y-6">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h2 className="font-semibold text-sm text-slate-900">Payment & Dispatch</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">
                  Ready to Settle
                </span>
              </div>

              {/* Payment Method Selector */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Payment Method Tendered
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'CASH'
                        ? 'border-2 border-blue-600 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <DollarSign className="w-5 h-5 text-slate-700" />
                    <span className="text-xs font-bold text-slate-800">Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'CARD'
                        ? 'border-2 border-blue-600 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-slate-700" />
                    <span className="text-xs font-bold text-slate-800">Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MPESA')}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'MPESA'
                        ? 'border-2 border-emerald-600 bg-emerald-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">M-Pesa</span>
                  </button>
                </div>
              </div>

              {/* Multi-Channel Receipt Options */}
              <div className="mt-6 space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Guest Receipt Delivery Channels
                </label>

                {/* WhatsApp Document PDF */}
                <label className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Send WhatsApp PDF</p>
                      <p className="text-[11px] text-slate-500">Direct PDF document via WhatsApp</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={sendWhatsApp}
                    onChange={(e) => setSendWhatsApp(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                </label>

                {/* SMS Link */}
                <label className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Send SMS Web Link</p>
                      <p className="text-[11px] text-slate-500">Short link for mobile viewing</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={sendSMS}
                    onChange={(e) => setSendSMS(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                </label>

                {/* Email PDF */}
                <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Send Email Invoice</p>
                      <p className="text-[11px] text-slate-500">HTML summary with PDF attachment</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="w-4 h-4 text-slate-600 rounded border-slate-300"
                  />
                </label>
              </div>

            </div>

            {/* Settle Action Button */}
            <div className="pt-5 border-t border-slate-200">
              <button
                type="button"
                disabled={loading}
                onClick={handleCompleteCheckout}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {loading
                    ? 'Processing & Dispatching...'
                    : `Settle & Dispatch (KSh ${Math.round(totalDue).toLocaleString()})`}
                </span>
              </button>
              <p className="text-center text-[11px] text-slate-400 mt-2">
                Generates invoice, releases room, and delivers receipts
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* Room Stay Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900">🛏️ Add Room Stay Charge</h3>
              <button onClick={() => setShowRoomModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Room Tier</label>
                <select
                  value={roomType}
                  onChange={(e) => {
                    setRoomType(e.target.value);
                    const rates: Record<string, number> = {
                      'Deluxe Room': 6500,
                      'Executive Suite': 9500,
                      'Standard Room': 4500,
                      'Family Villa': 14000,
                    };
                    setRoomRate(rates[e.target.value] || 6500);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                >
                  <option value="Deluxe Room">Deluxe Room (KSh 6,500/night)</option>
                  <option value="Executive Suite">Executive Suite (KSh 9,500/night)</option>
                  <option value="Standard Room">Standard Room (KSh 4,500/night)</option>
                  <option value="Family Villa">Family Villa (KSh 14,000/night)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Check-in Date</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      handleDateChange(e.target.value, checkOut);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Check-out Date</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => {
                      setCheckOut(e.target.value);
                      handleDateChange(checkIn, e.target.value);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                <span>Calculated Charge ({nights} Nights):</span>
                <span className="font-mono font-bold text-blue-600">
                  KSh {(nights * roomRate).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2 border-t border-slate-200">
              <button onClick={() => setShowRoomModal(false)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">Cancel</button>
              <button onClick={addRoomCharge} className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">Post to Folio</button>
            </div>
          </div>
        </div>
      )}

      {/* Incidental Modal */}
      {showIncidentalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900">🍸 Add Incidental Charge</h3>
              <button onClick={() => setShowIncidentalModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Item Category</label>
                <select
                  value={incidentalItem}
                  onChange={(e) => {
                    setIncidentalItem(e.target.value);
                    const prices: Record<string, { price: number; cat: string }> = {
                      'Restaurant - Dinner Buffet (KSh 2,500)': { price: 2500, cat: 'F&B' },
                      'Laundry & Dry Cleaning (KSh 1,200)': { price: 1200, cat: 'SERVICE' },
                      'Minibar - Wine & Drinks (KSh 1,800)': { price: 1800, cat: 'MINIBAR' },
                      'Lost Key Card Replacement (KSh 500)': { price: 500, cat: 'FEE' },
                    };
                    const item = prices[e.target.value] || { price: 2500, cat: 'F&B' };
                    setIncidentalPrice(item.price);
                    setIncidentalCat(item.cat);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                >
                  <option value="Restaurant - Dinner Buffet (KSh 2,500)">Shammah Restaurant: Dinner Buffet (KSh 2,500)</option>
                  <option value="Laundry & Dry Cleaning (KSh 1,200)">Laundry: Wash & Press (KSh 1,200)</option>
                  <option value="Minibar - Wine & Drinks (KSh 1,800)">Minibar: Wine & Drinks (KSh 1,800)</option>
                  <option value="Lost Key Card Replacement (KSh 500)">Fee: Keycard Replacement (KSh 500)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2 border-t border-slate-200">
              <button onClick={() => setShowIncidentalModal(false)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">Cancel</button>
              <button onClick={addIncidental} className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">Post Incidental</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
