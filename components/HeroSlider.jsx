'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function HeroSlider({ featuredProducts = [] }) {
  const scrollRef = useRef(null);
  const { addToCart } = useCart();

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!featuredProducts || featuredProducts.length === 0) {
    return (
      <div className="relative w-full rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-8 text-center text-white border border-emerald-900/50 shadow-xl overflow-hidden my-6">
        <div className="max-w-xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Featured Spotlight
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Discover Premium Collections
          </h2>
          <p className="text-slate-300 text-sm">
            Handpicked quality items curated for exceptional performance and timeless elegance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full my-6 group">
      {/* Header Label */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Featured Spotlight
          </h2>
        </div>
        
        {/* Navigation arrow buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-emerald-600 transition-colors border border-slate-700 shadow-md"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-emerald-600 transition-colors border border-slate-700 shadow-md"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {featuredProducts.map((product) => {
          const imgUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

          return (
            <div
              key={product._id}
              className="snap-start shrink-0 w-[280px] sm:w-[340px] bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 shadow-xl flex flex-col group/card"
            >
              {/* Product Thumbnail Image */}
              <div className="relative h-48 sm:h-56 w-full bg-slate-950 overflow-hidden">
                <Image
                  src={imgUrl}
                  alt={product.name}
                  fill
                  className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-2 py-1 rounded-md shadow-md">
                  Featured
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-emerald-400 font-extrabold text-sm border border-emerald-500/30">
                  ₹{product.price}
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                    {product.category || 'Featured'}
                  </span>
                  <h3 className="text-base font-bold text-white line-clamp-1 group-hover/card:text-emerald-300 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {product.description || 'Premium quality product crafted with exceptional materials.'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <Link
                    href={`/product/${product._id}`}
                    className="flex-1 text-center py-2 px-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors flex items-center justify-center gap-1"
                  >
                    Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => addToCart(product)}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
