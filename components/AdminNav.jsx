'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Package, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  ShieldCheck, 
  ArrowLeft 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminNav() {
  const pathname = usePathname();
  const { dbUser, isAdmin, loading } = useAuth();

  if (loading) return null;

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top title bar */}
        <div className="flex items-center justify-between py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                MADANI Admin Console
              </h1>
              <p className="text-xs text-slate-400">
                Manage inventory, order fulfillment, finances, and user permissions
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Storefront
          </Link>
        </div>

        {/* Tab Navigation Links */}
        <nav className="flex gap-2 overflow-x-auto py-2 scrollbar-none">
          <Link
            href="/admin/products"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              pathname.startsWith('/admin/products')
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            Products
          </Link>

          <Link
            href="/admin/orders"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              pathname.startsWith('/admin/orders')
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Orders
          </Link>

          <Link
            href="/admin/balance"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              pathname.startsWith('/admin/balance')
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Balance & Revenue
          </Link>

          <Link
            href="/admin/users"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              pathname.startsWith('/admin/users')
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Users
          </Link>
        </nav>

      </div>
    </div>
  );
}
