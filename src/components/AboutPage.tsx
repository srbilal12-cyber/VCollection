import React from 'react';
import { Award, Compass, Shield, Sparkles, MapPin } from 'lucide-react';
import { CRAFTSMANSHIP_IMAGE, HERO_SHOE_IMAGE } from '../data/products';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#0b0d11] min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Editorial Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#d4af37] font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The V Atelier Genesis</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#f9e7c4] tracking-tight">
            An Uncompromising Dedication to Form
          </h1>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-light">
            Founded in 1974 in Riviera del Brenta, Italy, V Collection began with a singular vision: to preserve the dying discipline of handmade cordwaining and unite it with modern anatomical refinement.
          </p>
          <div className="gold-foil-line max-w-xs mx-auto" />
        </div>

        {/* Cinematic Dual Photo & Narrative */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="rounded-2xl overflow-hidden border border-gold-subtle shadow-2xl relative">
            <img
              src={CRAFTSMANSHIP_IMAGE}
              alt="Artisan hand-stitching upper"
              referrerPolicy="no-referrer"
              className="w-full aspect-[4/3] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
              <span className="text-xs uppercase tracking-wider text-[#d4af37]">Master Cordwainer Maestro Valenti</span>
            </div>
          </div>

          <div className="space-y-6 text-zinc-300 text-sm sm:text-base font-light leading-relaxed">
            <h2 className="font-serif text-2xl sm:text-3xl text-white">
              The 200-Step Covenant
            </h2>
            <p>
              In an era dominated by adhesive cement and disposable footwear, every single pair that leaves our Tuscan workshop is made with traditional Goodyear welted or Norwegian storm-welt construction.
            </p>
            <p>
              The oak bark-tanned soles take nine months to tan in natural river pits in Devon, England, producing a fiber density that repels water and resists abrasion twice as effectively as industrial soles.
            </p>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl border-l-2 border-l-[#d4af37]">
              <p className="italic font-serif text-white text-sm">
                "We do not build shoes for a season. We craft companions that mold to your stride, reflect your patina, and outlive the decades."
              </p>
            </div>
          </div>
        </div>

        {/* Flagship Hubs & Nationwide Dispatch */}
        <div className="pt-8 border-t border-white/10 space-y-8">
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-[#d4af37]">Nationwide Presence</span>
            <h3 className="font-serif text-3xl text-white mt-1">Our Pakistani Hubs & Ateliers</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { city: 'Lahore', address: 'Gulberg III, MM Alam Road', hours: 'Mon – Sat, 11am – 9pm (Express Dispatch)' },
              { city: 'Karachi', address: 'DHA Phase 6, Bukhari Commercial', hours: 'Mon – Sat, 11am – 9pm (Concierge Hub)' },
              { city: 'Islamabad', address: 'Beverly Centre, Blue Area', hours: 'Mon – Sat, 11am – 8pm (Executive Suite)' },
              { city: 'All Pakistan', address: 'Delivered via TCS / Trax / Call Courier', hours: '2–4 Business Days (Insured COD)' },
            ].map((loc) => (
              <div key={loc.city} className="p-5 rounded-2xl bg-[#12151e] border border-white/10 space-y-2">
                <MapPin className="w-5 h-5 text-[#d4af37]" />
                <h4 className="font-serif text-lg text-white font-medium">{loc.city} {loc.city === 'All Pakistan' ? 'Express' : 'Hub'}</h4>
                <p className="text-xs text-zinc-300">{loc.address}</p>
                <p className="text-[11px] text-[#c5a880]">{loc.hours}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
