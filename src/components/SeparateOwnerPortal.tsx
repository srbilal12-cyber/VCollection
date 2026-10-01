import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { Product, Order } from '../types';
import { OwnerDashboard } from './OwnerDashboard';
import { AUTHORIZED_OWNER_EMAIL, OWNER_PASSWORD } from './OwnerAuthModal';

interface SeparateOwnerPortalProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onResetProducts: () => void;
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  onUpdateOrderDetails: (orderId: string, updates: Partial<Order>) => void;
  onViewProductStorefront: (product: Product) => void;
  onReturnToStorefront: () => void;
  theme?: 'dark' | 'bright';
  ownerEmail: string;
  isOwnerAuthenticated: boolean;
  onLoginSuccess: (email: string) => void;
  onLogoutOwner: () => void;
}

export const SeparateOwnerPortal: React.FC<SeparateOwnerPortalProps> = ({
  products,
  orders,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetProducts,
  onUpdateOrderStatus,
  onUpdateOrderDetails,
  onViewProductStorefront,
  onReturnToStorefront,
  theme = 'dark',
  ownerEmail,
  isOwnerAuthenticated,
  onLoginSuccess,
  onLogoutOwner,
}) => {
  // Empty inputs - user enters their own credentials
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    const cleanEmail = emailInput.trim().toLowerCase();

    setTimeout(() => {
      setIsLoggingIn(false);

      if (cleanEmail !== AUTHORIZED_OWNER_EMAIL.toLowerCase()) {
        setLoginError('Access denied: Unauthorized administrative email address.');
        return;
      }

      if (passwordInput !== OWNER_PASSWORD) {
        setLoginError('Incorrect password. Please verify and try again.');
        return;
      }

      onLoginSuccess(cleanEmail);
    }, 350);
  };

  // If not authenticated, show secure, elegant login screen
  if (!isOwnerAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090e] text-[#e6e8eb] flex flex-col justify-between font-sans selection:bg-[#d4af37]/30 selection:text-[#f9e7c4] relative">
        <div className="noise-grain-overlay" aria-hidden="true" />

        {/* Top Minimal Portal Header */}
        <header className="border-b border-white/10 bg-[#0d1017]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg tracking-[0.2em] font-bold text-[#f5ebd7] uppercase">
              V COLLECTION
            </span>
            <span className="hidden sm:inline-block text-zinc-600">|</span>
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
              <span>Owner Portal</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onReturnToStorefront}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </button>
        </header>

        {/* Center Login Box */}
        <main className="flex-1 flex items-center justify-center p-4 z-20">
          <div className="w-full max-w-md bg-[#12151e] border border-gold-subtle rounded-3xl shadow-2xl overflow-hidden relative p-8 space-y-6">
            <div className="absolute top-0 inset-x-0 gold-foil-line" />

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] mx-auto flex items-center justify-center shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#f9e7c4] pt-2">
                Executive Portal Login
              </h1>
              <p className="text-xs text-zinc-400">
                Authorized management access for store operations and order fulfillment.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
                  Email Address:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter owner email"
                    className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
                  Password:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white outline-none focus:border-[#d4af37]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e2c158] to-[#aa8329] text-black font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.99] transition-all shadow-xl shadow-[#d4af37]/20 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isLoggingIn ? 'Authenticating...' : 'Sign In to Portal'}</span>
              </button>
            </form>
          </div>
        </main>

        <footer className="border-t border-white/5 py-4 px-6 text-center text-xs text-zinc-500 z-20">
          V Collection Pakistan · Management Portal
        </footer>
      </div>
    );
  }

  // Authenticated Separate Owner Portal View
  return (
    <div className="min-h-screen bg-[#07090e] text-[#e6e8eb] flex flex-col font-sans selection:bg-[#d4af37]/30 selection:text-[#f9e7c4] relative">
      <div className="noise-grain-overlay" aria-hidden="true" />

      {/* Clean Executive Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0d1017]/95 backdrop-blur-md border-b border-[#d4af37]/30 shadow-xl px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#8c6d1f] text-black font-serif font-bold text-base flex items-center justify-center shadow">
            V
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm sm:text-base font-bold tracking-widest text-[#f5ebd7] uppercase">
                V COLLECTION
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-[10px] font-bold uppercase tracking-wider">
                Owner Portal
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{ownerEmail}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Executive Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={onReturnToStorefront}
            className="px-4 py-2 rounded-xl bg-[#d4af37] hover:brightness-110 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Customer Storefront</span>
          </button>

          <button
            type="button"
            onClick={onLogoutOwner}
            className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition-colors"
            title="Lock & Exit Owner Portal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Owner Dashboard Content */}
      <main className="flex-1 z-20 pb-12">
        <OwnerDashboard
          products={products}
          orders={orders}
          onAddProduct={onAddProduct}
          onUpdateProduct={onUpdateProduct}
          onDeleteProduct={onDeleteProduct}
          onResetProducts={onResetProducts}
          onUpdateOrderStatus={onUpdateOrderStatus}
          onUpdateOrderDetails={onUpdateOrderDetails}
          onViewProductStorefront={onViewProductStorefront}
          onCloseOwnerPortal={onReturnToStorefront}
          theme={theme}
          ownerEmail={ownerEmail}
          isOwnerAuthenticated={isOwnerAuthenticated}
          onOpenAuthModal={() => {}}
          onLogoutOwner={onLogoutOwner}
        />
      </main>
    </div>
  );
};
