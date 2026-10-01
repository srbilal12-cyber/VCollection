import React, { useState } from 'react';
import { X, Star, Heart, Shield, Check, Sparkles, ChevronDown, ChevronUp, Package, Ruler, ArrowRight, Truck, RefreshCw, ShieldCheck, Lock } from 'lucide-react';
import { Product, ShoeFinish, Review, UserProfile } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, finish: ShoeFinish, size: number, quantity: number) => void;
  onInstantBuy: (product: Product, finish: ShoeFinish, size: number, quantity: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onSelectRelated: (product: Product) => void;
  allProducts: Product[];
  initialViewMode?: 'photo' | '3d';
  isCustomerLoggedIn?: boolean;
  currentUser?: UserProfile | null;
  onRequireCustomerAuth?: (reason?: string) => void;
  onSaveReview?: (productId: string, review: Review) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onInstantBuy,
  isWishlisted,
  onToggleWishlist,
  onSelectRelated,
  allProducts,
  isCustomerLoggedIn = false,
  currentUser,
  onRequireCustomerAuth,
  onSaveReview,
}) => {
  if (!product) return null;

  const isOutOfStock = product.stockCount === 0 || product.inStock === false;

  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [selectedFinish, setSelectedFinish] = useState<ShoeFinish>(product.finishes[0]);
  const [selectedSize, setSelectedSize] = useState<number>(product.sizes[2] || product.sizes[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [activeAccordion, setActiveAccordion] = useState<string>('materials');
  const [writeReviewOpen, setWriteReviewOpen] = useState<boolean>(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewFit, setReviewFit] = useState<'True to Size' | 'Runs Slightly Large' | 'Runs Slightly Small'>('True to Size');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [localReviews, setLocalReviews] = useState<Review[]>(product.reviews);

  const handleOpenWriteReview = () => {
    if (!isCustomerLoggedIn) {
      if (onRequireCustomerAuth) {
        onRequireCustomerAuth('Creating an account is required to leave a verified review. Please sign in or register to publish your review.');
      }
      return;
    }
    setWriteReviewOpen(true);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const authorName = currentUser?.name || 'Verified Client';

    const newRev: Review = {
      id: `rev-user-${Date.now()}`,
      author: authorName,
      rating: reviewRating,
      date: 'Just now',
      title: reviewTitle.trim() || `${reviewRating}-Star Verified Order`,
      comment: reviewComment.trim(),
      verified: true,
      fit: reviewFit,
    };

    const updated = [newRev, ...localReviews];
    setLocalReviews(updated);
    if (onSaveReview) {
      onSaveReview(product.id, newRev);
    }
    setReviewSubmitted(true);
    setReviewTitle('');
    setReviewComment('');
    setTimeout(() => {
      setWriteReviewOpen(false);
      setReviewSubmitted(false);
    }, 2200);
  };

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  const generateWhatsAppOrderUrl = () => {
    if (!product) return '#';
    const totalPrice = product.price * quantity;
    const text = `Assalam-o-Alaikum V Collection! Main ye shoe direct WhatsApp par order karna chahta hoon:

👞 Model: ${product.name}
🎨 Color / Finish: ${selectedFinish.name} (${selectedFinish.colorName})
📏 Size: EU ${selectedSize}
🔢 Quantity: ${quantity} pair${quantity > 1 ? 's' : ''}
💰 Total Price: Rs. ${totalPrice.toLocaleString()} PKR
📦 Payment Method: Cash on Delivery (COD)
📸 Product Image: ${product.images[0] || ''}

Meherbani farma kar mera order confirm karein aur expected delivery schedule bata dein. Shukriya!`;

    return `https://wa.me/923421080908?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#10131b] border border-gold-subtle rounded-3xl w-full max-w-5xl shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Gold Hairline */}
        <div className="absolute top-0 inset-x-0 gold-foil-line" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black text-zinc-400 hover:text-white transition-colors border border-white/10"
          aria-label="Close Product View"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Column: High-Fashion Photography Showcase */}
          <div className="lg:col-span-7 bg-[#090b10] p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 overflow-y-auto">
            <div className="space-y-4">
              
              {/* Main Photo Display */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-white/10 shadow-xl group">
                <img
                  src={product.images[selectedImageIdx] || product.images[0]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  {product.isBestSeller && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-black bg-[#d4af37] px-2.5 py-1 rounded-md shadow">
                      Signature Bestseller
                    </span>
                  )}
                  {product.isNew && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20">
                      New Arrival
                    </span>
                  )}
                </div>

                {/* Image Counter */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/80 text-[10px] text-zinc-300 font-mono border border-white/10">
                  {selectedImageIdx + 1} / {product.images.length}
                </div>
              </div>

              {/* Thumbnails Row */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIdx(i)}
                      className={`w-20 h-16 rounded-xl overflow-hidden border transition-all shrink-0 ${
                        selectedImageIdx === i
                          ? 'border-[#d4af37] ring-2 ring-[#d4af37]/40 scale-105'
                          : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Angle thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Shoe Quality Guarantee Banner */}
              <div className="pt-3 grid grid-cols-2 gap-3 text-xs text-zinc-400">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <div>
                    <span className="text-white font-medium block">100% Genuine Leather</span>
                    <span className="text-[11px] text-zinc-400">Full-grain calfskin upper</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <div>
                    <span className="text-white font-medium block">Insured Delivery</span>
                    <span className="text-[11px] text-zinc-400">Cash on delivery across Pakistan</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Micro Details Footer */}
            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-[#d4af37]" />
                7-Day Free Size Exchange Guarantee
              </span>
              <span className="text-[#f5ebd7] font-medium">
                SKU: VC-{product.id.slice(0, 6).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Right Column: Purchasing & Specifications Module */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto max-h-[92vh]">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs uppercase tracking-[0.2em] text-[#d4af37] font-semibold">
                  {product.collection}
                </span>
                <button
                  onClick={() => onToggleWishlist(product.id)}
                  className="text-zinc-400 hover:text-white p-1"
                  title="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#d4af37] text-[#d4af37]' : ''}`} />
                </button>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl text-white font-medium">
                {product.name}
              </h2>

              <p className="text-xs text-zinc-400 mt-1">
                {product.details.leather} · {product.details.construction}
              </p>

              {/* Rating Review Snippet */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center text-[#d4af37]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-[#d4af37]'
                          : 'text-zinc-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-zinc-300 font-medium">
                  {product.rating} ({localReviews.length} Verified Reviews)
                </span>
              </div>

              {/* Price Row in PKR */}
              <div className="flex items-baseline gap-3 mt-4 pt-3 border-t border-white/10">
                <span className="text-2xl font-bold text-white tabular-nums">
                  Rs. {product.price.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-sm text-zinc-500 line-through tabular-nums">
                      Rs. {product.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-black bg-[#d4af37] px-2 py-0.5 rounded shadow-sm">
                      {product.discountPercent || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
                {isOutOfStock ? (
                  <span className="text-[11px] text-rose-300 font-semibold ml-auto bg-rose-950/70 border border-rose-500/40 px-2.5 py-1 rounded">
                    Out of Stock (Currently Sold Out)
                  </span>
                ) : (
                  <span className="text-[11px] text-emerald-400 font-semibold ml-auto bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                    In Stock ({product.stockCount} pairs available)
                  </span>
                )}
              </div>
            </div>

            {/* Selection Form */}
            <div className="space-y-4">
              
              {/* Finish / Color Swatches */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Color Finish:</span>
                  <span className="text-white font-medium">{selectedFinish.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {product.finishes.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => setSelectedFinish(f)}
                      className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                        selectedFinish.name === f.name
                          ? 'border-[#d4af37] bg-white/10 text-white font-medium shadow-sm'
                          : 'border-white/15 text-zinc-400 hover:text-white hover:border-white/30'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full border border-black/50" style={{ backgroundColor: f.hex }} />
                      <span>{f.colorName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Select Size (European EU):</span>
                  <button
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-[#d4af37] hover:underline flex items-center gap-1 font-medium"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size Guide</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        selectedSize === sz
                          ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-md scale-105'
                          : 'bg-black/40 text-zinc-300 border-white/15 hover:border-white/40'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                {showSizeGuide && (
                  <div className="p-3 bg-black/60 rounded-xl border border-white/10 text-[11px] text-zinc-300 space-y-1 animate-in fade-in">
                    <p className="font-semibold text-white">Size Conversion Guide:</p>
                    <p>EU 40 = UK 6 / US 7 · EU 41 = UK 7 / US 8 · EU 42 = UK 8 / US 9</p>
                    <p>EU 43 = UK 9 / US 10 · EU 44 = UK 10 / US 11 · EU 45 = UK 11 / US 12</p>
                    <p className="text-[#c5a880] pt-0.5">V Collection shoes fit true to standard formal size.</p>
                  </div>
                )}
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-zinc-400">Quantity:</span>
                <div className="flex items-center border border-white/20 rounded-xl overflow-hidden bg-black/40">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-zinc-300 hover:text-white hover:bg-white/10"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 font-mono text-white text-xs font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-zinc-300 hover:text-white hover:bg-white/10"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons: Add to Bag & Instant Buy OR Out of Stock Notice */}
              <div className="space-y-2.5 pt-3">
                {isOutOfStock ? (
                  <>
                    <button
                      disabled
                      className="w-full py-3.5 px-6 rounded-xl bg-white/5 text-zinc-400 font-semibold text-xs uppercase tracking-widest border border-white/10 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span>Temporarily Out of Stock</span>
                    </button>

                    <a
                      href="https://whatsapp.com/channel/0029VbDaihxJ3jv4LJUrRx1r"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-6 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#42e880] font-semibold text-xs uppercase tracking-wider border border-[#25D366]/40 transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                        <path d="M12.031 2C6.496 2 2 6.495 2 12.029c0 1.99.582 3.865 1.624 5.46L2.2 21.8l4.475-1.397a9.988 9.988 0 0 0 5.356 1.626h.004c5.534 0 10.029-4.495 10.029-10.03C22.064 6.495 17.567 2 12.031 2zm5.836 14.184c-.244.686-1.42 1.31-1.956 1.396-.51.082-1.16.117-1.873-.111-.43-.138-.987-.323-1.696-.632-2.984-1.3-4.93-4.32-5.08-4.52-.148-.198-1.205-1.602-1.205-3.056 0-1.455.76-2.17 1.03-2.464.271-.295.592-.368.79-.368.197 0 .394.002.565.01.183.008.43-.07.671.512.247.595.84 2.052.913 2.202.074.148.123.324.024.52-.098.197-.148.32-.295.493-.148.172-.31.385-.444.516-.148.147-.302.308-.13.603.173.296.768 1.266 1.65 2.052 1.135 1.01 2.091 1.323 2.387 1.47.296.148.468.123.64-.074.173-.197.74-.862.937-1.158.197-.296.395-.246.666-.148.27.098 1.727.813 2.023.961.296.148.493.222.566.345.074.123.074.715-.17 1.401z" />
                      </svg>
                      <span>Get Restock Alert on WhatsApp Channel →</span>
                    </a>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onAddToCart(product, selectedFinish, selectedSize, quantity)}
                      className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e6c86e] to-[#b38b2d] text-black font-semibold text-xs uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <span>Add To Shopping Bag · Rs. {(product.price * quantity).toLocaleString()}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onInstantBuy(product, selectedFinish, selectedSize, quantity)}
                      className="w-full py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Cash on Delivery (Direct Checkout)</span>
                    </button>

                    <a
                      href={generateWhatsAppOrderUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-6 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-black font-semibold text-xs uppercase tracking-wider border border-[#25D366]/50 transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-95 group"
                      title="Send pre-filled order specifications directly to WhatsApp (+92 342 1080908)"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" aria-hidden="true">
                        <path d="M12.031 2C6.496 2 2 6.495 2 12.029c0 1.99.582 3.865 1.624 5.46L2.2 21.8l4.475-1.397a9.988 9.988 0 0 0 5.356 1.626h.004c5.534 0 10.029-4.495 10.029-10.03C22.064 6.495 17.567 2 12.031 2zm5.836 14.184c-.244.686-1.42 1.31-1.956 1.396-.51.082-1.16.117-1.873-.111-.43-.138-.987-.323-1.696-.632-2.984-1.3-4.93-4.32-5.08-4.52-.148-.198-1.205-1.602-1.205-3.056 0-1.455.76-2.17 1.03-2.464.271-.295.592-.368.79-.368.197 0 .394.002.565.01.183.008.43-.07.671.512.247.595.84 2.052.913 2.202.074.148.123.324.024.52-.098.197-.148.32-.295.493-.148.172-.31.385-.444.516-.148.147-.302.308-.13.603.173.296.768 1.266 1.65 2.052 1.135 1.01 2.091 1.323 2.387 1.47.296.148.468.123.64-.074.173-.197.74-.862.937-1.158.197-.296.395-.246.666-.148.27.098 1.727.813 2.023.961.296.148.493.222.566.345.074.123.074.715-.17 1.401z" />
                      </svg>
                      <span>Order on WhatsApp · Direct 1-Click</span>
                    </a>
                  </>
                )}
              </div>

            </div>

            {/* Accordion Tabs for Shoe Details & Reviews */}
            <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
              
              {/* Product Specifications */}
              <div className="border border-white/5 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'materials' ? '' : 'materials')}
                  className="w-full p-3 bg-black/30 flex items-center justify-between text-left text-zinc-300 hover:text-white font-medium"
                >
                  <span>Shoe Specifications & Materials</span>
                  {activeAccordion === 'materials' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {activeAccordion === 'materials' && (
                  <div className="p-3 bg-black/50 text-[11px] text-zinc-400 space-y-2 border-t border-white/5">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-zinc-500">Upper Leather:</span>
                      <span className="text-zinc-200">{product.details.leather}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-zinc-500">Construction:</span>
                      <span className="text-zinc-200">{product.details.construction}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-zinc-500">Sole Material:</span>
                      <span className="text-zinc-200">{product.details.sole}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-zinc-500">Insole & Cushioning:</span>
                      <span className="text-zinc-200">High-Density Orthopedic Memory Foam</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-500">Packaging:</span>
                      <span className="text-zinc-200">Signature Rigid Box & Dust Bags Included</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Reviews Accordion */}
              <div className="border border-white/5 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'reviews' ? '' : 'reviews')}
                  className="w-full p-3 bg-black/30 flex items-center justify-between text-left text-zinc-300 hover:text-white font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#d4af37] fill-[#d4af37]" />
                    <span>Verified Reviews ({localReviews.length})</span>
                  </div>
                  {activeAccordion === 'reviews' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {activeAccordion === 'reviews' && (
                  <div className="p-3 bg-black/50 text-[11px] text-zinc-300 space-y-3.5 border-t border-white/5 max-h-80 overflow-y-auto">
                    {/* Reviews List */}
                    <div className="space-y-3">
                      {localReviews.map((rev) => (
                        <div key={rev.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{rev.author}</span>
                              {rev.verified && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-medium">
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                  Verified
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500">{rev.date}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center text-[#d4af37]">
                              {[...Array(rev.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-[#d4af37]" />
                              ))}
                            </div>
                            {rev.title && (
                              <span className="text-xs font-serif text-[#f9e7c4] font-medium">
                                {rev.title}
                              </span>
                            )}
                          </div>

                          <p className="text-zinc-300 text-xs leading-relaxed">{rev.comment}</p>

                          {rev.fit && (
                            <div className="pt-0.5">
                              <span className="text-[10px] text-zinc-400">
                                Sizing fit: <span className="text-[#d4af37]">{rev.fit}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Write Review Trigger or Form */}
                    {reviewSubmitted ? (
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs text-center space-y-1 animate-in fade-in">
                        <Check className="w-5 h-5 mx-auto text-emerald-400" />
                        <span className="font-semibold block">Thank You! Your Review is Live</span>
                        <p className="text-[11px] text-zinc-300">
                          +50 Artisanal points have been credited to your customer account.
                        </p>
                      </div>
                    ) : !writeReviewOpen ? (
                      <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2 text-zinc-400 text-xs">
                          <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                          <span>Only registered customers can publish reviews.</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleOpenWriteReview}
                          className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#aa8329] text-black font-semibold text-xs hover:brightness-110 flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0"
                        >
                          {!isCustomerLoggedIn && <Lock className="w-3 h-3" />}
                          <span>{isCustomerLoggedIn ? '+ Write Customer Review' : 'Create Account to Review'}</span>
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleAddReview} className="pt-3 space-y-3 border-t border-white/10 animate-in fade-in">
                        {/* Account Verification Indicator */}
                        <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>
                              Posting as <strong className="text-white">{currentUser?.name}</strong> ({currentUser?.email})
                            </span>
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-900/40">
                            Verified
                          </span>
                        </div>

                        {/* Star Rating Selector */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                            Your Rating: <span className="text-[#d4af37]">{reviewRating} Stars</span>
                          </label>
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((starVal) => (
                              <button
                                key={starVal}
                                type="button"
                                onClick={() => setReviewRating(starVal)}
                                className="p-1 hover:scale-125 transition-transform"
                                aria-label={`Rate ${starVal} stars`}
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    starVal <= reviewRating
                                      ? 'text-[#d4af37] fill-[#d4af37]'
                                      : 'text-zinc-600'
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="text-xs text-zinc-400 pl-2">
                              {reviewRating === 5 && 'Outstanding · Masterpiece'}
                              {reviewRating === 4 && 'Very Good · Highly Recommended'}
                              {reviewRating === 3 && 'Average Quality'}
                              {reviewRating <= 2 && 'Needs Improvement'}
                            </span>
                          </div>
                        </div>

                        {/* Review Title */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                            Review Headline
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Exceptional Leather Quality and True Fit"
                            value={reviewTitle}
                            onChange={(e) => setReviewTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                          />
                        </div>

                        {/* Sizing Fit Feedback */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                            Fit & Sizing Accuracy
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {(['True to Size', 'Runs Slightly Large', 'Runs Slightly Small'] as const).map((fitOption) => (
                              <button
                                key={fitOption}
                                type="button"
                                onClick={() => setReviewFit(fitOption)}
                                className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                                  reviewFit === fitOption
                                    ? 'bg-[#d4af37] text-black font-semibold'
                                    : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                                }`}
                              >
                                {fitOption}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Review Body */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                            Detailed Review
                          </label>
                          <textarea
                            required
                            placeholder="Describe the calfskin texture, comfort during wear, packaging, and craftsmanship in Pakistan..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            className="w-full p-3 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37] h-20"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setWriteReviewOpen(false)}
                            className="px-3 py-1.5 text-zinc-400 hover:text-white text-xs transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!reviewComment.trim()}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8329] text-black font-semibold text-xs hover:brightness-110 disabled:opacity-50 shadow-md"
                          >
                            Publish Verified Review
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
