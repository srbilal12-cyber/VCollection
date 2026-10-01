import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Gift, Tag, Check } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: (appliedDiscount: number, isGiftWrapped: boolean, giftMessage: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const dropShippingFee = items.length > 0 ? 200 : 0; // Flat Rs. 200 drop shipping for any order
  const giftWrapFee = isGiftWrapped ? 250 : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + dropShippingFee + giftWrapFee);

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    if (promoCode.trim().toUpperCase() === 'VIP15') {
      setDiscountPercent(15);
    } else {
      setPromoError('Invalid atelier invitation code. Try VIP15.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0f121a] border-l border-gold-subtle/40 shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Top Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
              <h3 className="font-serif text-xl font-semibold text-[#f5ebd7]">
                Your Shopping Bag
              </h3>
              <span className="text-xs text-zinc-400 tabular-nums">
                ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body - Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto" />
                <p className="font-serif text-lg text-zinc-300">Your bag is empty</p>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Explore our handcrafted Goodyear-welted collections and add a piece of timeless Italian artistry.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-[#d4af37] text-black text-xs font-semibold uppercase tracking-wider"
                >
                  Explore Shoes
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/15 transition-all"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 object-cover rounded-lg bg-zinc-900 border border-white/10 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">
                      {item.product.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.finish.hex }} />
                        {item.finish.colorName}
                      </span>
                      <span>·</span>
                      <span>EU {item.size}</span>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-white/15 rounded bg-black/40">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="px-2 py-0.5 text-xs text-zinc-300 hover:text-white"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs text-white tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="px-2 py-0.5 text-xs text-zinc-300 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-semibold text-[#f5ebd7] tabular-nums">
                        Rs. {(item.product.price * item.quantity).toLocaleString()}
                      </span>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Gift Wrap Privilege Option */}
            {items.length > 0 && (
              <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGiftWrapped}
                    onChange={(e) => setIsGiftWrapped(e.target.checked)}
                    className="rounded border-zinc-600 text-[#d4af37] focus:ring-[#d4af37]"
                  />
                  <div className="flex items-center gap-1.5 text-xs text-zinc-200">
                    <Gift className="w-4 h-4 text-[#d4af37]" />
                    <span>Complimentary Atelier Gift Packaging (+Rs. 250)</span>
                  </div>
                </label>
                {isGiftWrapped && (
                  <input
                    type="text"
                    placeholder="Handwritten calligraphy message for card..."
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                  />
                )}
              </div>
            )}

            {/* Promotional Code Form */}
            {items.length > 0 && (
              <form onSubmit={applyPromo} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Atelier Privilege Code (e.g. VIP15)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl pl-8 pr-3 py-2 text-xs text-white uppercase placeholder-zinc-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/10 shrink-0"
                  >
                    Apply
                  </button>
                </div>
                {discountPercent > 0 && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> 15% VIP Atelier Privilege Applied!
                  </span>
                )}
                {promoError && (
                  <span className="text-[11px] text-rose-400">{promoError}</span>
                )}
              </form>
            )}
          </div>

          {/* Drawer Bottom Summary & Checkout Button */}
          {items.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-[#0c0e14] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Bag Subtotal</span>
                  <span className="text-white tabular-nums">Rs. {subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>VIP Privilege (15%)</span>
                    <span className="tabular-nums">-Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                {isGiftWrapped && (
                  <div className="flex justify-between text-zinc-400">
                    <span>Atelier Gift Wrap</span>
                    <span className="text-white tabular-nums">Rs. 250</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span>Drop Shipping Charges</span>
                    <span className="text-[10px] text-[#d4af37] bg-[#d4af37]/10 px-1.5 py-0.5 rounded">All Orders</span>
                  </span>
                  <span className="text-white tabular-nums font-mono">
                    Rs. {dropShippingFee}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 pt-0.5 flex justify-between">
                  <span>Cash on Delivery (COD)</span>
                  <span>+Rs. 100 applied at checkout</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-white pt-2 border-t border-white/10">
                  <span>Grand Total</span>
                  <span className="font-serif text-lg text-[#f9e7c4] tabular-nums font-semibold">
                    Rs. {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onCheckout(discountAmount, isGiftWrapped, giftMessage);
                  onClose();
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e2c158] to-[#aa8329] text-black font-semibold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.99] transition-all shadow-xl shadow-[#d4af37]/20 flex items-center justify-center gap-2"
              >
                <span>Proceed to White-Glove Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>256-bit Encrypted Checkout · 30-Day Bespoke Exchanges</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
