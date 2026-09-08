'use client';

import { useState } from 'react';
import { X, Chrome, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginWithGoogle } = useAuth();

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-dark-900 border border-gold-900/40 rounded-2xl shadow-2xl p-6 text-white z-10 animate-scaleUp">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold-900/40 pb-4 mb-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <LogIn className="w-5 h-5 text-gold-400" />
            Welcome to KAZRI
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <p className="text-sm text-slate-400 text-center mb-6">
          Sign in with your Google account to continue — fast, secure, and no password to remember.
        </p>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-dark-800 hover:bg-dark-800/70 text-white font-bold text-sm border border-gold-900/50 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Chrome className="w-4 h-4 text-gold-400" />
          <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
        </button>

      </div>
    </div>
  );
}
