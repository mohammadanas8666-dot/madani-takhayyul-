'use client';

import { useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const PLACEHOLDER_IMG = 'https://placehold.co/300x300/1a1e2e/d4af37?text=ROQAYYA';
const AUTO_SLIDE_INTERVAL = 2200; // ms between auto-advances
const RESUME_DELAY = 3500; // ms of no user interaction before auto-slide resumes

export default function HeroSlider({ featuredProducts = [] }) {
  const scrollRef = useRef(null);
  const autoTimerRef = useRef(null);
  const resumeTimerRef = useRef(null);

  const stepRight = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const cardWidth = el.firstElementChild?.offsetWidth || 120;
    const gap = 12;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;

    if (atEnd) {
      // Loop back to the start smoothly
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
    }
  }, []);

  const startAutoSlide = useCallback(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    autoTimerRef.current = setInterval(stepRight, AUTO_SLIDE_INTERVAL);
  }, [stepRight]);

  const stopAutoSlide = useCallback(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
  }, []);

  // Pause autoplay briefly whenever the user manually interacts (drag/scroll),
  // then resume automatically — so both directions work, right auto + manual left.
  const handleUserInteraction = useCallback(() => {
    stopAutoSlide();
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(startAutoSlide, RESUME_DELAY);
  }, [stopAutoSlide, startAutoSlide]);

  useEffect(() => {
    if (featuredProducts.length > 1) {
      startAutoSlide();
    }
    return () => {
      stopAutoSlide();
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [featuredProducts.length, startAutoSlide, stopAutoSlide]);

  if (!featuredProducts || featuredProducts.length === 0) {
    return null;
  }

  return (
    <div
      ref={scrollRef}
      onPointerDown={handleUserInteraction}
      onWheel={handleUserInteraction}
      onTouchStart={handleUserInteraction}
      className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory py-3 px-0.5"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {featuredProducts.map((product) => {
        const imgUrl = product.images?.[0] || PLACEHOLDER_IMG;
        return (
          <Link
            key={product._id}
            href={`/product/${product._id}`}
            className="snap-start shrink-0 w-24 sm:w-32 flex flex-col gap-1 group"
          >
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-dark-900 border border-gold-900/40 group-hover:border-gold-500/60 transition-colors">
              <Image
                src={imgUrl}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-1 right-1 bg-dark-950/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-gold-400 font-bold text-[10px] border border-gold-500/30">
                ₹{product.price}
              </div>
            </div>
            <span className="text-[10px] text-slate-300 font-medium line-clamp-1 text-center">
              {product.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}