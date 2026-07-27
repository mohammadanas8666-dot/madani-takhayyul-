'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';
import { Loader2, SlidersHorizontal, PackageX } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion',
  'Home & Kitchen',
  'Beauty & Wellness',
  'Books & Stationeries',
  'Sports & Fitness',
];

export default function ProductGrid({
  products = [],
  totalCount = 0,
  selectedCategory = 'All',
  onCategoryChange,
  onLoadMore,
  hasMore = false,
  loading = false,
}) {
  return (
    <section className="my-8">
      {/* Category Pills & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange && onCategoryChange(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 flex items-center justify-between gap-2">
          <span>Showing <strong className="text-white">{products.length}</strong> of <strong className="text-white">{totalCount}</strong> products</span>
        </div>
      </div>

      {/* Grid Content */}
      {products.length === 0 && !loading ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl max-w-lg mx-auto my-8">
          <PackageX className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No products found</h3>
          <p className="text-slate-400 text-xs">
            Try switching categories or clearing your search term to see available items.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                Loading Products...
              </>
            ) : (
              'Load More Products'
            )}
          </button>
        </div>
      )}
    </section>
  );
}
