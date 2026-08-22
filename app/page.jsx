'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
import ProductGrid from '@/components/ProductGrid';

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageFallback />}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageFallback() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100">
      <div className="h-16 border-b border-gold-900/40 bg-dark-900/95" />
    </div>
  );
}

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  // Read the starting category straight from the URL (?category=...) so
  // links from the side menu / bookmarks / shares land on the right filter.
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || 'All');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = useCallback(async (category = selectedCategory, search = searchTerm, pageNum = 1) => {
    setLoading(true);
    try {
      let url = `/api/products?page=${pageNum}&limit=12`;
      if (category && category !== 'All') url += `&category=${encodeURIComponent(category)}`;
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
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    setPage(1);
    fetchProducts(selectedCategory, searchTerm, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchTerm]);

  // Keep the URL in sync with the selected category so it's shareable/bookmarkable
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    const url = cat === 'All' ? '/' : `/?category=${encodeURIComponent(cat)}`;
    router.replace(url, { scroll: false });
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(selectedCategory, searchTerm, nextPage);
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100 overflow-x-hidden">
      {/* Navigation Header */}
      <Header
        searchTerm={searchTerm}
        onSearchChange={(val) => setSearchTerm(val)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">

        {/* Auto-Sliding Featured Strip — edge-to-edge width, starts sliding right automatically on load, owner-controlled via dashboard */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8">
          <HeroSlider featuredProducts={featuredProducts} />
        </div>

        {/* Category Filter + Product Grid — 2/4 column responsive, infinite scroll */}
        <ProductGrid
          products={products}
          totalCount={totalCount}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
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
              <Image src="/logo.png" alt="KAZRI" fill className="object-cover" />
            </div>
            <div className="flex flex-col leading-none text-left">
              <span className="font-extrabold text-base text-white">KAZRI</span>
              <span className="text-[9px] text-slate-500">a madni takhayyul product</span>
            </div>
          </div>

          <div className="text-xs">
            <p>© {new Date().getFullYear()} KAZRI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
