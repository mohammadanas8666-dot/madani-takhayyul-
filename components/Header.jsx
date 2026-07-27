'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  Search, 
  ShoppingBag, 
  Truck, 
  Info, 
  User as UserIcon, 
  ShieldCheck, 
  LogOut, 
  X 
} from 'lucide-react';
import SideMenu from './SideMenu';
import AuthModal from './AuthModal';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Header({ onSearchChange, searchTerm = '' }) {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount } = useCart();
  const { currentUser, dbUser, isAdmin, logout } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: 3-line hamburger menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSideMenuOpen(true)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Open navigation menu"
              id="hamburger-menu-btn"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Center: Logo + Site Name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center font-black text-xl shadow-md shadow-emerald-900/40 group-hover:scale-105 transition-transform">
                M
              </div>
              <span className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-emerald-400">
                MADANI
              </span>
            </Link>
          </div>

          {/* Right: Search, Cart, Track, About, User/Auth */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search trigger */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
              title="Search products"
              id="search-icon-btn"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Track Order Icon */}
            <Link
              href="/track"
              className="p-2 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-colors flex items-center gap-1"
              title="Track Order"
              id="track-order-icon-btn"
            >
              <Truck className="w-5 h-5" />
              <span className="hidden md:inline text-xs font-medium">Track</span>
            </Link>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="p-2 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-colors relative"
              title="View Cart"
              id="cart-icon-btn"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-black text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* About Icon */}
            <Link
              href="/about"
              className="p-2 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-colors hidden sm:block"
              title="About Us"
              id="about-icon-btn"
            >
              <Info className="w-5 h-5" />
            </Link>

            {/* Admin Badge link if admin */}
            {isAdmin && (
              <Link
                href="/admin/products"
                className="hidden lg:flex items-center gap-1 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1.5 rounded-lg hover:bg-amber-500/30 transition-colors"
                id="admin-dashboard-link"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin</span>
              </Link>
            )}

            {/* Auth User Menu / Login button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs text-slate-300 font-medium max-w-[100px] truncate">
                  {dbUser?.name || currentUser.displayName || currentUser.email.split('@')[0]}
                </span>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Sign Out"
                  id="signout-btn"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs sm:text-sm shadow-md hover:shadow-emerald-500/20 transition-all"
                id="login-btn"
              >
                <UserIcon className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Expandable Search Bar */}
        {isSearchOpen && (
          <div className="border-t border-slate-800 bg-slate-950/90 p-3 animate-fadeIn">
            <div className="max-w-3xl mx-auto flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by title..."
                value={searchTerm}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm"
                autoFocus
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Side Menu Drawer */}
      <SideMenu isOpen={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
