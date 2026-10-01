import React, { useState } from 'react';
import { Award, Shield, CheckCircle2, ChevronRight, Truck, RefreshCw, Sparkles, Feather } from 'lucide-react';
import { CRAFTSMANSHIP_IMAGE } from '../data/products';

interface CraftsmanshipSectionProps {
  onExploreBespoke?: () => void;
}

export const CraftsmanshipSection: React.FC<CraftsmanshipSectionProps> = ({
  onExploreBespoke,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const pillars = [
    {
      title: '01. Hand-Selected Premium Leathers',
      subtitle: 'Full-Grain Calfskin & Antiqued Crust',
      description: 'We carefully curate and source only premium full-grain calfskins, velvety Italian-style suedes, and rich pull-up leathers. Supple from the first step and developing a deep patina over time.',
      icon: Award,
    },
    {
      title: '02. Engineered All-Day Comfort',
      subtitle: 'Multi-Density Cushioning & Arch Balance',
      description: 'Built for actual wear. Every shoe features high-resilience cushioned latex insoles, reinforced heel counters, and breathable leather linings designed for all-day boardroom and evening comfort.',
      icon: Feather,
    },
    {
      title: '03. Nationwide Insured Delivery',
      subtitle: 'Express Courier Across Pakistan',
      description: 'Reliable express delivery on every order. Each pair arrives encased in our signature magnetic presentation box with custom protective dust bags and travel shoehorn.',
      icon: Truck,
    },
    {
      title: '04. Guaranteed Perfect Fit Guarantee',
      subtitle: '7-Day Complimentary Size Exchange',
      description: 'Order with total confidence. Try your shoes on indoors on clean carpet; if you need a half size up or down, our dedicated concierge arranges an immediate exchange.',
      icon: RefreshCw,
    },
  ];

  return (
    <section className="py-20 bg-[#0e1118] relative border-y border-gold-subtle/30 overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#d4af37]/3 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#d4af37] font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The V Collection Guarantee</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#f9e7c4] tracking-tight">
            Curated Luxury. Exceptional Comfort.
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-light">
            We bring you hand-selected, high-grade gentleman’s footwear that marries timeless European silhouette design with genuine leather and all-day comfort.
          </p>
          <div className="gold-foil-line max-w-xs mx-auto mt-6" />
        </div>

        {/* Interactive Split Feature */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Interactive Pillar Cards */}
          <div className="lg:col-span-6 space-y-3">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              const isActive = activeStep === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#151923] border-[#d4af37]/60 shadow-xl ring-1 ring-[#d4af37]/30'
                      : 'bg-black/30 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-[#d4af37] text-black shadow'
                          : 'bg-white/5 text-zinc-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-serif text-base sm:text-lg ${isActive ? 'text-[#f9e7c4] font-medium' : 'text-zinc-300'}`}>
                          {pillar.title}
                        </h3>
                        <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90 text-[#d4af37]' : 'text-zinc-600'}`} />
                      </div>
                      <span className="text-[11px] uppercase tracking-wider text-[#c5a880] block font-medium">
                        {pillar.subtitle}
                      </span>
                      {isActive && (
                        <p className="text-xs text-zinc-300 leading-relaxed pt-2 animate-in fade-in duration-200">
                          {pillar.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Premium Showcase Photography Card */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border border-gold-subtle/50 shadow-2xl bg-black">
              <img
                src={CRAFTSMANSHIP_IMAGE}
                alt="V Collection Leather Details"
                referrerPolicy="no-referrer"
                className="w-full h-[460px] object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

              {/* Floating Overlay Card */}
              <div className="absolute bottom-6 inset-x-6 bg-[#0f121a]/90 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#d4af37]" />
                    <span className="text-xs uppercase tracking-wider text-[#f5ebd7] font-semibold">
                      100% Genuine Leather Guarantee
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Inspected & Verified
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Every shoe sold at V Collection passes multi-point inspection for leather suppleness, sole bonding integrity, and stitch accuracy.
                </p>
                {onExploreBespoke && (
                  <button
                    onClick={onExploreBespoke}
                    className="text-xs text-[#d4af37] font-semibold hover:underline flex items-center gap-1 pt-1"
                  >
                    <span>Have sizing questions? Contact our shoe concierge →</span>
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
