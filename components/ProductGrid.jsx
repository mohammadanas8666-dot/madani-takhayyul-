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
    <section className="my-6">
      {/* Category Filter Bar — sticky just below the header so it stays
          reachable while scrolling through a long product list */}
      <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-5 bg-dark-950/95 backdrop-blur-md border-b border-gold-900/30">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange && onCategoryChange(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                selectedCategory === cat
                  ? 'bg-gold-500 text-dark-950 border-gold-500 shadow-md shadow-gold-500/20'
                  : 'bg-dark-900 text-slate-300 border-gold-900/40 hover:border-gold-500/50 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between mb-4 px-0.5">
        <p className="text-xs text-slate-400">
          {selectedCategory === 'All' ? (
            <>Showing <strong className="text-white">{products.length}</strong> of <strong className="text-white">{totalCount}</strong> products</>
          ) : (
            <><strong className="text-white">{totalCount}</strong> product{totalCount !== 1 ? 's' : ''} in <strong className="text-gold-400">{selectedCategory}</strong></>
          )}
        </p>
      </div>

      {/* Grid Content */}
      {loading && products.length === 0 ? (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 text-gold-400 animate-spin mx-auto" />
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center bg-dark-900/50 border border-gold-900/40 rounded-2xl max-w-lg mx-auto my-8">
          <PackageX className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">
            {selectedCategory === 'All' ? 'No products yet' : `No products in ${selectedCategory} yet`}
          </h3>
          <p className="text-slate-400 text-xs">
            {selectedCategory === 'All'
              ? "The owner hasn't added any products yet. Please check back soon."
              : 'Try a different category, or check back soon.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
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
