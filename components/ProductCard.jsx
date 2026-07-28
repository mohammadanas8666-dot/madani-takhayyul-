'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const PLACEHOLDER_IMG = 'https://placehold.co/600x400/1a1e2e/d4af37?text=MADANI+PRODUCT';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const imgUrl = product.images?.[0] || PLACEHOLDER_IMG;

  const isOutOfStock = product.stock <= 0;
  const specs = [product.color, product.size, product.fabric].filter(Boolean);

  return (
    <div className="group relative bg-dark-900/80 border border-gold-900/40 rounded-2xl overflow-hidden hover:border-gold-500/50 hover:shadow-2xl hover:shadow-gold-950/20 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Thumbnail & Badges */}
        <div className="relative h-52 sm:h-60 w-full bg-dark-950 overflow-hidden">
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
              <span className="bg-gold-500 text-dark-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded-md shadow">
                Only {product.stock} left
              </span>
            ) : (
              <span className="bg-dark-900/80 text-gold-400 font-semibold text-[10px] uppercase px-2 py-0.5 rounded-md border border-gold-500/30 backdrop-blur-md">
                In Stock
              </span>
            )}
          </div>

          {/* Quick Details Overlay */}
          <div className="absolute inset-0 bg-dark-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <Link
              href={`/product/${product._id}`}
              className="p-3 rounded-full bg-dark-900 text-white hover:bg-gold-500 hover:text-dark-950 transition-colors shadow-lg"
              title="Quick View"
            >
              <Eye className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider">
            {product.category}
          </span>

          <Link href={`/product/${product._id}`} className="block">
            <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-gold-300 transition-colors">
              {product.name}
            </h3>
          </Link>

          {specs.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {specs.map((spec, i) => (
                <span
                  key={i}
                  className="text-[10px] font-medium text-slate-300 bg-dark-950 border border-gold-900/40 px-2 py-0.5 rounded-md"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-slate-400 line-clamp-2">
            {product.description || 'Premium quality Islamic wear, carefully crafted.'}
          </p>
        </div>
      </div>

      {/* Price & Action */}
      <div className="p-4 pt-0 flex items-center justify-between border-t border-gold-900/30 mt-2">
        <div>
          <span className="text-xs text-slate-400 block">Price</span>
          <span className="text-lg font-black text-white">₹{product.price}</span>
        </div>

        <button
          onClick={() => addToCart(product)}
          disabled={isOutOfStock}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            isOutOfStock
              ? 'bg-dark-800 text-slate-500 cursor-not-allowed'
              : 'bg-gold-500 hover:bg-gold-400 text-dark-950 shadow-md hover:shadow-gold-500/20 active:scale-95'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
}
