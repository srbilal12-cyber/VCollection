import React from 'react';
import { Sparkles, Shield, Heart, Phone } from 'lucide-react';
import { Category } from '../types';

interface FooterProps {
  onNavigatePage: (page: string) => void;
  onSelectCategory: (cat: Category) => void;
  onOpenOwnerAuth?: () => void;
  onOpenTracker?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigatePage,
  onSelectCategory,
  onOpenOwnerAuth,
  onOpenTracker,
}) => {
  return (
    <footer className="bg-[#08090d] border-t border-gold-subtle/30 pt-16 pb-12 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <span className="font-serif text-2xl font-bold tracking-[0.25em] text-[#f5ebd7] block uppercase">
              V COLLECTION
            </span>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm font-light">
              Classical luxury footwear created in the Riviera del Brenta tradition. Goodyear-welted construction, hand-burnished French box calfskin, and bespoke lasting since 1974.
            </p>
            <div className="pt-2 flex items-center gap-3 text-zinc-500">
              <span className="text-[11px] uppercase tracking-wider text-[#d4af37]">Lahore</span>
              <span>·</span>
              <span className="text-[11px] uppercase tracking-wider text-[#d4af37]">Karachi</span>
              <span>·</span>
              <span className="text-[11px] uppercase tracking-wider text-[#d4af37]">Islamabad</span>
              <span>·</span>
              <span className="text-[11px] uppercase tracking-wider text-[#d4af37]">Nationwide Delivery</span>
            </div>
          </div>

          {/* Collections Column */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
              The Archive
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('formal');
                    onNavigatePage('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Wholecut Oxfords
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('loafers');
                    onNavigatePage('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Italian Horsebit Loafers
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('boots');
                    onNavigatePage('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Chelsea & Alpine Boots
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('casual');
                    onNavigatePage('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Monaco Luxury Sneakers
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('all');
                    onNavigatePage('shop');
                  }}
                  className="hover:text-[#d4af37] transition-colors"
                >
                  Complete Catalog →
                </button>
              </li>
            </ul>
          </div>

          {/* Craftsmanship & Salons */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
              Atelier & Care
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigatePage('craftsmanship')}
                  className="hover:text-white transition-colors"
                >
                  The Goodyear Welt Creed
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('about')}
                  className="hover:text-white transition-colors"
                >
                  Heritage & Last Making
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('about')}
                  className="hover:text-white transition-colors"
                >
                  Global Flagship Salons
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('faq')}
                  className="hover:text-white transition-colors"
                >
                  Leather Care & Resoling
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('faq')}
                  className="hover:text-white transition-colors"
                >
                  Size Conversion Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
              Client Concierge
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigatePage('contact')}
                  className="hover:text-white transition-colors"
                >
                  Book Private Fitting
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onOpenTracker) {
                      onOpenTracker();
                    } else {
                      onNavigatePage('account');
                    }
                  }}
                  className="hover:text-white transition-colors"
                >
                  Track Order & Delivery Status
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('faq')}
                  className="hover:text-white transition-colors"
                >
                  Insured Delivery & Duties
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('faq')}
                  className="hover:text-white transition-colors"
                >
                  30-Day Bespoke Exchanges
                </button>
              </li>
              <li>
                <a
                  href="tel:+923421080908"
                  className="hover:text-[#d4af37] transition-colors font-mono flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                  <span>Call Support: +92 342 1080908</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/923421080908"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#25D366] hover:text-[#42e880] transition-colors flex items-center gap-2 font-medium"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
                    <path d="M12.031 2C6.496 2 2 6.495 2 12.029c0 1.99.582 3.865 1.624 5.46L2.2 21.8l4.475-1.397a9.988 9.988 0 0 0 5.356 1.626h.004c5.534 0 10.029-4.495 10.029-10.03C22.064 6.495 17.567 2 12.031 2zm5.836 14.184c-.244.686-1.42 1.31-1.956 1.396-.51.082-1.16.117-1.873-.111-.43-.138-.987-.323-1.696-.632-2.984-1.3-4.93-4.32-5.08-4.52-.148-.198-1.205-1.602-1.205-3.056 0-1.455.76-2.17 1.03-2.464.271-.295.592-.368.79-.368.197 0 .394.002.565.01.183.008.43-.07.671.512.247.595.84 2.052.913 2.202.074.148.123.324.024.52-.098.197-.148.32-.295.493-.148.172-.31.385-.444.516-.148.147-.302.308-.13.603.173.296.768 1.266 1.65 2.052 1.135 1.01 2.091 1.323 2.387 1.47.296.148.468.123.64-.074.173-.197.74-.862.937-1.158.197-.296.395-.246.666-.148.27.098 1.727.813 2.023.961.296.148.493.222.566.345.074.123.074.715-.17 1.401z" />
                  </svg>
                  <span>WhatsApp Concierge: +92 342 1080908</span>
                </a>
              </li>
              <li>
                <a
                  href="https://whatsapp.com/channel/0029VbDaihxJ3jv4LJUrRx1r"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-[11px]"
                >
                  <span className="text-[#25D366]">●</span>
                  <span>WhatsApp VIP Broadcast Channel</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Hairline Divider & Payment Badges */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
            <span>© 2026 V Collection Pakistan</span>
            <span>·</span>
            <span>All rights reserved</span>
            <span>·</span>
            <span className="text-[#c5a880]">Delivered Across Pakistan (Cash on Delivery)</span>
            <span>·</span>
            <button
              onClick={() => {
                if (onOpenOwnerAuth) {
                  onOpenOwnerAuth();
                } else {
                  onNavigatePage('owner');
                }
              }}
              className="text-[#d4af37] font-semibold hover:underline transition-colors focus:outline-none"
              title="Dedicated Executive Owner Portal"
            >
              Executive Owner Portal
            </button>
          </div>

          {/* Payment Trust Badges */}
          <div className="flex items-center gap-3 text-zinc-400 text-[10px] font-mono">
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded">VISA</span>
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded">MASTERCARD</span>
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded">AMEX</span>
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded">APPLE PAY</span>
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded">WHITE-GLOVE COD</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
