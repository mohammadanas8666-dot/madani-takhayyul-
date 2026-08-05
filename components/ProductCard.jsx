'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Share2, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const PLACEHOLDER_IMG = 'https://placehold.co/600x600/1a1e2e/d4af37?text=ROQAYYA';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [shared, setShared] = useState(false);
  const imgUrl = product.images?.[0] || PLACEHOLDER_IMG;
  const isOutOfStock = product.stock <= 0;

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/product/${product._id}`;
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} — ₹${product.price} on ROQAYYA`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShared(true);
        setTimeout(() => setShared(false), 1800);
      }
    } catch (err) {
      // User cancelled the share sheet — ignore silently
    }
  };

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

        {/* Share Button */}
        <button
          onClick={handleShare}
          title="Share this product"
          className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-1.5 rounded-full bg-dark-950/80 backdrop-blur-sm border border-gold-500/30 text-gold-300 hover:bg-gold-500/20 active:scale-90 transition-all"
        >
          {shared ? (
            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          ) : (
            <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          )}
        </button>
      </div>

      {/* Compact Content */}
      <div className="p-1.5 sm:p-3 flex flex-col gap-0.5 sm:gap-1 flex-1">
        <h3 className="text-[10px] sm:text-sm font-semibold text-white line-clamp-1 sm:line-clamp-2 group-hover:text-gold-300 transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto flex items-center justify-between gap-1 pt-1">
          <span className="text-[11px] sm:text-base font-black text-white">₹{product.price}</span>

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
