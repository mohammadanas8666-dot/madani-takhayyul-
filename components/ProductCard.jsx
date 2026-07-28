'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const PLACEHOLDER_IMG = 'https://placehold.co/600x600/1a1e2e/d4af37?text=ROQAYYA';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const imgUrl = product.images?.[0] || PLACEHOLDER_IMG;
  const isOutOfStock = product.stock <= 0;

  return (
    <Link
      href={`/product/${product._id}`}
      className="group relative bg-dark-900/80 border border-gold-900/40 rounded-lg sm:rounded-2xl overflow-hidden hover:border-gold-500/50 transition-all duration-300 flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative aspect-square w-full bg-dark-950 overflow-hidden">
        <Image
          src={imgUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {isOutOfStock && (
          <span className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-red-500/90 text-white font-bold text-[8px] sm:text-[10px] uppercase px-1.5 py-0.5 rounded shadow">
            Sold Out
          </span>
        )}
      </div>

      {/* Compact Content */}
      <div className="p-1.5 sm:p-3 flex flex-col gap-0.5 sm:gap-1 flex-1">
        <h3 className="text-[11px] sm:text-sm font-semibold text-white line-clamp-1 sm:line-clamp-2 group-hover:text-gold-300 transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto flex items-center justify-between gap-1 pt-1">
          <span className="text-xs sm:text-base font-black text-white">₹{product.price}</span>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isOutOfStock) addToCart(product);
            }}
            disabled={isOutOfStock}
            className={`p-1.5 sm:p-2 rounded-full transition-all shrink-0 ${
              isOutOfStock
                ? 'bg-dark-800 text-slate-600 cursor-not-allowed'
                : 'bg-gold-500 hover:bg-gold-400 text-dark-950 active:scale-90'
            }`}
            title={isOutOfStock ? 'Sold Out' : 'Add to Cart'}
          >
            <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}