'use client';

import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Trash2, ArrowRight, Minus, Plus, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();

  const shippingFee = cartTotal > 999 || cartTotal === 0 ? 0 : 99;
  const grandTotal = cartTotal + shippingFee;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-emerald-400" />
            Shopping Cart ({cart.length})
          </h1>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 hover:underline"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl max-w-md mx-auto my-12 shadow-2xl">
            <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4 animate-bounce" />
            <h2 className="text-xl font-bold text-white mb-2">Your cart is empty</h2>
            <p className="text-slate-400 text-xs mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs shadow-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const img = item.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
                return (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900/70 border border-slate-800 rounded-2xl shadow-md hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                        <Image src={img} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">
                          {item.category || 'General'}
                        </span>
                        <h3 className="font-bold text-white text-sm line-clamp-1">{item.name}</h3>
                        <p className="text-emerald-400 font-extrabold text-sm mt-0.5">₹{item.price}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 border-slate-800/80 pt-3 sm:pt-0">
                      {/* Quantity modifier */}
                      <div className="flex items-center border border-slate-800 bg-slate-950 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Item Subtotal */}
                      <span className="font-extrabold text-white text-sm min-w-[70px] text-right">
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </span>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 h-fit space-y-6 shadow-2xl">
              <h2 className="text-lg font-black text-white border-b border-slate-800 pb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Shipping Fee</span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-400 font-bold uppercase text-xs">Free</span>
                  ) : (
                    <span className="text-white font-bold">₹{shippingFee}</span>
                  )}
                </div>

                <div className="border-t border-slate-800 pt-3 flex justify-between text-base font-black text-white">
                  <span>Grand Total</span>
                  <span className="text-emerald-400 text-xl">₹{grandTotal}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-[11px] text-slate-500 text-center">
                Taxes and shipping fees calculated at checkout.
              </p>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
