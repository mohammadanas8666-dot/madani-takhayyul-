'use client';

import ProductCard from './ProductCard';
import { Loader2, PackageX } from 'lucide-react';

export default function ProductGrid({
  products = [],
  totalCount = 0,
  onLoadMore,
  hasMore = false,
  loading = false,
}) {
  return (
    <section className="my-6">
      {/* Grid Content — 3 columns, no category filters, no extra body content */}
      {loading && products.length === 0 ? (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 text-gold-400 animate-spin mx-auto" />
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center bg-dark-900/50 border border-gold-900/40 rounded-2xl max-w-lg mx-auto my-8">
          <PackageX className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No products yet</h3>
          <p className="text-slate-400 text-xs">
            The owner hasn't added any products yet. Please check back soon.
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