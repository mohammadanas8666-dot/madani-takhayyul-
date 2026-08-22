'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminNav from '@/components/AdminNav';
import { adminFetch } from '@/lib/adminFetch';
import {
  ShoppingBag,
  Truck,
  Search,
  Edit3,
  Clock,
  MapPin,
  Loader2,
  User,
  Eye,
  FileText,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  Phone,
} from 'lucide-react';

const ALLOWED_STATUSES = ['Pending', 'Shipped', 'Out for Delivery', 'Delivered'];
const PLACEHOLDER_IMG = 'https://placehold.co/200x200/1a1e2e/d4af37?text=KAZRI';

// Exact date + time (down to the second) for "which product sold when"
const formatExactDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewingOrder, setViewingOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Tracking ID Edit Modal state
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newTrackingId, setNewTrackingId] = useState('');
  const [updating, setUpdating] = useState(false);

  // Product gallery (slideshow) popup state — shows every item sold in an order
  const [galleryOrder, setGalleryOrder] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Delete state
  const [deletingId, setDeletingId] = useState(null);

  const fetchOrders = async (pageToFetch = 1) => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/orders?page=${pageToFetch}&limit=50`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        if (data.pagination) {
          setPagination({ total: data.pagination.total, pages: data.pagination.pages });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

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
      const res = await adminFetch(`/api/orders/${editingOrder._id}`, {
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
        fetchOrders(page);
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

  const handleDeleteOrder = async (order) => {
    const confirmed = confirm(
      `Delete this order permanently?\n\nOrder: ${order._id}\nCustomer: ${order.customerName}\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(order._id);
    try {
      const res = await adminFetch(`/api/orders/${order._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o._id !== order._id));
        if (viewingOrder?._id === order._id) setViewingOrder(null);
        if (galleryOrder?._id === order._id) setGalleryOrder(null);
      } else {
        alert(data.error || 'Failed to delete order');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting order');
    } finally {
      setDeletingId(null);
    }
  };

  const openGallery = (order) => {
    setGalleryOrder(order);
    setGalleryIndex(0);
  };

  const closeGallery = () => {
    setGalleryOrder(null);
    setGalleryIndex(0);
  };

  const nextSlide = () => {
    if (!galleryOrder) return;
    setGalleryIndex((i) => (i + 1) % galleryOrder.items.length);
  };

  const prevSlide = () => {
    if (!galleryOrder) return;
    setGalleryIndex((i) => (i - 1 + galleryOrder.items.length) % galleryOrder.items.length);
  };

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shippingAddress?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.trackingId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const currentGalleryItem = galleryOrder?.items?.[galleryIndex];

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
                  <th className="p-4">Product</th>
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4">Tracking ID</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-900/20">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gold-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No orders matching current filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const firstItem = order.items?.[0];
                    const extraCount = (order.items?.length || 0) - 1;

                    return (
                      <tr key={order._id} className="hover:bg-dark-800/40 transition-colors">
                        {/* Product DP-style thumbnail — click opens the full slideshow */}
                        <td className="p-4">
                          <button
                            onClick={() => openGallery(order)}
                            title="View products sold in this order"
                            className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-gold-900/50 hover:border-gold-500 transition-all shrink-0"
                          >
                            <Image
                              src={firstItem?.image || PLACEHOLDER_IMG}
                              alt=""
                              fill
                              unoptimized
                              className="object-cover"
                            />
                            {extraCount > 0 && (
                              <span className="absolute bottom-0 right-0 bg-gold-500 text-dark-950 text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-dark-950">
                                +{extraCount}
                              </span>
                            )}
                          </button>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-gold-400 block text-xs">{order._id}</span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {formatExactDateTime(order.createdAt)}
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span className="font-bold text-white block">{order.customerName}</span>
                          <span className="text-[10px] text-slate-400 block">{order.customerEmail}</span>
                          {order.shippingAddress?.phone && (
                            <span className="text-[10px] text-gold-400/90 flex items-center gap-1 mt-0.5">
                              <Phone className="w-2.5 h-2.5" />
                              {order.shippingAddress.phone}
                            </span>
                          )}
                        </td>

                        <td className="p-4 font-black text-white text-sm whitespace-nowrap">
                          ₹{order.totalAmount}
                        </td>

                        <td className="p-4 whitespace-nowrap">
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

                        <td className="p-4 font-mono text-slate-300 whitespace-nowrap">
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
                            <button
                              onClick={() => handleDeleteOrder(order)}
                              disabled={deletingId === order._id}
                              title="Delete this order"
                              className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 transition-all disabled:opacity-50"
                            >
                              {deletingId === order._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-gold-900/30">
              <span className="text-xs text-slate-400">
                Page {page} of {pagination.pages} &middot; {pagination.total} orders total
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-800/70 text-slate-300 hover:text-white border border-gold-900/40 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page >= pagination.pages || loading}
                  className="px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-800/70 text-slate-300 hover:text-white border border-gold-900/40 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Product Gallery Slideshow Popup — every item sold in this order */}
      {galleryOrder && currentGalleryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-dark-950/90 backdrop-blur-sm" onClick={closeGallery} />

          <div className="relative w-full max-w-sm bg-dark-900 border border-gold-900/40 rounded-3xl p-5 text-white z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gold-900/40 pb-3">
              <h3 className="text-sm font-black flex items-center gap-2">
                <Package className="w-4 h-4 text-gold-400" />
                Products Sold {galleryOrder.items.length > 1 && `(${galleryIndex + 1}/${galleryOrder.items.length})`}
              </h3>
              <button onClick={closeGallery} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slide image with left/right navigation */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-dark-950 border border-gold-900/40">
              <Image
                src={currentGalleryItem.image || PLACEHOLDER_IMG}
                alt={currentGalleryItem.name}
                fill
                unoptimized
                className="object-cover"
              />

              {galleryOrder.items.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-dark-950/80 text-white hover:bg-gold-500 hover:text-dark-950 transition-colors border border-gold-900/50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-dark-950/80 text-white hover:bg-gold-500 hover:text-dark-950 transition-colors border border-gold-900/50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Dot indicators */}
            {galleryOrder.items.length > 1 && (
              <div className="flex justify-center gap-1.5">
                {galleryOrder.items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setGalleryIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === galleryIndex ? 'bg-gold-400 w-5' : 'bg-dark-700 w-1.5'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Product Info */}
            <div className="text-center">
              <h4 className="font-bold text-white text-sm">{currentGalleryItem.name}</h4>
              <p className="text-gold-400 font-black text-base mt-0.5">
                ₹{currentGalleryItem.price} <span className="text-slate-400 font-normal text-xs">x {currentGalleryItem.quantity}</span>
              </p>
            </div>

            {/* Sale metadata — exact date, time, customer */}
            <div className="bg-dark-950 border border-gold-900/40 rounded-xl p-3 text-xs text-slate-400 space-y-1.5">
              <p className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-gold-400" />
                Sold to: <span className="text-white font-semibold">{galleryOrder.customerName}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-gold-400" />
                Exact Date & Time: <span className="text-white font-semibold">{formatExactDateTime(galleryOrder.createdAt)}</span>
              </p>
            </div>
          </div>
        </div>
      )}

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
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-gold-400" />
              {formatExactDateTime(viewingOrder.createdAt)}
            </div>

            {/* Customer */}
            <div className="bg-dark-950 border border-gold-900/40 rounded-2xl p-4 space-y-1">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gold-400 mb-1">Customer</h4>
              <p className="font-bold text-white">{viewingOrder.customerName}</p>
              <p className="text-xs text-slate-400">{viewingOrder.customerEmail}</p>
              {viewingOrder.shippingAddress?.phone && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-gold-400" />
                  {viewingOrder.shippingAddress.phone}
                </p>
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
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gold-400">Items Ordered</h4>
                <button
                  onClick={() => openGallery(viewingOrder)}
                  className="text-[10px] font-bold text-gold-400 hover:text-gold-300 underline"
                >
                  View Photos
                </button>
              </div>
              {viewingOrder.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-gold-900/40 shrink-0 bg-dark-900">
                    <Image src={item.image || PLACEHOLDER_IMG} alt="" fill unoptimized className="object-cover" />
                  </div>
                  <span className="text-slate-300 flex-1">{item.name} x {item.quantity}</span>
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

            <div className="flex gap-3">
              <Link
                href={`/admin/orders/${viewingOrder._id}/invoice`}
                target="_blank"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-950 font-black text-sm shadow-lg"
              >
                <FileText className="w-4 h-4" /> Download / Print Bill
              </Link>
              <button
                onClick={() => handleDeleteOrder(viewingOrder)}
                disabled={deletingId === viewingOrder._id}
                className="px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 font-bold text-sm transition-all disabled:opacity-50"
              >
                {deletingId === viewingOrder._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
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
