import React, { useState } from 'react';
import { Truck, RotateCcw, ShieldCheck, Gem, Sparkles, Check } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
  };

  return (
    <section className="bg-[#0b0d11] py-16 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* 4 Trust Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <Truck className="w-6 h-6 text-[#d4af37] mx-auto" />
            <h4 className="text-xs uppercase tracking-wider font-semibold text-white">
              Nationwide Delivery
            </h4>
            <p className="text-[11px] text-zinc-400">
              Cash on Delivery (COD) across Pakistan · 2–4 business days via express courier
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <RotateCcw className="w-6 h-6 text-[#d4af37] mx-auto" />
            <h4 className="text-xs uppercase tracking-wider font-semibold text-white">
              7-Day Size Exchange
            </h4>
            <p className="text-[11px] text-zinc-400">
              Doorstep size exchanges across major cities of Pakistan
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <ShieldCheck className="w-6 h-6 text-[#d4af37] mx-auto" />
            <h4 className="text-xs uppercase tracking-wider font-semibold text-white">
              Genuine Leather
            </h4>
            <p className="text-[11px] text-zinc-400">
              100% full-grain calfskin upper with cushioned orthopedic insoles
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <Gem className="w-6 h-6 text-[#d4af37] mx-auto" />
            <h4 className="text-xs uppercase tracking-wider font-semibold text-white">
              Luxury Unboxing
            </h4>
            <p className="text-[11px] text-zinc-400">
              Signature magnetic gift box, travel dust bags & shoehorn included
            </p>
          </div>
        </div>

        {/* VIP Atelier Newsletter */}
        <div className="bg-[#12151e] border border-gold-subtle rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 gold-foil-line" />
          
          <div className="max-w-xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-[#d4af37] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Privé Atelier Society</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl text-[#f9e7c4]">
              Receive First Access to Limited Last Runs
            </h3>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
              Join our private registry for seasonal lookbooks, invitation-only trunk shows, and an introductory privilege of 15% toward your inaugural commission.
            </p>

            {subscribed ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Benvenuto. Your private atelier code is <strong className="text-white tracking-widest font-mono">VIP15</strong> (applied automatically at checkout).</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your personal email address..."
                  required
                  className="flex-1 bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8329] text-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 transition-all shrink-0"
                >
                  Join Society
                </button>
              </form>
            )}

            {/* Official WhatsApp Channel Callout */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                    <path d="M12.031 2C6.496 2 2 6.495 2 12.029c0 1.99.582 3.865 1.624 5.46L2.2 21.8l4.475-1.397a9.988 9.988 0 0 0 5.356 1.626h.004c5.534 0 10.029-4.495 10.029-10.03C22.064 6.495 17.567 2 12.031 2zm5.836 14.184c-.244.686-1.42 1.31-1.956 1.396-.51.082-1.16.117-1.873-.111-.43-.138-.987-.323-1.696-.632-2.984-1.3-4.93-4.32-5.08-4.52-.148-.198-1.205-1.602-1.205-3.056 0-1.455.76-2.17 1.03-2.464.271-.295.592-.368.79-.368.197 0 .394.002.565.01.183.008.43-.07.671.512.247.595.84 2.052.913 2.202.074.148.123.324.024.52-.098.197-.148.32-.295.493-.148.172-.31.385-.444.516-.148.147-.302.308-.13.603.173.296.768 1.266 1.65 2.052 1.135 1.01 2.091 1.323 2.387 1.47.296.148.468.123.64-.074.173-.197.74-.862.937-1.158.197-.296.395-.246.666-.148.27.098 1.727.813 2.023.961.296.148.493.222.566.345.074.123.074.715-.17 1.401z" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">Official WhatsApp Channel</span>
                  <span className="text-[11px] text-zinc-400 block">Instant alerts for new drops, stock arrivals & secret promotions</span>
                </div>
              </div>

              <a
                href="https://whatsapp.com/channel/0029VbDaihxJ3jv4LJUrRx1r"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 hover:scale-105 active:scale-95"
              >
                <span>Join Channel</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
