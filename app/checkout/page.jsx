'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { authFetch } from '@/lib/authFetch';
import {
  ShieldCheck,
  MapPin,
  Loader2,
  ArrowLeft,
  MessageCircle,
  LocateFixed,
  LogIn,
  Lock,
} from 'lucide-react';

// Store WhatsApp number for order confirmations (with country code, no + or spaces)
const WHATSAPP_NUMBER = '917860023820';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const { currentUser, dbUser, loading: authLoading } = useAuth();
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

  const [mapLink, setMapLink] = useState('');
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  // "Use my current location" — gets GPS coordinates from the browser, then
  // reverse-geocodes them into a readable address using OpenStreetMap's free
  // Nominatim service (no API key needed). The customer can still edit
  // anything it fills in.
  const handleAutoDetectLocation = () => {
    setLocateError('');

    if (!navigator.geolocation) {
      setLocateError('Location detection is not supported on this device.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapLink(`https://www.google.com/maps?q=${latitude},${longitude}`);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const addr = data.address || {};

          setAddress((prev) => ({
            ...prev,
            street:
              [addr.house_number, addr.road, addr.neighbourhood]
                .filter(Boolean)
                .join(', ') || prev.street,
            city: addr.city || addr.town || addr.village || addr.county || prev.city,
            state: addr.state || prev.state,
            postalCode: addr.postcode || prev.postalCode,
          }));
        } catch (err) {
          console.error('Reverse geocoding failed:', err);
          setLocateError('Detected your location, but could not fill the address automatically. Please fill it in manually.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLocateError('Could not access your location. Please allow location access, or enter your address manually.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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
    if (!currentUser) {
      setError('Please log in to place your order.');
      return false;
    }
    if (cart.length === 0) {
      setError('Your cart is empty. Please add products before checking out.');
      return false;
    }
    if (formRef.current && !formRef.current.reportValidity()) {
      return false;
    }
    return true;
  };

  // Create the order, then hand the customer off to WhatsApp with everything
  // pre-filled: items (with image links), address, phone, and a map link so
  // the store owner can act on it immediately without asking follow-up questions.
  const handleWhatsAppOrder = async () => {
    if (!validateBeforeOrder()) return;
    setPlacingOrder(true);
    setError('');

    try {
      const res = await authFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: address.fullName,
          customerEmail: address.email,
          items: buildOrderItems(),
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
        .map((item) => {
          const productUrl = `${origin}/product/${item._id}`;
          const imageUrl = item.images?.[0];
          return (
            `• ${item.name} x ${item.quantity} — ₹${item.price * item.quantity}\n` +
            `  Product: ${productUrl}` +
            (imageUrl ? `\n  Image: ${imageUrl}` : '')
          );
        })
        .join('\n\n');

      const addressLine = `${address.street}, ${address.city}, ${address.state} - ${address.postalCode}`;
      const directionsLink =
        mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine)}`;

      const message =
        `Assalamu Alaikum, I would like to confirm my order on KAZRI.\n\n` +
        `Order ID: ${orderId}\n\n` +
        `${itemLines}\n\n` +
        `Delivery Charge: FREE\n` +
        `Total: ₹${grandTotal}\n\n` +
        `Name: ${address.fullName}\n` +
        `Phone: ${address.phone}\n` +
        `Address: ${addressLine}\n` +
        `Location: ${directionsLink}`;

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      clearCart();
      window.open(waUrl, '_blank');
      router.push(`/track?orderId=${orderId}`);
    } catch (err) {
      console.error('WhatsApp order error:', err);
      setError(err.message || 'Could not place your order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-dark-900 text-slate-400 hover:text-white border border-gold-900/40"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Checkout</h1>
            <p className="text-xs text-slate-500 mt-0.5">Fast, secure, and simple — just a couple of steps away.</p>
          </div>
        </div>

        {/* Not logged in — gate the whole checkout behind login */}
        {!authLoading && !currentUser ? (
          <div className="bg-dark-900/70 border border-gold-900/40 rounded-3xl p-10 text-center shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-gold-400" />
            </div>
            <h2 className="text-lg font-black text-white mb-2">Please log in to continue</h2>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
              We ask you to sign in before ordering so we can keep your order history safe and confirm it's really you.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-600 hover:bg-gold-500 text-dark-950 font-extrabold text-sm shadow-lg transition-all"
            >
              <LogIn className="w-4 h-4" />
              Log In to Order
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <form ref={formRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8" onSubmit={(e) => e.preventDefault()}>

              {/* Shipping Details Form */}
              <div className="lg:col-span-2 space-y-6 bg-dark-900/70 border border-gold-900/40 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between flex-wrap gap-3 border-b border-gold-900/40 pb-4">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gold-400" />
                    Delivery Address
                  </h2>
                  <button
                    type="button"
                    onClick={handleAutoDetectLocation}
                    disabled={locating}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark-800 hover:bg-dark-800/70 text-gold-400 text-xs font-bold border border-gold-900/50 transition-all disabled:opacity-50"
                  >
                    {locating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LocateFixed className="w-3.5 h-3.5" />
                    )}
                    {locating ? 'Detecting...' : 'Use My Current Location'}
                  </button>
                </div>

                {locateError && (
                  <p className="text-xs text-amber-400 -mt-2">{locateError}</p>
                )}

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

              {/* Order Summary & Place Order */}
              <div className="bg-dark-900/90 border border-gold-900/40 rounded-3xl p-6 h-fit space-y-6 shadow-2xl">
                <h2 className="text-lg font-black text-white border-b border-gold-900/40 pb-4">
                  Order Summary
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
                    <span className="text-gold-400 font-bold">FREE</span>
                  </div>

                  <div className="border-t border-gold-900/40 pt-3 flex justify-between text-base font-black text-white">
                    <span>Total Payable</span>
                    <span className="text-gold-400 text-2xl">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Place Order via WhatsApp */}
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  disabled={placingOrder || cart.length === 0}
                  className="w-full py-4 rounded-xl bg-[#25D366] hover:bg-[#1ebe57] text-dark-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all disabled:opacity-50"
                >
                  {placingOrder ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5" />
                      <span>Confirm Order on WhatsApp</span>
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-slate-500">
                  We'll open WhatsApp with your order details filled in — just hit send.
                </p>

                <div className="text-center text-slate-500 text-[11px] space-y-1 border-t border-gold-900/40 pt-4">
                  <p className="flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                    Your order details stay private & secure.
                  </p>
                  <p>Pay in cash when your order arrives at your doorstep.</p>
                </div>
              </div>

            </form>
          </>
        )}
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
