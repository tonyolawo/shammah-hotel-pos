'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hotel, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      router.push(data.redirectTo || '/cashier');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }

  function quickFill(userType: 'cashier' | 'accountant') {
    if (userType === 'cashier') {
      setEmail('cashier@shammah.co.ke');
      setPassword('cashier123');
    } else {
      setEmail('finance@shammah.co.ke');
      setPassword('accountant123');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
            <Hotel className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Shammah Hotel POS
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to access your checkout or accounting terminal
          </p>
        </div>

        {/* Demo Quick Logins */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Quick Demo Credentials:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => quickFill('cashier')}
              className="text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 transition text-xs"
            >
              <div className="font-semibold text-slate-800">🛎️ Cashier</div>
              <div className="text-[10px] text-slate-400">cashier@shammah.co.ke</div>
            </button>
            <button
              type="button"
              onClick={() => quickFill('accountant')}
              className="text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-purple-500 transition text-xs"
            >
              <div className="font-semibold text-slate-800">📊 Accountant</div>
              <div className="text-[10px] text-slate-400">finance@shammah.co.ke</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@shammah.co.ke"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Terminal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
