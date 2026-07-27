'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
import ProductGrid from '@/components/ProductGrid';
import { ShieldCheck, Truck, Clock, RefreshCw } from 'lucide-react';

const MOCK_PRODUCTS = [
  {
    _id: 'mock-1',
    name: 'Wireless Noise-Canceling Headphones',
    price: 3499,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
    stock: 12,
    category: 'Electronics',
    isFeaturedInSlider: true,
    description: 'High-fidelity audio with active noise cancellation and 30-hour battery life.',
  },
  {
    _id: 'mock-2',
    name: 'Minimalist Chronograph Watch',
    price: 4999,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
    stock: 8,
    category: 'Fashion',
    isFeaturedInSlider: true,
    description: 'Sleek stainless steel case with genuine leather strap and water resistance up to 50m.',
  },
  {
    _id: 'mock-3',
    name: 'Ergonomic Mechanical Keyboard',
    price: 6299,
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'],
    stock: 5,
    category: 'Electronics',
    isFeaturedInSlider: true,
    description: 'RGB customizable backlighting, tactile mechanical switches, and solid aluminum build.',
  },
  {
    _id: 'mock-4',
    name: 'Organic Cotton Casual Hoodie',
    price: 1999,
    images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80'],
    stock: 20,
    category: 'Fashion',
    isFeaturedInSlider: false,
    description: 'Ultra-soft fleece hoodie designed for maximum comfort and modern streetwear style.',
  },
  {
    _id: 'mock-5',
    name: 'Smart Fitness & Health Tracker',
    price: 2799,
    images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=80'],
    stock: 15,
    category: 'Sports & Fitness',
    isFeaturedInSlider: true,
    description: 'Real-time heart rate monitoring, sleep analysis, and multi-sport activity tracking.',
  },
  {
    _id: 'mock-6',
    name: 'Stainless Steel Insulated Bottle',
    price: 899,
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80'],
    stock: 30,
    category: 'Home & Kitchen',
    isFeaturedInSlider: false,
    description: 'Double-wall vacuum insulation keeps drinks ice cold for 24 hours or piping hot for 12 hours.',
  },
];

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

      if (data.success && data.products.length > 0) {
        if (pageNum === 1) {
          setProducts(data.products);
        } else {
          setProducts((prev) => [...prev, ...data.products]);
        }
        setTotalCount(data.pagination?.total || data.products.length);
        setHasMore(pageNum < (data.pagination?.pages || 1));

        // Featured products query
        const featuredRes = await fetch('/api/products?featured=true');
        const featuredData = await featuredRes.json();
        if (featuredData.success && featuredData.products.length > 0) {
          setFeaturedProducts(featuredData.products);
        } else {
          setFeaturedProducts(data.products.filter(p => p.isFeaturedInSlider));
        }
      } else {
        // Fallback to sample items if DB is empty
        const filteredMock = MOCK_PRODUCTS.filter((p) => {
          const matchCat = cat === 'All' || p.category === cat;
          const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
          return matchCat && matchSearch;
        });
        setProducts(filteredMock);
        setFeaturedProducts(MOCK_PRODUCTS.filter((p) => p.isFeaturedInSlider));
        setTotalCount(filteredMock.length);
        setHasMore(false);
      }
    } catch (err) {
      console.warn('DB fetch fallback to sample products:', err);
      const filteredMock = MOCK_PRODUCTS.filter((p) => {
        const matchCat = cat === 'All' || p.category === cat;
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
      });
      setProducts(filteredMock);
      setFeaturedProducts(MOCK_PRODUCTS.filter((p) => p.isFeaturedInSlider));
      setTotalCount(filteredMock.length);
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="flex items-center gap-3 p-2">
            <Truck className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Free & Fast Delivery</h4>
              <p className="text-[10px] text-slate-400">On all orders above ₹999</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Razorpay Secure</h4>
              <p className="text-[10px] text-slate-400">256-bit encrypted checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <RefreshCw className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Easy Returns</h4>
              <p className="text-[10px] text-slate-400">7 days replacement window</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <Clock className="w-8 h-8 text-emerald-400 shrink-0" />
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
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-sm">
                M
              </div>
              <span className="font-extrabold text-lg text-white">MADANI</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Your premier destination for high quality goods, seamless shopping experience, and instant order updates.
            </p>
          </div>

          <div className="text-xs space-y-1">
            <p>© {new Date().getFullYear()} MADANI E-Commerce. All rights reserved.</p>
            <p className="text-slate-500">Powered by Next.js App Router, MongoDB Atlas, Firebase & Razorpay.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
