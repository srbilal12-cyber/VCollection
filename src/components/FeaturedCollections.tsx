import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Category, Product, ShoeFinish } from '../types';
import { ProductCard } from './ProductCard';

interface FeaturedCollectionsProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, finish: ShoeFinish, size: number) => void;
  wishlistIds: string[];
  onToggleWishlist: (id: string) => void;
  onViewAllClick: () => void;
  onInspect3D?: (product: Product) => void;
}

export const FeaturedCollections: React.FC<FeaturedCollectionsProps> = ({
  products,
  onSelectProduct,
  onQuickAdd,
  wishlistIds,
  onToggleWishlist,
  onViewAllClick,
  onInspect3D,
}) => {
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const categories: { label: string; value: Category }[] = [
    { label: 'All Curations', value: 'all' },
    { label: 'Oxfords & Formal', value: 'formal' },
    { label: 'Italian Loafers', value: 'loafers' },
    { label: 'Boots & Chukkas', value: 'boots' },
    { label: 'Luxury Casual', value: 'casual' },
  ];

  const displayedProducts = products
    .filter((p) => activeCategory === 'all' || p.category === activeCategory)
    .slice(0, 6);

  return (
    <section className="py-20 bg-[#0b0d11] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#d4af37] mb-2 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Haute Cordonnerie</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#f9e7c4] tracking-tight">
              Featured Atelier Masterpieces
            </h2>
          </div>

          {/* Interactive Filter Tabs (functional segmented control allowed per skill) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#12151d] rounded-xl border border-white/10 self-start md:self-auto">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeCategory === cat.value
                    ? 'bg-[#d4af37] text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onQuickAdd={onQuickAdd}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              onInspect3D={onInspect3D}
            />
          ))}
        </div>

        {/* Bottom View All Link */}
        <div className="mt-14 text-center">
          <button
            onClick={onViewAllClick}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#f5ebd7] hover:text-[#d4af37] transition-colors group"
          >
            <span>Explore Complete {products.length}-Piece Catalog</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#d4af37]" />
          </button>
        </div>

      </div>
    </section>
  );
};
