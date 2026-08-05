'use client';

import { useState, useEffect, useRef, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import {
  ShoppingBag,
  ArrowLeft,
  Check,
  ShieldCheck,
  Truck,
  Minus,
  Plus,
  Loader2,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const PLACEHOLDER_IMG = 'https://placehold.co/800x800/1a1e2e/d4af37?text=ROQAYYA';
const SWIPE_THRESHOLD = 40; // px

export default function ProductDetailPage({ params }) {
  const { id } = use(params);
  const [product, setProduct] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [shared, setShared] = useState(false);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          setActiveIndex(0);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error(err);
        setProduct(null);
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

  const handleShare = async () => {
    if (!product) return;
    const shareUrl = window.location.href;
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} — ₹${product.price} on ROQAYYA`,
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShared(true);
        setTimeout(() => setShared(false), 1800);
      }
    } catch (err) {
      // User cancelled the share sheet — ignore silently
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gold-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <Link href="/" className="text-gold-400 hover:underline text-sm flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Storefront
          </Link>
        </div>
      </div>
    );
  }

  const mainImg = product.images?.[activeIndex] || product.images?.[0] || PLACEHOLDER_IMG;
  const imageCount = product.images?.length || 0;
  const specs = [
    product.color && { label: 'Color', value: product.color },
    product.size && { label: 'Size', value: product.size },
    product.fabric && { label: 'Fabric', value: product.fabric },
  ].filter(Boolean);

  const goToImage = (idx) => {
    if (imageCount === 0) return;
    setActiveIndex((idx + imageCount) % imageCount);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchDeltaX.current > SWIPE_THRESHOLD) {
      goToImage(activeIndex - 1);
    } else if (touchDeltaX.current < -SWIPE_THRESHOLD) {
      goToImage(activeIndex + 1);
    }
    touchDeltaX.current = 0;
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back Link + Share */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-gold-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-300 bg-dark-900 border border-gold-500/30 hover:bg-gold-500/10 px-3 py-1.5 rounded-full transition-colors"
          >
            {shared ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            {shared ? 'Link Copied' : 'Share'}
          </button>
        </div>

        {/* Details Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-dark-900/60 border border-gold-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl">

          {/* Gallery Side */}
          <div className="space-y-4">
            <div
              className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-dark-950 border border-gold-900/40 shadow-inner select-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <Image
                src={mainImg}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />

              {imageCount > 1 && (
                <>
                  <button
                    onClick={() => goToImage(activeIndex - 1)}
                    aria-label="Previous image"
                    className="hidden sm:flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-dark-950/70 backdrop-blur-sm border border-gold-500/30 text-gold-300 hover:bg-gold-500/20 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => goToImage(activeIndex + 1)}
                    aria-label="Next image"
                    className="hidden sm:flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-dark-950/70 backdrop-blur-sm border border-gold-500/30 text-gold-300 hover:bg-gold-500/20 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Dot Indicators */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {product.images.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                          i === activeIndex ? 'w-5 bg-gold-400' : 'w-1.5 bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail switcher */}
            {imageCount > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      activeIndex === idx
                        ? 'border-gold-500 scale-105 shadow-md'
                        : 'border-gold-900/40 opacity-60 hover:opacity-100'
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
                <span className="text-xs font-extrabold uppercase tracking-wider text-gold-400 bg-gold-500/10 border border-gold-500/30 px-3 py-1 rounded-full">
                  {product.category}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Stock: <strong className="text-white">{product.stock}</strong> units
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {product.name}
              </h1>

              <span className="text-3xl font-black text-white block">₹{product.price}</span>

              {specs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {specs.map((s) => (
                    <span
                      key={s.label}
                      className="text-xs font-semibold text-slate-200 bg-dark-950 border border-gold-900/40 px-3 py-1 rounded-lg"
                    >
                      {s.label}: <span className="text-gold-300">{s.value}</span>
                    </span>
                  ))}
                </div>
              )}

              <p className="text-sm text-slate-300 leading-relaxed border-t border-b border-gold-900/30 py-4">
                {product.description || 'Crafted with premium materials to deliver outstanding quality and comfort.'}
              </p>
            </div>

            {/* Quantity Controls & Action */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-400 uppercase">Quantity:</span>
                <div className="flex items-center border border-gold-900/40 bg-dark-950 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-bold text-white text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2.5 text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
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
                      ? 'bg-gold-500 text-dark-950'
                      : product.stock <= 0
                      ? 'bg-dark-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gold-500 hover:bg-gold-400 text-dark-950 shadow-gold-500/20 active:scale-95'
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
                  className="py-3.5 px-6 rounded-xl bg-dark-800 hover:bg-dark-800/70 text-white font-extrabold text-sm text-center border border-gold-900/40 shadow-md transition-all"
                >
                  Buy Now
                </Link>
              </div>
            </div>

            {/* Guarantee badges */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gold-900/30 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gold-400" />
                <span>All India Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold-400" />
                <span>Premium Quality</span>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}