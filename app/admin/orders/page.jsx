'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  User,
  Eye,
  FileText,
  X
} from 'lucide-react';

const ALLOWED_STATUSES = ['Pending', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewingOrder, setViewingOrder] = useState(null);

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
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col">
      <AdminNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-gold-400" />
            <h2 className="text-2xl font-black text-white">Order Management ({orders.length})</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter buttons */}
            <div className="flex bg-dark-900 border border-gold-900/40 rounded-xl p-1">
              {['All', ...ALLOWED_STATUSES].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-gold-500 text-dark-950 font-bold'
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
                className="bg-dark-900 border border-gold-900/40 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-dark-900/80 border border-gold-900/40 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-dark-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-gold-900/40">
                <tr>
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4">Tracking ID</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-900/20/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gold-400">
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
                    <tr key={order._id} className="hover:bg-dark-800/40 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-gold-400 block text-xs">{order._id}</span>
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
                              ? 'bg-gold-500/20 text-gold-300 border-gold-500/40'
                              : order.status === 'Out for Delivery'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : order.status === 'Shipped'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-dark-800 text-slate-300 border-gold-900/50'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-slate-300">
                        {order.trackingId || <span className="text-slate-600 text-[11px]">Unassigned</span>}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingOrder(order)}
                            title="View full order details"
                            className="p-1.5 rounded-xl bg-dark-800 hover:bg-dark-800/70 text-slate-300 hover:text-white border border-gold-900/40 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/admin/orders/${order._id}/invoice`}
                            target="_blank"
                            title="Download / print bill"
                            className="p-1.5 rounded-xl bg-dark-800 hover:bg-dark-800/70 text-slate-300 hover:text-white border border-gold-900/40 transition-all"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(order)}
                            className="px-3 py-1.5 rounded-xl bg-gold-600/20 hover:bg-gold-600 text-gold-400 hover:text-dark-950 font-bold text-xs border border-gold-500/30 transition-all flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* View Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setViewingOrder(null)} />

          <div className="relative w-full max-w-lg bg-dark-900 border border-gold-900/40 rounded-3xl p-6 text-white z-10 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gold-900/40 pb-3">
              <h3 className="text-base font-black flex items-center gap-2">
                <User className="w-5 h-5 text-gold-400" />
                Order Details
              </h3>
              <button onClick={() => setViewingOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-500 font-mono">{viewingOrder._id}</div>

            {/* Customer */}
            <div className="bg-dark-950 border border-gold-900/40 rounded-2xl p-4 space-y-1">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gold-400 mb-1">Customer</h4>
              <p className="font-bold text-white">{viewingOrder.customerName}</p>
              <p className="text-xs text-slate-400">{viewingOrder.customerEmail}</p>
              {viewingOrder.shippingAddress?.phone && (
                <p className="text-xs text-slate-400">{viewingOrder.shippingAddress.phone}</p>
              )}
            </div>

            {/* Shipping Address */}
            {viewingOrder.shippingAddress?.address && (
              <div className="bg-dark-950 border border-gold-900/40 rounded-2xl p-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gold-400 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Shipping Address
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {viewingOrder.shippingAddress.address}, {viewingOrder.shippingAddress.city}, {viewingOrder.shippingAddress.state} - {viewingOrder.shippingAddress.postalCode}
                </p>
              </div>
            )}

            {/* Items */}
            <div className="bg-dark-950 border border-gold-900/40 rounded-2xl p-4 space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gold-400 mb-1">Items Ordered</h4>
              {viewingOrder.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-slate-300">{item.name} x {item.quantity}</span>
                  <span className="font-bold text-white">₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-black text-gold-400 border-t border-gold-900/40 pt-2 mt-2">
                <span>Total</span>
                <span>₹{viewingOrder.totalAmount}</span>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-dark-950 border border-gold-900/40 rounded-2xl p-4 text-xs text-slate-400 space-y-1">
              <p>Payment Method: <span className="text-white font-semibold">
                {viewingOrder.paymentId === 'COD' ? 'Cash on Delivery' : viewingOrder.paymentId === 'WHATSAPP' ? 'WhatsApp Order' : 'Online Payment'}
              </span></p>
              <p>Payment Status: <span className="text-white font-semibold">{viewingOrder.paymentStatus}</span></p>
              <p>Fulfillment Status: <span className="text-white font-semibold">{viewingOrder.status}</span></p>
            </div>

            <Link
              href={`/admin/orders/${viewingOrder._id}/invoice`}
              target="_blank"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-950 font-black text-sm shadow-lg"
            >
              <FileText className="w-4 h-4" /> Download / Print Bill
            </Link>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setEditingOrder(null)} />

          <div className="relative w-full max-w-md bg-dark-900 border border-gold-900/40 rounded-3xl p-6 text-white z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gold-900/40 pb-3">
              <h3 className="text-base font-black flex items-center gap-2">
                <Truck className="w-5 h-5 text-gold-400" />
                Update Order Status
              </h3>
              <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-400 space-y-1 bg-dark-950 p-3 rounded-xl border border-gold-900/40">
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
                  className="w-full bg-dark-950 border border-gold-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
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
                  className="w-full bg-dark-950 border border-gold-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gold-900/40">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 rounded-xl bg-dark-800 text-slate-300 text-xs font-semibold hover:bg-dark-800/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-gold-600 hover:bg-gold-500 text-dark-950 font-extrabold text-xs shadow-lg"
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