'use client';

import ProductCard from './ProductCard';
import { Loader2, PackageX } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '@/lib/categories';

const CATEGORIES = ['All', ...PRODUCT_CATEGORIES];

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
                  ? 'bg-gold-500 text-dark-950 shadow-lg shadow-gold-500/20'
                  : 'bg-dark-900 text-slate-300 hover:bg-dark-800 hover:text-white border border-gold-900/40'
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
      {loading && products.length === 0 ? (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 text-gold-400 animate-spin mx-auto" />
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center bg-dark-900/50 border border-gold-900/40 rounded-2xl max-w-lg mx-auto my-8">
          <PackageX className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No products yet</h3>
          <p className="text-slate-400 text-xs">
            The owner hasn't added any products in this category yet. Please check back soon, or try a different category.
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
            className="px-6 py-3 rounded-xl bg-dark-800 hover:bg-dark-800/70 border border-gold-900/50 text-white font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
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
