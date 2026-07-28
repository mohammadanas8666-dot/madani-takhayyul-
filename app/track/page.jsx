'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { 
  Truck, 
  Search, 
  CheckCircle2, 
  Clock, 
  Package, 
  MapPin, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

const STATUS_STEPS = ['Pending', 'Shipped', 'Out for Delivery', 'Delivered'];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [order, setOrder] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { currentUser } = useAuth();

  const fetchOrderById = async (idToFetch) => {
    if (!idToFetch) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${idToFetch}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError('Order not found. Please double-check your Order ID.');
        setOrder(null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load order tracking details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      fetchOrderById(initialOrderId);
    } else if (currentUser) {
      // Fetch user's order history
      fetch(`/api/orders?userId=${currentUser.uid}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.orders) {
            setUserOrders(data.orders);
            if (data.orders.length > 0) {
              setOrder(data.orders[0]);
              setOrderIdInput(data.orders[0]._id);
            }
          }
        })
        .catch((err) => console.error(err));
    }
  }, [initialOrderId, currentUser]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (orderIdInput) {
      fetchOrderById(orderIdInput);
    }
  };

  const getStepStatusIndex = (status) => {
    const idx = STATUS_STEPS.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-400 border border-gold-500/30 flex items-center justify-center mx-auto mb-2">
            <Truck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Track Your Order</h1>
          <p className="text-slate-400 text-xs">
            Enter your Order ID below to get real-time tracking updates on your package.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10">
          <div className="relative flex items-center">
            <input
              type="text"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="Paste Order ID (e.g. 64b8a...)"
              className="w-full bg-dark-900 border border-gold-900/40 rounded-2xl pl-4 pr-32 py-3.5 text-sm text-white focus:outline-none focus:border-gold-500 shadow-xl"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 px-5 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-500 text-dark-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Track
            </button>
          </div>
        </form>

        {error && (
          <div className="max-w-xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* User Order Selection list */}
        {userOrders.length > 1 && !initialOrderId && (
          <div className="mb-8 p-4 bg-dark-900/60 border border-gold-900/40 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Your Recent Orders
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {userOrders.map((o) => (
                <button
                  key={o._id}
                  onClick={() => {
                    setOrder(o);
                    setOrderIdInput(o._id);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    order?._id === o._id
                      ? 'bg-gold-500/20 text-gold-300 border-gold-500/40'
                      : 'bg-dark-950 text-slate-400 border-gold-900/40 hover:text-white'
                  }`}
                >
                  Order #{o._id.substring(0, 8)}... (₹{o.totalAmount})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Order Tracking Display */}
        {order && (
          <div className="bg-dark-900/80 border border-gold-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gold-900/40 pb-6 gap-4">
              <div>
                <span className="text-xs text-slate-400 block">Order ID</span>
                <span className="text-lg font-black text-gold-400 font-mono">{order._id}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Tracking Number</span>
                <span className="text-sm font-bold text-white font-mono">
                  {order.trackingId || 'Pending Dispatch Assignment'}
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-xs text-slate-400 block">Current Status</span>
                <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-extrabold bg-gold-500/20 text-gold-300 border border-gold-500/30">
                  {order.status}
                </span>
              </div>
            </div>

            {/* Step Progress Bar Timeline */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                Delivery Timeline
              </h3>

              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
                {/* Connecting Line for desktop */}
                <div className="hidden md:block absolute top-5 left-10 right-10 h-1 bg-dark-800 -z-0" />
                <div
                  className="hidden md:block absolute top-5 left-10 h-1 bg-gold-500 transition-all duration-500 -z-0"
                  style={{
                    width: `${(getStepStatusIndex(order.status) / (STATUS_STEPS.length - 1)) * 85}%`,
                  }}
                />

                {STATUS_STEPS.map((step, idx) => {
                  const currentIdx = getStepStatusIndex(order.status);
                  const isCompleted = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={step} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-all ${
                          isCompleted
                            ? 'bg-gold-500 text-dark-950 ring-4 ring-gold-500/20'
                            : 'bg-dark-800 text-slate-500 border border-gold-900/50'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>

                      <div className="md:text-center">
                        <span
                          className={`text-xs font-extrabold block ${
                            isCurrent ? 'text-gold-400' : isCompleted ? 'text-white' : 'text-slate-500'
                          }`}
                        >
                          {step}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {isCompleted ? 'Done' : 'Upcoming'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Address & Items summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gold-900/40">
              
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gold-400" /> Shipping Destination
                </h4>
                <div className="p-4 bg-dark-950 rounded-2xl text-xs space-y-1 text-slate-300 border border-gold-900/40/80">
                  <p className="font-bold text-white">{order.shippingAddress?.fullName || order.customerName}</p>
                  <p>{order.shippingAddress?.address}</p>
                  <p>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                  </p>
                  <p className="text-slate-400 font-mono">Phone: {order.shippingAddress?.phone}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-gold-400" /> Package Items ({order.items?.length || 0})
                </h4>
                <div className="p-4 bg-dark-950 rounded-2xl text-xs space-y-2 text-slate-300 border border-gold-900/40/80 max-h-40 overflow-y-auto">
                  {order.items?.map((it, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-slate-900 pb-1.5 last:border-0">
                      <span className="font-semibold text-white truncate max-w-[200px]">{it.name}</span>
                      <span className="text-slate-400">
                        {it.quantity} x ₹{it.price}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gold-900/40 flex justify-between font-bold text-white">
                    <span>Total Amount</span>
                    <span className="text-gold-400">₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-950 flex items-center justify-center text-gold-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
