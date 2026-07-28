'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  Home,
  ShoppingBag,
  Truck,
  Info,
  ShieldCheck,
  Grid,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PRODUCT_CATEGORIES } from '@/lib/categories';

export default function SideMenu({ isOpen, onClose }) {
  const { currentUser, dbUser, isAdmin, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-80 max-w-[85vw] bg-dark-900 border-r border-gold-900/40 text-white h-full flex flex-col z-10 shadow-2xl animate-slideRight">

        {/* Drawer Header */}
        <div className="p-5 border-b border-gold-900/40 flex items-center justify-between bg-dark-950">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
              <Image src="/logo.png" alt="ROQAYYA" fill className="object-cover" />
            </div>
            <span className="font-extrabold text-lg tracking-wider text-gold-400">ROQAYYA</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Quick Nav Links */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Navigation
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-dark-800 hover:text-gold-400 font-medium text-sm transition-colors"
                >
                  <Home className="w-4 h-4 text-gold-500" />
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-dark-800 hover:text-gold-400 font-medium text-sm transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-gold-500" />
                  Cart Page
                </Link>
              </li>
              <li>
                <Link
                  href="/track"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-dark-800 hover:text-gold-400 font-medium text-sm transition-colors"
                >
                  <Truck className="w-4 h-4 text-gold-500" />
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-dark-800 hover:text-gold-400 font-medium text-sm transition-colors"
                >
                  <Info className="w-4 h-4 text-gold-500" />
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories List */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-gold-400" />
              Categories
            </h3>
            <ul className="space-y-1">
              {PRODUCT_CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/?category=${encodeURIComponent(cat)}`}
                    onClick={onClose}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-dark-800 hover:text-gold-300 text-sm transition-colors"
                  >
                    <Grid className="w-3.5 h-3.5 text-slate-500" />
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Admin Panel Section if Admin */}
          {isAdmin && (
            <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-xl">
              <h3 className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Admin Dashboard
              </h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/admin/products"
                    onClick={onClose}
                    className="block px-3 py-1.5 text-xs text-gold-200 hover:text-gold-100 hover:underline"
                  >
                    • Product Management
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/orders"
                    onClick={onClose}
                    className="block px-3 py-1.5 text-xs text-gold-200 hover:text-gold-100 hover:underline"
                  >
                    • Order Flow & Tracking
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/balance"
                    onClick={onClose}
                    className="block px-3 py-1.5 text-xs text-gold-200 hover:text-gold-100 hover:underline"
                  >
                    • Revenue & Payouts
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/users"
                    onClick={onClose}
                    className="block px-3 py-1.5 text-xs text-gold-200 hover:text-gold-100 hover:underline"
                  >
                    • Registered Users
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-gold-900/40 bg-dark-950 text-xs text-slate-400 flex flex-col gap-2">
          {currentUser ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{dbUser?.name || currentUser.email}</p>
                <p className="text-[10px] text-gold-400 capitalize">Role: {dbUser?.role || 'Customer'}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="text-red-400 hover:underline text-xs"
              >
                Sign out
              </button>
            </div>
          ) : (
            <p className="text-center text-slate-400">
              Welcome to ROQAYYA! Sign in to get exclusive offers.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}