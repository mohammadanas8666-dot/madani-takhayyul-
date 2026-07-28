'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, ShieldCheck, MapPin, Truck, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Script from 'next/script';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const { currentUser, dbUser } = useAuth();

  const [address, setAddress] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const [loading, setLoading] = useState(false);
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

  const shippingFee = cartTotal > 999 || cartTotal === 0 ? 0 : 99;
  const grandTotal = cartTotal + shippingFee;

  const handleInputChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError('Your cart is empty. Please add products before checking out.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Razorpay order on server
      const orderRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grandTotal }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize payment gateway');
      }

      // If simulated order in dev mode without live Razorpay SDK keys
      if (orderData.isMock || !window.Razorpay) {
        const verifyRes = await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_simulated_${Date.now()}`,
            razorpay_signature: 'simulated_signature',
            isMock: true,
            user: currentUser?.uid || 'guest',
            customerName: address.fullName,
            customerEmail: address.email,
            items: cart.map(item => ({
              productId: item._id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.images?.[0] || '',
            })),
            totalAmount: grandTotal,
            shippingAddress: {
              fullName: address.fullName,
              address: address.street,
              city: address.city,
              state: address.state,
              postalCode: address.postalCode,
              phone: address.phone,
            },
          }),
        });

        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          clearCart();
          router.push(`/track?orderId=${verifyData.order._id}`);
          return;
        } else {
          throw new Error(verifyData.error || 'Order creation failed');
        }
      }

      // Live Razorpay SDK execution
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ROQAYYA',
        description: 'E-Commerce Order Payment',
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                isMock: false,
                user: currentUser?.uid || 'guest',
                customerName: address.fullName,
                customerEmail: address.email,
                items: cart.map(item => ({
                  productId: item._id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  image: item.images?.[0] || '',
                })),
                totalAmount: grandTotal,
                shippingAddress: {
                  fullName: address.fullName,
                  address: address.street,
                  city: address.city,
                  state: address.state,
                  postalCode: address.postalCode,
                  phone: address.phone,
                },
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCart();
              router.push(`/track?orderId=${verifyData.order._id}`);
            } else {
              setError(verifyData.error || 'Payment signature verification failed.');
            }
          } catch (err) {
            console.error(err);
            setError('Error confirming order payment server-side.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: address.fullName,
          email: address.email,
          contact: address.phone,
        },
        theme: {
          color: '#10b981',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment initiation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
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

        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
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

          {/* Payment Breakdown & Trigger */}
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

            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className="w-full py-4 px-6 rounded-2xl bg-gold-500 hover:bg-gold-400 text-dark-950 font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-gold-500/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Securing Payment...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" /> Pay Now with Razorpay
                </>
              )}
            </button>

            <div className="text-center text-slate-500 text-[11px] space-y-1">
              <p>Supports UPI, Debit/Credit Cards, Net Banking & Wallets.</p>
              <p>256-Bit SSL Encrypted & Verified.</p>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}