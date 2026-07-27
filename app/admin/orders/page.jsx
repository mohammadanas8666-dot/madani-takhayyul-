'use client';

import { useState, useEffect } from 'react';
import AdminNav from '@/components/AdminNav';
import { 
  ShoppingBag, 
  Truck, 
  Search, 
  Edit3, 
  Check, 
  Clock, 
  MapPin, 
  Loader2, 
  User 
} from 'lucide-react';

const ALLOWED_STATUSES = ['Pending', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Tracking ID Edit Modal state
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newTrackingId, setNewTrackingId] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenEdit = (order) => {
    setEditingOrder(order);
    setNewStatus(order.status);
    setNewTrackingId(order.trackingId || '');
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${editingOrder._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          trackingId: newTrackingId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingOrder(null);
        fetchOrders();
      } else {
        alert(data.error || 'Failed to update order');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating order');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.trackingId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-black text-white">Order Management ({orders.length})</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter buttons */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
              {['All', ...ALLOWED_STATUSES].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4">Tracking ID</th>
                  <th className="p-4 text-right">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-emerald-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No orders matching current filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-emerald-400 block text-xs">{order._id}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-white block">{order.customerName}</span>
                        <span className="text-[10px] text-slate-400 block">{order.customerEmail}</span>
                      </td>

                      <td className="p-4 font-black text-white text-sm">
                        ₹{order.totalAmount}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : order.status === 'Out for Delivery'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : order.status === 'Shipped'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-slate-300">
                        {order.trackingId || <span className="text-slate-600 text-[11px]">Unassigned</span>}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(order)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-slate-950 font-bold text-xs border border-emerald-500/30 transition-all flex items-center gap-1 ml-auto"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit Status
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

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setEditingOrder(null)} />

          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                Update Order Status
              </h3>
              <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-400 space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <p>Order ID: <strong className="text-white font-mono">{editingOrder._id}</strong></p>
              <p>Customer: <strong className="text-white">{editingOrder.customerName}</strong></p>
            </div>

            <form onSubmit={handleSaveUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Order Status (Flow Step)
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {ALLOWED_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tracking ID / Courier Code
                </label>
                <input
                  type="text"
                  value={newTrackingId}
                  onChange={(e) => setNewTrackingId(e.target.value)}
                  placeholder="e.g. TRK-987654321"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg"
                >
                  {updating ? 'Saving...' : 'Update Order'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
