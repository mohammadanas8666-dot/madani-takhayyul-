'use client';

import Header from '@/components/Header';
import { ShieldCheck, Truck, Sparkles, Award, Mail, Phone, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold-500/20 text-gold-300 border border-gold-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Empowering Excellence
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            About ROQAYYA
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            ROQAYYA is a premium Islamic wear store — Pagdi/Amama, Jubba/Aba, Kurta/Thobe, Rumal, Topi and more, crafted for quality and elegance. Built with speed, security, and customer delight at its core.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-dark-900/80 border border-gold-900/40 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-500/30 text-gold-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Curated Quality</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every item in our store is carefully inspected and verified for craftsmanship and long-lasting durability.
            </p>
          </div>

          <div className="p-6 bg-dark-900/80 border border-gold-900/40 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-500/30 text-gold-400 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Swift Express Delivery</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We partner with top logistics networks to ensure your orders reach your doorstep smoothly with live tracking.
            </p>
          </div>

          <div className="p-6 bg-dark-900/80 border border-gold-900/40 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-500/30 text-gold-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Razorpay Protected</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Shop with absolute peace of mind using bank-grade encrypted checkout powered by Razorpay.
            </p>
          </div>
        </div>

        {/* Contact info card */}
        <div className="bg-dark-900/90 border border-gold-900/40 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-2xl">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">Get in Touch</h2>
            <p className="text-xs text-slate-300">
              Have questions about your order, products, or partnerships? Reach out to our 24/7 customer support team.
            </p>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold-400" />
                <span>support@madani.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold-400" />
                <span>+91 1800-123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gold-400" />
                <span>Tech Park Tower B, Cyber City, India</span>
              </div>
            </div>
          </div>

          {/* Quick Contact Form */}
          <div className="bg-dark-950 p-6 rounded-2xl border border-gold-900/40 space-y-3">
            <h3 className="text-sm font-bold text-white">Send us a message</h3>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full bg-dark-900 border border-gold-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full bg-dark-900 border border-gold-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
            />
            <textarea
              placeholder="Your message..."
              rows={3}
              className="w-full bg-dark-900 border border-gold-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
            />
            <button
              type="button"
              onClick={() => alert('Thank you for reaching out! We will get back to you shortly.')}
              className="w-full py-2.5 rounded-xl bg-gold-600 hover:bg-gold-500 text-dark-950 font-bold text-xs shadow-md transition-all"
            >
              Submit Message
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}