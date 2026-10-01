import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  AlertCircle,
  CheckCircle2,
  X,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface OwnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
  currentEmail?: string;
  isOwnerAuthenticated: boolean;
  onLogout: () => void;
}

export const AUTHORIZED_OWNER_EMAIL = 'srbilal12@gmail.com';
export const OWNER_PASSWORD = 'v.team@123';

export const OwnerAuthModal: React.FC<OwnerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentEmail = '',
  isOwnerAuthenticated,
  onLogout,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Reset states on open
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setPasswordInput('');
      setEmailInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    const cleanEmail = emailInput.trim().toLowerCase();

    setTimeout(() => {
      setIsVerifying(false);

      if (cleanEmail !== AUTHORIZED_OWNER_EMAIL.toLowerCase()) {
        setError('Access denied: Unauthorized email address.');
        return;
      }

      if (passwordInput !== OWNER_PASSWORD) {
        setError('Incorrect password. Please verify and try again.');
        return;
      }

      // Successful authentication
      onSuccess(cleanEmail);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#12151e] border border-gold-subtle rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 inset-x-0 gold-foil-line" />

        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#d4af37] font-semibold block">
                Atelier Administration
              </span>
              <h3 className="font-serif text-lg text-[#f9e7c4]">
                Owner Portal Sign In
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {isOwnerAuthenticated ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-xl text-white">Owner Verified & Active</h4>
                <p className="text-xs text-zinc-400">
                  Logged in with authorized owner account:
                </p>
                <div className="inline-block px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#f9e7c4] text-xs font-mono font-semibold">
                  {AUTHORIZED_OWNER_EMAIL}
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                You have full authority to list new footwear, update prices (PKR 2,500 - 10,000), upload gallery photos, and fulfill customer orders.
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8329] text-black text-xs font-semibold uppercase tracking-wider hover:brightness-110 shadow-md"
                >
                  Enter Portal
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs font-semibold hover:bg-rose-900/60"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-xs text-[#f5ebd7] font-medium">
                  <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Confidential Management Access</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Enter your owner credentials to manage shoe listings, prices, and client orders.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Owner Email */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-zinc-300 font-semibold block">
                  Owner Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setError(null);
                    }}
                    placeholder="name@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Owner Password */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-zinc-300 font-semibold block">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter password..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37] font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-zinc-400 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isVerifying || !passwordInput}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8329] text-black text-xs font-semibold uppercase tracking-wider hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-lg"
                >
                  <span>{isVerifying ? 'Authenticating...' : 'Sign In as Owner'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
