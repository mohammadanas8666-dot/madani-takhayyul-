'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  CreditCard,
  ShieldCheck,
  MapPin,
  Loader2,
  ArrowLeft,
  MessageCircle,
  Truck,
  Clock,
} from 'lucide-react';

// Store WhatsApp number for order confirmations (with country code, no + or spaces)
const WHATSAPP_NUMBER = '917338152480';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const { currentUser, dbUser } = useAuth();
  const formRef = useRef(null);

  const [address, setAddress] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const [loadingAction, setLoadingAction] = useState(null); // 'whatsapp' | 'cod' | null
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setAddress((prev) => ({
        ...prev,
        fullName: dbUser?.name || currentUser.displayName || prev.fullName,
        email: currentUser.email || prev.email,
      }));
    }
  }, [currentUser, dbUser]);

  const shippingFee = 0; // Delivery is always free storewide
  const grandTotal = cartTotal + shippingFee;

  const handleInputChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const buildOrderItems = () =>
    cart.map((item) => ({
      productId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.images?.[0] || '',
    }));

  const buildShippingAddress = () => ({
    fullName: address.fullName,
    address: address.street,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    phone: address.phone,
  });

  const validateBeforeOrder = () => {
    setError('');
    if (cart.length === 0) {
      setError('Your cart is empty. Please add products before checking out.');
      return false;
    }
    if (formRef.current && !formRef.current.reportValidity()) {
      return false;
    }
    return true;
  };

  // Create a Pending (unpaid, Cash on Delivery) order in the database
  const handleCodOrder = async () => {
    if (!validateBeforeOrder()) return;
    setLoadingAction('cod');
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: currentUser?.uid || 'guest',
          customerName: address.fullName,
          customerEmail: address.email,
          items: buildOrderItems(),
          totalAmount: grandTotal,
          shippingAddress: buildShippingAddress(),
          paymentId: 'COD',
          paymentStatus: 'Pending',
        }),
      });
      const data = await res.json();

      if (data.success) {
        clearCart();
        router.push(`/track?orderId=${data.order._id}`);
      } else {
        throw new Error(data.error || 'Could not place your order. Please try again.');
      }
    } catch (err) {
      console.error('COD order error:', err);
      setError(err.message || 'Could not place your order. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  // Create a Pending order, then hand the customer off to WhatsApp with the order pre-filled
  const handleWhatsAppOrder = async () => {
    if (!validateBeforeOrder()) return;
    setLoadingAction('whatsapp');
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: currentUser?.uid || 'guest',
          customerName: address.fullName,
          customerEmail: address.email,
          items: buildOrderItems(),
          totalAmount: grandTotal,
          shippingAddress: buildShippingAddress(),
          paymentId: 'WHATSAPP',
          paymentStatus: 'Pending',
        }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Could not place your order. Please try again.');
      }

      const orderId = data.order._id;
      const origin = window.location.origin;
      const itemLines = cart
        .map(
          (item) =>
            `• ${item.name} x ${item.quantity} — ₹${item.price * item.quantity}\n  ${origin}/product/${item._id}`
        )
        .join('\n\n');

      const message =
        `Assalamu Alaikum, I would like to confirm my order on KAZRI.\n\n` +
        `Order ID: ${orderId}\n\n` +
        `${itemLines}\n\n` +
        `Delivery Charge: ${shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}\n` +
        `Total: ₹${grandTotal}\n\n` +
        `Name: ${address.fullName}\n` +
        `Phone: ${address.phone}\n` +
        `Address: ${address.street}, ${address.city}, ${address.state} - ${address.postalCode}`;

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      clearCart();
      window.open(waUrl, '_blank');
      router.push(`/track?orderId=${orderId}`);
    } catch (err) {
      console.error('WhatsApp order error:', err);
      setError(err.message || 'Could not place your order. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-dark-900 text-slate-400 hover:text-white border border-gold-900/40"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-gold-400" />
            Checkout & Payment
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form ref={formRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8" onSubmit={(e) => e.preventDefault()}>

          {/* Shipping Details Form */}
          <div className="lg:col-span-2 space-y-6 bg-dark-900/70 border border-gold-900/40 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-lg font-black text-white flex items-center gap-2 border-b border-gold-900/40 pb-4">
              <MapPin className="w-5 h-5 text-gold-400" />
              Shipping Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={address.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full bg-dark-950 border border-gold-900/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={address.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="w-full bg-dark-950 border border-gold-900/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={address.phone}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                  className="w-full bg-dark-950 border border-gold-900/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Postal / Pin Code *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={address.postalCode}
                  onChange={handleInputChange}
                  placeholder="110001"
                  className="w-full bg-dark-950 border border-gold-900/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={address.street}
                  onChange={handleInputChange}
                  placeholder="House / Apartment No., Building Name, Street Name"
                  className="w-full bg-dark-950 border border-gold-900/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={address.city}
                  onChange={handleInputChange}
                  placeholder="Mumbai"
                  className="w-full bg-dark-950 border border-gold-900/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={address.state}
                  onChange={handleInputChange}
                  placeholder="Maharashtra"
                  className="w-full bg-dark-950 border border-gold-900/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Breakdown & Options */}
          <div className="bg-dark-900/90 border border-gold-900/40 rounded-3xl p-6 h-fit space-y-6 shadow-2xl">
            <h2 className="text-lg font-black text-white border-b border-gold-900/40 pb-4">
              Payment Summary
            </h2>

            {/* Cart Preview List */}
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between text-xs text-slate-300">
                  <span className="truncate max-w-[180px]">
                    {item.name} x {item.quantity}
                  </span>
                  <span className="font-bold text-white">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gold-900/40 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal</span>
                <span className="text-white font-bold">₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Charge</span>
                <span className="text-gold-400 font-bold">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>

              <div className="border-t border-gold-900/40 pt-3 flex justify-between text-base font-black text-white">
                <span>Total Payable</span>
                <span className="text-gold-400 text-2xl">₹{grandTotal}</span>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-3">
              {/* Online Payment — Coming Soon (compact single line) */}
              <div className="w-full py-2.5 px-4 rounded-xl bg-dark-800 border border-gold-900/40 flex items-center justify-between gap-2 opacity-70 cursor-not-allowed select-none">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <CreditCard className="w-3.5 h-3.5" />
                  UPI / Cards
                </span>
                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wide text-gold-400 bg-gold-500/10 border border-gold-500/30 px-2 py-0.5 rounded-full">
                  <Clock className="w-2.5 h-2.5" /> Soon
                </span>
              </div>

              {/* WhatsApp + COD — side by side in one row */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  disabled={loadingAction !== null || cart.length === 0}
                  className="py-3.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe57] text-dark-950 font-black text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 shadow-lg shadow-[#25D366]/20 transition-all disabled:opacity-50"
                >
                  {loadingAction === 'whatsapp' ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>WhatsApp</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCodOrder}
                  disabled={loadingAction !== null || cart.length === 0}
                  className="py-3.5 px-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-950 font-black text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 shadow-lg shadow-gold-500/25 transition-all disabled:opacity-50"
                >
                  {loadingAction === 'cod' ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <>
                      <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Cash on Delivery</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="text-center text-slate-500 text-[11px] space-y-1">
              <p className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                Your order details stay private & secure.
              </p>
              <p>Pay in cash when your order arrives at your doorstep.</p>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}