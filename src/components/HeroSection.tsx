import React, { useState } from 'react';
import { ArrowRight, Sparkles, Shield, Check, ShoppingBag, Eye, Truck, Star } from 'lucide-react';
import { Product } from '../types';

interface HeroSectionProps {
  onExploreClick: () => void;
  onSelectProduct: (product: Product) => void;
  featuredProduct: Product;
  loaferProduct?: Product;
  theme?: 'dark' | 'bright';
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onSelectProduct,
  featuredProduct,
  loaferProduct,
}) => {
  const activeShoe = loaferProduct || featuredProduct;
  const [selectedSilhouette, setSelectedSilhouette] = useState<'loafer' | 'oxford'>('loafer');
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);

  const currentDisplayProduct = selectedSilhouette === 'loafer' && loaferProduct ? loaferProduct : featuredProduct;

  return (
    <section className="relative min-h-[85vh] flex items-center bg-[#07080b] overflow-hidden py-14 lg:py-20 border-b border-[#d4af37]/20">
      {/* Ambient Chiaroscuro & Luxury Vignette */}
      <div className="absolute inset-0 bg-marble-dark pointer-events-none opacity-90" />
      <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-[#d4af37]/5 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 right-10 w-[700px] h-[700px] rounded-full bg-[#c5a880]/5 blur-[160px] pointer-events-none" />

      {/* Subtle Hairline Accent */}
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Brand Statement & Call to Action */}
          <div className="lg:col-span-6 space-y-7 text-left">
            
            {/* Silhouette Switcher */}
            <div className="inline-flex items-center p-1 rounded-xl bg-[#12151e] border border-white/10">
              <button
                onClick={() => {
                  setSelectedSilhouette('loafer');
                  setActivePhotoIdx(0);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedSilhouette === 'loafer'
                    ? 'bg-[#d4af37] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Signature Horsebit Loafer
              </button>
              <button
                onClick={() => {
                  setSelectedSilhouette('oxford');
                  setActivePhotoIdx(0);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedSilhouette === 'oxford'
                    ? 'bg-[#d4af37] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Wholecut Oxford
              </button>
            </div>

            {/* Brand Kicker */}
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-[#d4af37]" />
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-[#d4af37] font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Premium Luxury Footwear · Ready to Wear</span>
              </div>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#f9e7c4] leading-[1.08] tracking-tight">
              {selectedSilhouette === 'loafer' ? (
                <>
                  The Art of Italian <br />
                  <span className="italic font-light text-white">Sprezzatura & Luxury</span>
                </>
              ) : (
                <>
                  Formal Mastery & <br />
                  <span className="italic font-light text-white">Timeless Distinction</span>
                </>
              )}
            </h1>

            {/* Simple, Crisp & Premium Description */}
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-xl font-light">
              {selectedSilhouette === 'loafer'
                ? 'Curated Tuscan-style horsebit loafers in hand-patinated antiqued calfskin. Styled with warm brass hardware and cushioned memory insoles for unparalleled all-day comfort.'
                : 'Sleek, seam-free French box calfskin oxford silhouette. Hand-finished with mirror glaze toe burnishing for immaculate poise at weddings, galas, and boardrooms.'}
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreClick}
                className="px-7 py-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e6c86e] to-[#b38b2d] text-black font-semibold text-xs uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-[0_15px_30px_-8px_rgba(212,175,55,0.35)] flex items-center gap-2.5"
              >
                <span>Shop All Shoes</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectProduct(currentDisplayProduct)}
                className="px-6 py-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] text-[#f5ebd7] font-medium text-xs uppercase tracking-[0.2em] border border-gold-subtle hover:border-[#d4af37] transition-all flex items-center gap-2 shadow-lg"
              >
                <Eye className="w-4 h-4 text-[#d4af37]" />
                <span>View Details & Fit</span>
              </button>
            </div>

            {/* Trust Pillars Row */}
            <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-6">
              <div>
                <span className="block font-serif text-2xl sm:text-3xl text-[#f5ebd7] font-normal tabular-nums">
                  100%
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#c5a880] block mt-0.5">
                  Genuine Calfskin
                </span>
              </div>
              <div>
                <span className="block font-serif text-2xl sm:text-3xl text-[#f5ebd7] font-normal tabular-nums">
                  48 Hrs
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#c5a880] block mt-0.5">
                  Express Courier
                </span>
              </div>
              <div>
                <span className="block font-serif text-2xl sm:text-3xl text-[#f5ebd7] font-normal tabular-nums">
                  Free
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#c5a880] block mt-0.5">
                  Size Exchange
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: High-Fashion Photography Showcase */}
          <div className="lg:col-span-6">
            <div className="relative group">
              {/* Gold Ambient Halo */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#d4af37]/30 to-amber-600/10 blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />

              <div className="relative rounded-3xl overflow-hidden bg-[#10131a] border border-[#d4af37]/40 shadow-2xl">
                {/* Main Hero Photo */}
                <div className="relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-black">
                  <img
                    src={currentDisplayProduct.images[activePhotoIdx] || currentDisplayProduct.images[0]}
                    alt={currentDisplayProduct.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-[#d4af37]/40 text-[#f9e7c4] text-xs font-semibold uppercase tracking-wider">
                      Featured Pair
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                      In Stock
                    </span>
                  </div>

                  {/* Bottom Price & Quick Purchase Overlay */}
                  <div className="absolute bottom-4 inset-x-4 flex items-center justify-between p-3.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#d4af37] block font-medium">
                        {currentDisplayProduct.name}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-white tabular-nums">
                          Rs. {currentDisplayProduct.price.toLocaleString()}
                        </span>
                        {currentDisplayProduct.originalPrice && (
                          <span className="text-xs text-zinc-500 line-through tabular-nums">
                            Rs. {currentDisplayProduct.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectProduct(currentDisplayProduct)}
                      className="px-4 py-2 rounded-xl bg-[#d4af37] hover:bg-[#b89528] text-black font-semibold text-xs uppercase tracking-wider transition-all shadow active:scale-95 flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Order Now</span>
                    </button>
                  </div>
                </div>

                {/* Multiple Photography Angles Strip */}
                {currentDisplayProduct.images.length > 1 && (
                  <div className="p-3 bg-[#0d1017] border-t border-white/10 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-zinc-400 font-medium pl-1">
                      Available Angles:
                    </span>
                    <div className="flex items-center gap-2">
                      {currentDisplayProduct.images.slice(0, 4).map((imgUrl, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActivePhotoIdx(idx)}
                          className={`w-14 h-11 rounded-lg overflow-hidden border transition-all ${
                            activePhotoIdx === idx
                              ? 'border-[#d4af37] ring-1 ring-[#d4af37] scale-105'
                              : 'border-white/10 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt="Shoe angle"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
