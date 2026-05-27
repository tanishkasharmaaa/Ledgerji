'use client';

import { motion } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm"
      >
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-5">
          <WifiOff size={36} className="text-slate-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">You're Offline</h1>
        <p className="text-sm text-slate-500 mb-6">
          It looks like you don't have an internet connection. Check your connection
          and try again.
        </p>
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="btn-primary-touch w-full inline-flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            Try Again
          </Link>
          <p className="text-xs text-slate-400">
            LedgerJi works offline too — your data will sync when you're back online.
          </p>
        </div>
      </motion.div>
    </div>
  );
}