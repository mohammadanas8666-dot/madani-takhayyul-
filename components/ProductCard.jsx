'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const imgUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group relative bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-950/30 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Thumbnail & Badges */}
        <div className="relative h-52 sm:h-60 w-full bg-slate-950 overflow-hidden">
          <Image
            src={imgUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Stock Badge */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {isOutOfStock ? (
              <span className="bg-red-500/90 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-md shadow">
                Out of Stock
              </span>
            ) : product.stock < 5 ? (
              <span className="bg-amber-500 text-slate-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded-md shadow">
                Only {product.stock} left
              </span>
            ) : (
              <span className="bg-slate-900/80 text-emerald-400 font-semibold text-[10px] uppercase px-2 py-0.5 rounded-md border border-emerald-500/30 backdrop-blur-md">
                In Stock
              </span>
            )}
          </div>

          {/* Quick Details Overlay */}
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <Link
              href={`/product/${product._id}`}
              className="p-3 rounded-full bg-slate-900 text-white hover:bg-emerald-500 hover:text-slate-950 transition-colors shadow-lg"
              title="Quick View"
            >
              <Eye className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              {product.category || 'General'}
            </span>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>4.8</span>
            </div>
          </div>

          <Link href={`/product/${product._id}`} className="block">
            <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-emerald-300 transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-400 line-clamp-2">
            {product.description || 'High quality item carefully tested for satisfaction.'}
          </p>
        </div>
      </div>

      {/* Price & Action */}
      <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-800/60 mt-2">
        <div>
          <span className="text-xs text-slate-400 block">Price</span>
          <span className="text-lg font-black text-white">₹{product.price}</span>
        </div>

        <button
          onClick={() => addToCart(product)}
          disabled={isOutOfStock}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            isOutOfStock
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-md hover:shadow-emerald-500/20 active:scale-95'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
}
