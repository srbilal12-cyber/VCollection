import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.details.leather.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [query, products]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#12151d] border border-gold-subtle rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#d4af37]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by shoe style, French calfskin, Goodyear welt, loaf..."
            autoFocus
            className="flex-1 bg-transparent border-none text-white placeholder-zinc-500 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-zinc-400 hover:text-white p-1 text-xs"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results or Curated Suggestions */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
          {query.trim() === '' ? (
            <div className="py-6 px-2">
              <span className="text-[11px] uppercase tracking-widest text-[#d4af37] font-semibold block mb-3">
                Suggested Curations
              </span>
              <div className="flex flex-wrap gap-2">
                {['French Box Calf', 'Wholecut Oxford', 'Goodyear Welt', 'Horsebit Loafer', 'Alpine Boot', 'Suede Chelsea'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition-colors border border-white/10"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 block px-1">
                {filteredProducts.length} Atelier Masterpieces Found
              </span>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-gold-subtle/30 group"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-14 object-cover rounded-lg bg-zinc-900 border border-white/10 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase tracking-widest text-[#d4af37] block">
                      {product.collection}
                    </span>
                    <h4 className="text-sm font-medium text-white truncate group-hover:text-[#f5ebd7]">
                      {product.name}
                    </h4>
                    <p className="text-xs text-zinc-400 truncate">
                      {product.details.leather} · {product.details.construction}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-[#f5ebd7] tabular-nums">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    <span className="flex items-center justify-end text-[11px] text-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                      Inspect <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-400">
              <p className="text-sm mb-1">No shoes matching "{query}"</p>
              <p className="text-xs text-zinc-500">
                Try searching for "Oxford", "Loafer", "Suede", or "Bespoke"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
