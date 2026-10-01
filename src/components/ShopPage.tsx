import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, Grid, List, X, RotateCcw, Check, Sparkles } from 'lucide-react';
import { Category, Product, ShoeFinish } from '../types';
import { ProductCard } from './ProductCard';

interface ShopPageProps {
  products: Product[];
  selectedCategory: Category;
  onSelectCategory: (cat: Category) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, finish: ShoeFinish, size: number) => void;
  wishlistIds: string[];
  onToggleWishlist: (id: string) => void;
  onInspect3D?: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
  onQuickAdd,
  wishlistIds,
  onToggleWishlist,
  onInspect3D,
}) => {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'>('featured');
  const [priceMax, setPriceMax] = useState<number>(10000);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  const allAvailableSizes = [38, 39, 40, 41, 42, 43, 44, 45, 46];
  const colorOptions = [
    { name: 'Black', hex: '#111317' },
    { name: 'Cognac', hex: '#8a4b28' },
    { name: 'Burgundy', hex: '#4e1423' },
    { name: 'Dark Brown', hex: '#3d251e' },
    { name: 'Ivory', hex: '#dad6cb' },
    { name: 'Navy', hex: '#1b2333' },
  ];

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        // Price
        if (p.price > priceMax) return false;
        // Sizes
        if (selectedSizes.length > 0 && !selectedSizes.some((s) => p.sizes.includes(s))) return false;
        // Colors
        if (selectedColors.length > 0 && !selectedColors.some((c) => p.finishes.some((f) => f.colorName === c))) return false;
        // Search text
        if (searchFilter.trim()) {
          const q = searchFilter.toLowerCase();
          const matches =
            p.name.toLowerCase().includes(q) ||
            p.details.leather.toLowerCase().includes(q) ||
            p.collection.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q));
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        return 0; // featured default
      });
  }, [products, selectedCategory, priceMax, selectedSizes, selectedColors, searchFilter, sortBy]);

  const toggleSize = (sz: number) => {
    if (selectedSizes.includes(sz)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== sz));
    } else {
      setSelectedSizes([...selectedSizes, sz]);
    }
  };

  const toggleColor = (col: string) => {
    if (selectedColors.includes(col)) {
      setSelectedColors(selectedColors.filter((c) => c !== col));
    } else {
      setSelectedColors([...selectedColors, col]);
    }
  };

  const clearAllFilters = () => {
    onSelectCategory('all');
    setPriceMax(10000);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSearchFilter('');
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    priceMax < 10000 ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    searchFilter.trim() !== '';

  return (
    <div className="bg-[#0b0d11] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Breadcrumb & Header */}
        <div className="mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#d4af37] mb-2">
            <span>Atelier Catalog</span>
            <span>/</span>
            <span className="text-white capitalize">{selectedCategory} Shoes</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#f9e7c4] tracking-tight">
                {selectedCategory === 'all' && 'The Complete Footwear Archive'}
                {selectedCategory === 'formal' && 'Oxfords & Black-Tie Formals'}
                {selectedCategory === 'loafers' && 'Italian Hand-Stitched Loafers'}
                {selectedCategory === 'boots' && 'Chukka & Storm-Welted Boots'}
                {selectedCategory === 'casual' && 'Luxury Casuals & Nappa Sneakers'}
                {selectedCategory === 'bespoke' && 'Atelier Bespoke Commissions'}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-light">
                Showing {filteredProducts.length} of {products.length} master crafted silhouettes
              </p>
            </div>

            {/* Sort & View Mode Switcher */}
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#d4af37]" />
                <span>Filters {hasActiveFilters && '•'}</span>
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 bg-[#12151e] border border-white/15 rounded-xl px-3 py-1.5 text-xs">
                <span className="text-zinc-500 uppercase tracking-wider text-[10px] hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Sort products by"
                  className="bg-transparent text-zinc-200 border-none focus:outline-none cursor-pointer text-xs"
                >
                  <option value="featured" className="bg-[#12151e]">Atelier Featured</option>
                  <option value="price-low" className="bg-[#12151e]">Price: Low to High</option>
                  <option value="price-high" className="bg-[#12151e]">Price: High to Low</option>
                  <option value="rating" className="bg-[#12151e]">Customer Rating</option>
                  <option value="newest" className="bg-[#12151e]">Newest Releases</option>
                </select>
              </div>

              {/* Grid / List Toggle */}
              <div className="hidden sm:flex items-center bg-[#12151e] border border-white/15 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-[#d4af37] text-black' : 'text-zinc-400 hover:text-white'}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-[#d4af37] text-black' : 'text-zinc-400 hover:text-white'}`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid & Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6 bg-[#0f121a] p-6 rounded-2xl border border-white/10 h-fit sticky top-28">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                <span>Atelier Filter</span>
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Search within catalog */}
            <div>
              <input
                type="text"
                placeholder="Search style or leather..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2.5 font-medium">
                Silhouette
              </label>
              <div className="space-y-1 text-xs">
                {[
                  { id: 'all', label: 'All Silhouettes' },
                  { id: 'formal', label: 'Oxfords & Monkstraps' },
                  { id: 'loafers', label: 'Italian Loafers' },
                  { id: 'boots', label: 'Boots & Chukkas' },
                  { id: 'casual', label: 'Luxury Sneakers & Derbys' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id as Category)}
                    className={`w-full text-left py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === cat.id
                        ? 'bg-[#d4af37]/15 text-[#f5ebd7] font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {selectedCategory === cat.id && <Check className="w-3.5 h-3.5 text-[#d4af37]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="uppercase tracking-wider text-zinc-400 font-medium">Max Price:</span>
                <span className="text-[#f5ebd7] font-semibold tabular-nums font-mono">Rs. {priceMax.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="2500"
                max="10000"
                step="250"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                aria-label="Filter products by maximum price"
                className="w-full accent-[#d4af37] bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>Rs. 2,500</span>
                <span>Rs. 10,000</span>
              </div>
            </div>

            {/* Size Filter */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2.5 font-medium">
                Shoe Size (EU)
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {allAvailableSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => toggleSize(sz)}
                    className={`py-1.5 rounded-lg text-xs font-medium border transition-colors tabular-nums ${
                      selectedSizes.includes(sz)
                        ? 'bg-[#d4af37] border-[#d4af37] text-black font-semibold'
                        : 'bg-black/30 border-white/10 text-zinc-300 hover:border-white/20'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Swatch Filter */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2.5 font-medium">
                Leather Hue
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => toggleColor(c.name)}
                    title={c.name}
                    className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                      selectedColors.includes(c.name)
                        ? 'border-[#d4af37] bg-white/10 text-white'
                        : 'border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.hex }} />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </aside>

          {/* Product Grid / List Display */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="py-24 text-center bg-[#0f121a] rounded-2xl border border-white/10 p-8 space-y-3">
                <Sparkles className="w-10 h-10 text-zinc-600 mx-auto" />
                <h3 className="font-serif text-xl text-white">No silhouettes match your criteria</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Adjust your price ceiling or clear filter selections to view available atelier inventory.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 rounded-xl bg-[#d4af37] text-black text-xs font-semibold uppercase tracking-wider"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onSelect={onSelectProduct}
                    onQuickAdd={onQuickAdd}
                    isWishlisted={wishlistIds.includes(prod.id)}
                    onToggleWishlist={onToggleWishlist}
                    onInspect3D={onInspect3D}
                  />
                ))}
              </div>
            ) : (
              /* List View Mode */
              <div className="space-y-4">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => onSelectProduct(prod)}
                    className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-[#0f121a] border border-white/10 hover:border-gold-subtle/50 transition-all cursor-pointer group"
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-full sm:w-48 aspect-[4/3] object-cover rounded-xl bg-zinc-900 border border-white/10 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 space-y-1.5 text-left w-full">
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-zinc-400">
                        <span>{prod.collection}</span>
                        <span>·</span>
                        <span className="text-[#c5a880]">{prod.details.origin}</span>
                      </div>
                      <h3 className="font-serif text-xl font-medium text-white group-hover:text-[#d4af37] transition-colors">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 font-light">
                        {prod.description}
                      </p>
                      <p className="text-xs text-zinc-500 pt-1">
                        <strong>Leather:</strong> {prod.details.leather} · <strong>Welt:</strong> {prod.details.construction}
                      </p>
                    </div>

                    <div className="text-right sm:border-l border-white/10 sm:pl-6 space-y-2 shrink-0 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                      <div>
                        <span className="font-serif text-2xl font-semibold text-[#f5ebd7] block tabular-nums">
                          Rs. {prod.price.toLocaleString()}
                        </span>
                        {prod.stockCount === 0 || prod.inStock === false ? (
                          <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">Out of Stock</span>
                        ) : (
                          <span className="text-[10px] text-emerald-400/90 uppercase tracking-wider block">In Stock</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(prod);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#d4af37] text-black text-xs font-semibold uppercase tracking-wider hover:brightness-110 shadow-md"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
