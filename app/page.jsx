'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
import ProductGrid from '@/components/ProductGrid';
import { ShieldCheck, Truck, Clock, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = async (cat = selectedCategory, search = searchTerm, pageNum = 1) => {
    setLoading(true);
    try {
      let url = `/api/products?page=${pageNum}&limit=12`;
      if (cat !== 'All') url += `&category=${encodeURIComponent(cat)}`;
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

      // Featured products for the hero slider — real DB data only
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
    fetchProducts(selectedCategory, searchTerm, 1);
  }, [selectedCategory, searchTerm]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(selectedCategory, searchTerm, nextPage);
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100">
      {/* Navigation Header */}
      <Header
        searchTerm={searchTerm}
        onSearchChange={(val) => setSearchTerm(val)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Featured Slider */}
        <HeroSlider featuredProducts={featuredProducts} />

        {/* Store Trust Badges Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8 p-4 bg-dark-900/60 border border-gold-900/40 rounded-2xl">
          <div className="flex items-center gap-3 p-2">
            <Truck className="w-8 h-8 text-gold-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">All India Delivery</h4>
              <p className="text-[10px] text-slate-400">Fast & reliable shipping</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <ShieldCheck className="w-8 h-8 text-gold-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Razorpay Secure</h4>
              <p className="text-[10px] text-slate-400">256-bit encrypted checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <RefreshCw className="w-8 h-8 text-gold-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Premium Quality</h4>
              <p className="text-[10px] text-slate-400">Feel the premium difference</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <Clock className="w-8 h-8 text-gold-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Live Tracking</h4>
              <p className="text-[10px] text-slate-400">Step-by-step order updates</p>
            </div>
          </div>
        </div>

        {/* Responsive Product Grid */}
        <ProductGrid
          products={products}
          totalCount={totalCount}
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => {
            setSelectedCategory(cat);
            setPage(1);
          }}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          loading={loading}
        />
      </main>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-gold-900/40 text-slate-400 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-gold-600 via-gold-400 to-gold-600 flex items-center justify-center text-dark-950 font-bold text-sm">
                M
              </div>
              <span className="font-extrabold text-lg text-white">MADANI PRODUCT</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Premium Islamic wear — Pagdi/Amama, Jubba/Aba, Kurta/Thobe, Rumal, Topi and more. Elegance in Faith.
            </p>
          </div>

          <div className="text-xs space-y-1">
            <p>© {new Date().getFullYear()} MADANI PRODUCT. All rights reserved.</p>
            <p className="text-slate-500">Powered by Next.js, MongoDB Atlas, Firebase & Razorpay.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
