'use client';

import { useState, useEffect } from 'react';
import AdminNav from '@/components/AdminNav';
import { DollarSign, ArrowUpRight, Clock, CheckCircle2, Loader2, TrendingUp } from 'lucide-react';

export default function AdminBalancePage() {
  const [summary, setSummary] = useState({
    totalSales: 0,
    pendingPayout: 0,
    paidOut: 0,
    totalOrders: 0,
  });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/balance');
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary || {});
        setRecords(data.records || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Title */}
        <div className="flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-black text-white">Financial Balance & Revenue</h2>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales</span>
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-white mt-4">₹{summary.totalSales || 0}</p>
            <p className="text-[11px] text-slate-400 mt-1">Across {summary.totalOrders || 0} total customer orders</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Payout</span>
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-amber-400 mt-4">₹{summary.pendingPayout || 0}</p>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting order delivery fulfillment</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settled Payouts</span>
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-blue-400 mt-4">₹{summary.paidOut || 0}</p>
            <p className="text-[11px] text-slate-400 mt-1">Settled on delivered orders</p>
          </div>
        </div>

        {/* Order-wise Revenue Breakdown Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-6">
          <h3 className="text-base font-black text-white">Order-wise Revenue View</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Order Status</th>
                  <th className="p-3">Payout Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-emerald-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No revenue transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  records.map((rec) => (
                    <tr key={rec._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-emerald-400">
                        {rec.orderId?._id || rec.orderId || 'N/A'}
                      </td>

                      <td className="p-3 font-semibold text-white">
                        {rec.orderId?.customerName || 'Valued Customer'}
                      </td>

                      <td className="p-3 font-black text-white text-sm">
                        ₹{rec.amount}
                      </td>

                      <td className="p-3">
                        <span className="text-slate-300 text-[11px] font-semibold">
                          {rec.orderId?.status || 'Pending'}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                            rec.payoutStatus === 'Paid'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {rec.payoutStatus}
                        </span>
                      </td>

                      <td className="p-3 text-slate-500 text-[11px]">
                        {new Date(rec.createdAt).toLocaleDateString()}
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
