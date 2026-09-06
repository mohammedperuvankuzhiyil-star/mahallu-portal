'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Lock, User, AlertCircle, Eye, EyeOff, Sun, Moon, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push(data.redirect || '/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-slate-100 dark:bg-slate-950 transition-colors relative">
      {/* Theme Switcher in top corner */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-md border border-slate-200 dark:border-slate-800 transition-all hover:scale-105"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md md:max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-300/40 dark:shadow-black/60 border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-all">
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Photo Showcase */}
          <div className="relative h-56 sm:h-64 md:h-auto min-h-[240px] md:min-h-[480px] bg-slate-900 overflow-hidden">
            <img
              src="/masjid.jpg"
              alt="Masjid Al-Fatah"
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-[11px] font-semibold tracking-widest text-emerald-400 uppercase drop-shadow">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight drop-shadow-md mt-1">
                Masjid Al-Fatah
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-sm drop-shadow">
                Mahallu Welfare, Census &amp; Student Career Portal
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600/80 backdrop-blur-sm text-[10px] font-bold text-white border border-emerald-400/30">
                  <ShieldCheck className="w-3 h-3" />
                  Official Mahallu Portal
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Sign In Form */}
          <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                <span>Welcome Back</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Sign In to Portal
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Access volunteer census forms or Mahallu admin dashboard
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Portal</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Masjid Al-Fatah Mahallu Management Committee
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
