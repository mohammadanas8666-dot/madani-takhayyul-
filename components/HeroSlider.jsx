'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const PLACEHOLDER_IMG = 'https://placehold.co/800x500/1a1e2e/d4af37?text=KAZRI';
const AUTO_SLIDE_INTERVAL = 3000; // ms between auto-advances
const RESUME_DELAY = 3500; // ms of no user interaction before auto-slide resumes

export default function HeroSlider({ featuredProducts = [] }) {
  const scrollRef = useRef(null);
  const autoTimerRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const stepRight = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const slideWidth = el.firstElementChild?.offsetWidth || el.clientWidth;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;

    if (atEnd) {
      // Loop back to the start smoothly
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: slideWidth, behavior: 'smooth' });
    }
  }, []);

  const startAutoSlide = useCallback(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    autoTimerRef.current = setInterval(stepRight, AUTO_SLIDE_INTERVAL);
  }, [stepRight]);

  const stopAutoSlide = useCallback(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
  }, []);

  // Pause autoplay briefly whenever the user manually interacts (drag/swipe/scroll),
  // then resume automatically — so both directions work: auto-slide + manual swipe.
  const handleUserInteraction = useCallback(() => {
    stopAutoSlide();
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(startAutoSlide, RESUME_DELAY);
  }, [stopAutoSlide, startAutoSlide]);

  // Track which slide is active (for dot indicators) as the user scrolls/swipes
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const slideWidth = el.firstElementChild?.offsetWidth || el.clientWidth;
    const index = Math.round(el.scrollLeft / slideWidth);
    setActiveIndex(index);
  }, []);

  const goToSlide = useCallback((index) => {
    const el = scrollRef.current;
    if (!el) return;
    const slideWidth = el.firstElementChild?.offsetWidth || el.clientWidth;
    el.scrollTo({ left: index * slideWidth, behavior: 'smooth' });
    handleUserInteraction();
  }, [handleUserInteraction]);

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
    <div className="relative w-full">
      <div
        ref={scrollRef}
        onPointerDown={handleUserInteraction}
        onWheel={handleUserInteraction}
        onTouchStart={handleUserInteraction}
        onScroll={handleScroll}
        className="flex w-full overflow-x-auto scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {featuredProducts.map((product) => {
          const imgUrl = product.images?.[0] || PLACEHOLDER_IMG;
          return (
            <Link
              key={product._id}
              href={`/product/${product._id}`}
              className="snap-center shrink-0 w-full group"
            >
              <div className="relative w-full h-56 sm:h-80 lg:h-96 overflow-hidden bg-dark-900">
                <Image
                  src={imgUrl}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-dark-950/10 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex items-end justify-between gap-2">
                  <span className="text-white font-bold text-sm sm:text-xl line-clamp-1">
                    {product.name}
                  </span>
                  <span className="shrink-0 bg-gold-500 text-dark-950 font-black text-sm sm:text-lg px-3 py-1 rounded-full shadow-lg">
                    ₹{product.price}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Dot Indicators */}
      {featuredProducts.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {featuredProducts.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? 'w-5 bg-gold-400' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}