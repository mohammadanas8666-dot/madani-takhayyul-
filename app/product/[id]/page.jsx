'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { 
  ShoppingBag, 
  ArrowLeft, 
  Check, 
  Star, 
  ShieldCheck, 
  Truck, 
  Minus, 
  Plus,
  Loader2 
} from 'lucide-react';

export default function ProductDetailPage({ params }) {
  const { id } = use(params);
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          setSelectedImage(data.product.images?.[0] || '');
        } else {
          // Fallback mock detail
          setProduct({
            _id: id,
            name: 'Premium Wireless Headphones',
            price: 3499,
            images: [
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
            ],
            stock: 12,
            category: 'Electronics',
            description: 'Immerse yourself in crystal clear audio with high-definition drivers, active noise cancellation, and ergonomic ear cushions designed for all-day listening.'
          });
          setSelectedImage('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-emerald-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <Link href="/" className="text-emerald-400 hover:underline text-sm flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Storefront
          </Link>
        </div>
      </div>
    );
  }

  const mainImg = selectedImage || product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>

        {/* Details Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          
          {/* Gallery Side */}
          <div className="space-y-4">
            <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
              <Image
                src={mainImg}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Thumbnail switcher */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === img
                        ? 'border-emerald-500 scale-105 shadow-md'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Side */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                  {product.category || 'General'}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Stock: <strong className="text-white">{product.stock}</strong> units
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-black text-white">₹{product.price}</span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>4.9 / 5.0 rating</span>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed border-t border-b border-slate-800/80 py-4">
                {product.description || 'Crafted with premium materials to deliver outstanding performance and dependability.'}
              </p>
            </div>

            {/* Quantity Controls & Action */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-400 uppercase">Quantity:</span>
                <div className="flex items-center border border-slate-800 bg-slate-950 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-bold text-white text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                    added
                      ? 'bg-emerald-500 text-slate-950'
                      : product.stock <= 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-500/20 active:scale-95'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5" /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" /> Add to Cart
                    </>
                  )}
                </button>

                <Link
                  href="/checkout"
                  onClick={() => addToCart(product, quantity)}
                  className="py-3.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm text-center border border-slate-700 shadow-md transition-all"
                >
                  Buy Now
                </Link>
              </div>
            </div>

            {/* Guarantee badges */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Express Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Authentic Guarantee</span>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
