import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Sparkles, Check } from 'lucide-react';
import { Product, ShoeFinish } from '../types';
import { ShoeCardTilt } from './3d/ShoeCardTilt';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product, finish: ShoeFinish, size: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onInspect3D?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickAdd,
  isWishlisted,
  onToggleWishlist,
  onInspect3D,
}) => {
  const [selectedFinish, setSelectedFinish] = useState<ShoeFinish>(product.finishes[0]);
  const [selectedSize, setSelectedSize] = useState<number>(product.sizes[2] || product.sizes[0]);
  const [showQuickSizes, setShowQuickSizes] = useState<boolean>(false);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  const isOutOfStock = product.stockCount === 0 || product.inStock === false;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onQuickAdd(product, selectedFinish, selectedSize);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1400);
  };

  return (
    <ShoeCardTilt className="h-full flex flex-col">
      <div
        onClick={() => onSelect(product)}
        className={`flex-1 flex flex-col bg-[#11141c] rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl relative ${
          isOutOfStock ? 'border-rose-950/40 opacity-95' : 'border-white/10 hover:border-gold-subtle/50'
        }`}
      >
        {/* Top Actions: Badges & Wishlist */}
        <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            {isOutOfStock ? (
              <span className="text-[10px] uppercase tracking-wider font-bold text-rose-300 bg-rose-950/90 backdrop-blur-md px-2.5 py-0.5 rounded border border-rose-500/50 shadow-md animate-pulse">
                Out of Stock
              </span>
            ) : (
              <>
                {(product.hasDiscount || (product.originalPrice && product.originalPrice > product.price)) && (
                  <span className="text-[10px] uppercase tracking-wider font-bold text-black bg-[#d4af37] px-2 py-0.5 rounded shadow-sm">
                    {product.discountPercent || Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}% OFF
                  </span>
                )}
                {product.isBestSeller && !(product.hasDiscount || (product.originalPrice && product.originalPrice > product.price)) && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#11141c] bg-[#d4af37] px-2 py-0.5 rounded shadow-sm">
                    Atelier Signature
                  </span>
                )}
                {product.isNew && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#f5ebd7] bg-white/15 backdrop-blur-md px-2 py-0.5 rounded border border-white/20">
                    New Arrival
                  </span>
                )}
              </>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            className="pointer-events-auto p-2 rounded-full bg-black/60 backdrop-blur-md text-zinc-300 hover:text-white transition-colors border border-white/10 hover:border-gold-subtle/40"
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label="Toggle Wishlist"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-[#d4af37] text-[#d4af37]' : ''}`}
            />
          </button>
        </div>

        {/* Product Image Stage */}
        <div className="relative aspect-[4/3] w-full bg-[#0a0c10] overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#11141c] via-transparent to-black/20 pointer-events-none" />

          {/* Quick View Floating Affordance on Hover */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(product);
              }}
              className="px-3 py-1.5 rounded-lg bg-black/90 backdrop-blur-md text-[#d4af37] text-xs font-semibold border border-[#d4af37]/50 flex items-center gap-1.5 hover:bg-[#d4af37] hover:text-black transition-all shadow-lg"
              title="View shoe details and sizes"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Details</span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            {/* Zero-Pill Quiet Editorial Metadata */}
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
              <span>{product.collection}</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="text-[#c5a880]">{product.details.origin}</span>
            </div>

            {/* Product Title */}
            <h3 className="font-serif text-lg font-medium text-[#f5ebd7] group-hover:text-[#d4af37] transition-colors line-clamp-1">
              {product.name}
            </h3>

            {/* Leather & Construction Specification */}
            <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
              {product.details.leather}
            </p>
          </div>

          {/* Color Finish Swatches */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {product.finishes.map((f) => (
                <button
                  key={f.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFinish(f);
                  }}
                  title={f.name}
                  className={`w-3.5 h-3.5 rounded-full border transition-transform ${selectedFinish.name === f.name ? 'border-[#d4af37] scale-125 ring-1 ring-[#d4af37]' : 'border-white/20 hover:scale-110'}`}
                  style={{ backgroundColor: f.hex }}
                />
              ))}
            </div>

            {/* Stock Availability indicator */}
            <span className="text-[11px] text-zinc-400">
              {isOutOfStock ? (
                <span className="text-rose-400 font-semibold">Out of Stock</span>
              ) : product.stockCount <= 3 ? (
                <span className="text-amber-400/90">{product.stockCount} in Atelier</span>
              ) : (
                <span className="text-emerald-400/90">In Stock</span>
              )}
            </span>
          </div>

          {/* Price & Action Row */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-semibold text-white tabular-nums">
                Rs. {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-zinc-500 line-through tabular-nums">
                  Rs. {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Quick Add Button / Quick Size Trigger */}
            <div className="relative">
              {isOutOfStock ? (
                <button
                  disabled
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-zinc-500 cursor-not-allowed"
                >
                  Sold Out
                </button>
              ) : (
                <>
                  {showQuickSizes ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-full right-0 mb-2 p-2 bg-[#171b26] border border-gold-subtle rounded-xl shadow-xl z-20 w-44 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1.5">
                        Select Size (EU):
                      </span>
                      <div className="grid grid-cols-4 gap-1">
                        {product.sizes.map((sz) => (
                          <button
                            key={sz}
                            onClick={(e) => {
                              setSelectedSize(sz);
                              setShowQuickSizes(false);
                              handleAdd(e);
                            }}
                            className={`text-xs py-1 rounded transition-colors tabular-nums ${selectedSize === sz ? 'bg-[#d4af37] text-black font-semibold' : 'bg-white/5 hover:bg-white/15 text-zinc-200'}`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowQuickSizes(!showQuickSizes);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${addedAnimation ? 'bg-emerald-600 text-white' : 'bg-white/10 hover:bg-[#d4af37] text-zinc-200 hover:text-black border border-white/10'}`}
                  >
                    {addedAnimation ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Quick Add</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ShoeCardTilt>
  );
};
