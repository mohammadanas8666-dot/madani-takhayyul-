'use client';

import { useState } from 'react';
import { X, Mail, Lock, LogIn, UserPlus, Chrome, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signupWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

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
            {isSignUp ? <UserPlus className="w-5 h-5 text-gold-400" /> : <LogIn className="w-5 h-5 text-gold-400" />}
            {isSignUp ? 'Create Account' : 'Welcome Back'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-dark-950 border border-gold-900/40 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-dark-950 border border-gold-900/40 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gold-600 hover:bg-gold-500 text-dark-950 font-extrabold text-sm shadow-lg transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gold-900/40"></div>
          </div>
          <span className="relative bg-dark-900 px-3 text-xs text-slate-400 uppercase font-semibold">
            Or continue with
          </span>
        </div>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-dark-800 hover:bg-dark-800/70 text-white font-bold text-sm border border-gold-900/50 shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Chrome className="w-4 h-4 text-gold-400" />
          <span>Sign in with Google</span>
        </button>

        {/* Switch mode */}
        <div className="mt-6 text-center text-xs text-slate-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-gold-400 font-bold hover:underline ml-1"
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </div>

      </div>
    </div>
  );
}
