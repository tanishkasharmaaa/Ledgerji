'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth.store';
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back! 👋');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-sm mx-auto w-full">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-white shadow-md shadow-primary-100/50 border border-slate-100 overflow-hidden p-1">
            <Image 
              src="/ledgerji-var1.svg" 
              alt="LedgerJi Logo"
              width={44}
              height={44}
              className="w-90 h-90 object-contain"
              priority
            />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">LedgerJi</h1>
          <p className="text-slate-500 text-sm mt-0.5">Simple money tracking</p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-900">Welcome back</h2>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-touch pl-10 w-full"
                required
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input-touch pl-10 pr-10 w-full"
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-sm text-slate-600">
          New to LedgerJi?{' '}
          <Link href="/register" className="text-primary-600 font-semibold hover:underline decoration-2">
            Create free account
          </Link>
        </p>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl backdrop-blur-sm">
          <p className="text-xs font-semibold text-amber-900 flex items-center gap-1.5 mb-2">
            <span>📋</span> Demo Account
          </p>
          <div className="space-y-1 font-mono text-xs text-amber-800 selection:bg-amber-200">
            <p><span className="font-sans font-medium text-amber-700/80">Email:</span> demo@ledgerji.com</p>
            <p><span className="font-sans font-medium text-amber-700/80">Password:</span> demo1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}