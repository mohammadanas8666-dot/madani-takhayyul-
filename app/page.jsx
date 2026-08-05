'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
import ProductGrid from '@/components/ProductGrid';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = async (search = searchTerm, pageNum = 1) => {
    setLoading(true);
    try {
      let url = `/api/products?page=${pageNum}&limit=12`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        if (pageNum === 1) {
          setProducts(data.products);
        } else {
          setProducts((prev) => [...prev, ...data.products]);
        }
        setTotalCount(data.pagination?.total || data.products.length);
        setHasMore(pageNum < (data.pagination?.pages || 1));
      } else {
        setProducts([]);
        setTotalCount(0);
        setHasMore(false);
      }

      // Featured products for the hero slider — real DB data only, owner-controlled
      const featuredRes = await fetch('/api/products?featured=true&limit=20');
      const featuredData = await featuredRes.json();
      if (featuredData.success) {
        setFeaturedProducts(featuredData.products);
      } else {
        setFeaturedProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
      setFeaturedProducts([]);
      setTotalCount(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(searchTerm, 1);
  }, [searchTerm]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(searchTerm, nextPage);
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100">
      {/* Navigation Header */}
      <Header
        searchTerm={searchTerm}
        onSearchChange={(val) => setSearchTerm(val)}
      />

      {/* Main Content Area — kept minimal: auto-sliding featured strip + product grid only */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">

        {/* Auto-Sliding Featured Strip — edge-to-edge width, starts sliding right automatically on load, owner-controlled via dashboard */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8">
          <HeroSlider featuredProducts={featuredProducts} />
        </div>

        {/* Product Grid — 3 columns, infinite scroll, no category filters */}
        <ProductGrid
          products={products}
          totalCount={totalCount}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          loading={loading}
        />
      </main>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-gold-900/40 text-slate-400 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0">
              <Image src="/logo.png" alt="ROQAYYA" fill className="object-cover" />
            </div>
            <div className="flex flex-col leading-none text-left">
              <span className="font-extrabold text-base text-white">ROQAYYA</span>
              <span className="text-[9px] text-slate-500">a madni takhayyul product</span>
            </div>
          </div>

          <div className="text-xs">
            <p>© {new Date().getFullYear()} ROQAYYA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}