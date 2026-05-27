'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { cn, getInitials } from '@/lib/utils';
import {
  LayoutDashboard, Users, ArrowRightLeft, Bell, Settings,
  LogOut, Menu, X, IndianRupee,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
  { href: '/reminders', label: 'Reminders', icon: Bell },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, isInitialized } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Move programmatic layout routing shifts into an isolated side-effect.
  // This preserves structural chunk assignment states across runtime rehydration.
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isInitialized, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Render a clean fallback viewport shell during core state hydration checks
  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading your account…</p>
      </div>
    );
  }

  // If initialization has finished but user is unauthenticated, 
  // safely prevent content leak while letting layout shell finalize mounting cleanly
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* ---- Top Bar ---- */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 lg:hidden text-slate-600"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            
            <Link href="/dashboard" className="flex items-center gap-2.5 active:opacity-90 transition-opacity">
              <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                <Image 
                  src="/ledgerji-var1.svg" 
                  alt="LedgerJi Logo"
                  width={30}
                  height={30}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <span className="ml-0.2 font-bold text-lg text-slate-900 tracking-tight">LedgerJi</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <Link
                href="/settings"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                  {getInitials(user.name)}
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700">
                  {user.businessName || user.name}
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ---- Mobile Menu Overlay ---- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-20 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <nav
            className="absolute top-14 left-0 bottom-0 w-64 bg-white shadow-xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-touch text-base font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50',
                  )}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              ))}

              <hr className="my-3 border-slate-100" />

              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-touch text-base font-medium text-slate-600 hover:bg-slate-50"
              >
                <Settings size={20} />
                Settings
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-touch text-base font-medium text-red-600 hover:bg-red-50 w-full text-left"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* ---- Main Content ---- */}
      <main className="flex-1 pb-20 lg:pb-8">{children}</main>

      {/* ---- Bottom Navigation (Mobile) ---- */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 safe-bottom lg:hidden">
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors min-w-[64px]',
                pathname === item.href
                  ? 'text-primary-600'
                  : 'text-slate-400 hover:text-slate-600',
              )}
            >
              <item.icon size={20} strokeWidth={pathname === item.href ? 2.5 : 1.5} />
              <span className="text-2xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* ---- Quick Action FAB ---- */}
      <div className="fixed bottom-20 right-4 z-20 lg:hidden">
        <Link
          href="/transactions/new"
          className="w-14 h-14 bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-200 flex items-center justify-center active:scale-95 transition-transform"
        >
          <IndianRupee size={24} />
        </Link>
      </div>
    </div>
  );
}