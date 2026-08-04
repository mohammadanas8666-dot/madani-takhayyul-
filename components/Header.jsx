'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
      <header className="sticky top-0 z-40 bg-dark-900/95 backdrop-blur-md border-b border-gold-900/40 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Left: 3-line hamburger menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSideMenuOpen(true)}
              className="p-2 rounded-lg text-slate-300 hover:text-gold-400 hover:bg-dark-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500"
              aria-label="Open navigation menu"
              id="hamburger-menu-btn"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Center: Logo + Site Name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-9 h-9 rounded-full overflow-hidden shadow-md shadow-gold-900/40 group-hover:scale-105 transition-transform shrink-0">
                <Image src="/logo.png" alt="ROQAYYA" fill className="object-cover" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gold-200 to-gold-400">
                  ROQAYYA
                </span>
                <span className="text-[9px] text-slate-400 tracking-wide hidden sm:block">
                  a madni takhayyul product
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Search, Cart, Track, About, User/Auth */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search trigger */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-gold-400 hover:bg-dark-800 transition-colors"
              title="Search products"
              id="search-icon-btn"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Track Order Icon */}
            <Link
              href="/track"
              className="p-2 rounded-lg text-slate-300 hover:text-gold-400 hover:bg-dark-800 transition-colors flex items-center gap-1"
              title="Track Order"
              id="track-order-icon-btn"
            >
              <Truck className="w-5 h-5" />
              <span className="hidden md:inline text-xs font-medium">Track</span>
            </Link>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="p-2 rounded-lg text-slate-300 hover:text-gold-400 hover:bg-dark-800 transition-colors relative"
              title="View Cart"
              id="cart-icon-btn"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-500 text-dark-950 font-black text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* About Icon */}
            <Link
              href="/about"
              className="p-2 rounded-lg text-slate-300 hover:text-gold-400 hover:bg-dark-800 transition-colors hidden sm:block"
              title="About Us"
              id="about-icon-btn"
            >
              <Info className="w-5 h-5" />
            </Link>

            {/* Admin Badge link if admin */}
            {isAdmin && (
              <Link
                href="/admin/products"
                className="flex items-center gap-1 text-xs font-bold bg-gold-500/20 text-gold-300 border border-gold-500/40 px-2 sm:px-2.5 py-1.5 rounded-lg hover:bg-gold-500/30 transition-colors"
                id="admin-dashboard-link"
              >
                <ShieldCheck className="w-4 h-4 text-gold-400" />
                <span className="hidden sm:inline">Admin</span>
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
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-dark-800 transition-colors"
                  title="Sign Out"
                  id="signout-btn"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold px-3 py-1.5 rounded-lg text-xs sm:text-sm shadow-md hover:shadow-gold-500/20 transition-all"
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
          <div className="border-t border-gold-900/40 bg-dark-950/90 p-3 animate-fadeIn">
            <div className="max-w-3xl mx-auto flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Pagdi, Jubba, Kurta, Rumal..."
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