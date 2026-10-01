import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Star,
  Database
} from 'lucide-react';
import { UserProfile } from '../types';
import { syncCustomerToSupabase, SUPABASE_PROJECT_ID } from '../lib/supabase';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  contextMessage?: string | null;
  defaultMode?: 'signin' | 'signup';
}

const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Sialkot',
  'Gujranwala',
  'Quetta',
  'Hyderabad',
];

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  contextMessage,
  defaultMode = 'signup',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Lahore');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const cleanEmail = email.trim().toLowerCase();

    setTimeout(() => {
      setIsSubmitting(false);

      if (mode === 'signup') {
        if (!name.trim()) {
          setError('Please provide your full name.');
          return;
        }
        if (!cleanEmail || !cleanEmail.includes('@')) {
          setError('Please enter a valid email address.');
          return;
        }
        if (password.length < 6) {
          setError('Password should be at least 6 characters.');
          return;
        }

        // Create new customer profile
        const newUser: UserProfile = {
          id: `usr-${Date.now()}`,
          name: name.trim(),
          email: cleanEmail,
          tier: 'Patron',
          points: 150, // 150 welcome bonus points
          savedAddresses: [
            {
              id: `addr-init-${Date.now()}`,
              fullName: name.trim(),
              phone: phone.trim() || '0300 1234567',
              street: 'Main Residency',
              city: city,
              postalCode: '54000',
              country: 'Pakistan',
              isDefault: true,
            },
          ],
          orders: [],
          wishlistIds: [],
        };

        // Save to registered accounts list in localStorage
        try {
          const stored = localStorage.getItem('vcollection_registered_users');
          const usersList = stored ? JSON.parse(stored) : [];
          usersList.push({ ...newUser, password });
          localStorage.setItem('vcollection_registered_users', JSON.stringify(usersList));
        } catch (e) {
          console.error('Error saving user registration', e);
        }

        // ☁️ Sync directly to Supabase Backend
        syncCustomerToSupabase(newUser, password).catch((err) => {
          console.warn('[Supabase Sync Warning]:', err);
        });

        onLoginSuccess(newUser);
        onClose();
      } else {
        // Sign in mode
        if (!cleanEmail) {
          setError('Please enter your email.');
          return;
        }
        if (!password) {
          setError('Please enter your password.');
          return;
        }

        // Check against registered users
        let matchedUser: UserProfile | null = null;
        try {
          const stored = localStorage.getItem('vcollection_registered_users');
          if (stored) {
            const usersList = JSON.parse(stored);
            const found = usersList.find(
              (u: any) => u.email.toLowerCase() === cleanEmail && u.password === password
            );
            if (found) {
              const { password: _, ...rest } = found;
              matchedUser = rest;
            }
          }
        } catch (e) {
          console.error(e);
        }

        // If not found in custom registered, allow fallback to initial patron or sign in
        if (!matchedUser) {
          matchedUser = {
            id: `usr-${Date.now()}`,
            name: cleanEmail.split('@')[0].replace('.', ' ').replace(/^./, (c) => c.toUpperCase()),
            email: cleanEmail,
            tier: 'Patron',
            points: 100,
            savedAddresses: [
              {
                id: `addr-${Date.now()}`,
                fullName: cleanEmail.split('@')[0],
                phone: '0300 8472910',
                street: 'Gulberg III, MM Alam Road',
                city: 'Lahore',
                postalCode: '54000',
                country: 'Pakistan',
                isDefault: true,
              },
            ],
            orders: [],
            wishlistIds: [],
          };
        }

        // ☁️ Sync login to Supabase Backend
        syncCustomerToSupabase(matchedUser, password).catch((err) => {
          console.warn('[Supabase Login Sync Warning]:', err);
        });

        onLoginSuccess(matchedUser);
        onClose();
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#12151e] border border-gold-subtle rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col my-8">
        {/* Top Gold Accent */}
        <div className="absolute top-0 inset-x-0 gold-foil-line" />

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#d4af37] font-semibold block">
                V Collection Pakistan
              </span>
              <h3 className="font-serif text-lg text-white">
                {mode === 'signup' ? 'Create Customer Account' : 'Customer Sign In'}
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

        {/* Context Banner (e.g. When triggered from Review) */}
        {contextMessage ? (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-start gap-3">
            <Star className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5 fill-[#d4af37]" />
            <div className="text-xs">
              <span className="font-semibold text-[#f9e7c4] block">Account Required to Review</span>
              <p className="text-zinc-300 text-[11px] leading-relaxed mt-0.5">
                {contextMessage}
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5 text-xs text-zinc-300">
            <ShieldCheck className="w-4 h-4 text-[#d4af37] shrink-0" />
            <span>Join our VIP Artisan Circle for orders, tracking & verified reviews.</span>
          </div>
        )}

        {/* Mode Tabs */}
        <div className="px-6 pt-3">
          <div className="flex rounded-xl bg-black/40 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#aa8329] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Create Account (Sign Up)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#aa8329] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-zinc-300 font-semibold block">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Asad Rehman"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-zinc-300 font-semibold block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. asad@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-zinc-300 font-semibold block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-zinc-400 hover:text-white absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-zinc-300 font-semibold block">
                  City (Pakistan)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c} className="bg-[#12151e]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-zinc-300 font-semibold block">
                  Mobile / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>Includes +150 Welcome Artisanal Points and verified review rights.</span>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f9e7c4] to-[#aa8329] text-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Register & Continue' : 'Sign In to Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
