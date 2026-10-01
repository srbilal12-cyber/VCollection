import React, { useState } from 'react';
import {
  X,
  Search,
  Package,
  Truck,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';
import { Order } from '../types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  initialOrderId?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orders,
  initialOrderId = '',
}) => {
  const [query, setQuery] = useState(initialOrderId);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(() => {
    if (initialOrderId) {
      return orders.find((o) => o.id.toLowerCase() === initialOrderId.toLowerCase()) || null;
    }
    return orders[0] || null;
  });
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return;

    const found = orders.find(
      (o) =>
        o.id.toLowerCase() === cleanQuery ||
        o.id.toLowerCase().replace('v-', '') === cleanQuery.replace('v-', '') ||
        o.trackingNumber.toLowerCase() === cleanQuery ||
        o.shippingAddress.phone.replace(/[^0-9]/g, '').includes(cleanQuery.replace(/[^0-9]/g, '')) ||
        o.shippingAddress.email.toLowerCase() === cleanQuery
    );

    setSearchedOrder(found || null);
  };

  const getStatusStep = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'confirmed':
        return 2;
      case 'crafting':
      case 'quality_check':
        return 3;
      case 'dispatched':
        return 4;
      case 'handed_over':
        return 5;
      case 'delivered':
        return 6;
      default:
        return 1;
    }
  };

  const currentStep = searchedOrder ? getStatusStep(searchedOrder.status) : 1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f121a] border border-[#d4af37]/40 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header Bar */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#12151e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center shadow-inner">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37] font-semibold block">
                Atelier Logistics & Delivery Tracker
              </span>
              <h3 className="font-serif text-lg sm:text-xl text-[#f5ebd7] font-bold">
                Live Order Tracking & Arrival Schedule
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-300 font-semibold block">
              Search by Order Reference # (e.g. V-10294) or Customer Phone:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter Order # (e.g. V-10294) or +92 342 1080908"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white text-xs placeholder-zinc-500 font-mono outline-none focus:border-[#d4af37]"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#e2c158] text-black font-semibold text-xs uppercase tracking-wider transition-all shadow shrink-0"
              >
                Track Order
              </button>
            </div>
          </form>

          {/* Result Card */}
          {searchedOrder ? (
            <div className="space-y-5 bg-[#141824] border border-white/10 rounded-2xl p-5 shadow-lg">
              
              {/* Order Reference Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-base font-bold text-white">
                      Order #{searchedOrder.id}
                    </span>
                    {searchedOrder.status === 'pending' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                        Pending Store Confirmation
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {searchedOrder.status === 'confirmed' ? 'Order Confirmed by Management' : searchedOrder.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">
                    Client: <strong className="text-zinc-200">{searchedOrder.shippingAddress.fullName}</strong> · Placed on {searchedOrder.date}
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                    Total Amount
                  </span>
                  <span className="font-serif text-lg text-[#f9e7c4] font-bold tabular-nums">
                    Rs. {searchedOrder.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* LIVE CONFIRMATION STATUS CARD (USER FACING) */}
              <div className={`p-4 rounded-xl border space-y-2 shadow-inner ${
                searchedOrder.status === 'pending'
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-emerald-950/25 border-emerald-500/40'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {searchedOrder.status === 'pending' ? (
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        {searchedOrder.status === 'pending'
                          ? 'Order Received — Awaiting Admin Confirmation'
                          : 'Order Confirmed by Store! ✅'}
                      </h4>
                      <span className="text-[11px] text-zinc-300">
                        {searchedOrder.status === 'pending'
                          ? 'Order received. Store team will verify and confirm shortly.'
                          : searchedOrder.confirmedAt
                          ? `Confirmed on: ${searchedOrder.confirmedAt}`
                          : 'Order has been verified and confirmed.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ESTIMATED ARRIVAL & DELIVERY ACCESS HIGHLIGHT */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#d4af37]/15 via-[#d4af37]/10 to-transparent border border-[#d4af37]/40 space-y-2.5 shadow-inner">
                <div className="flex items-center gap-2 text-[#f9e7c4] font-semibold text-sm">
                  <Calendar className="w-4 h-4 text-[#d4af37]" />
                  <span>Expected Delivery & Arrival:</span>
                  <strong className="text-white font-mono text-sm underline decoration-[#d4af37]">
                    {searchedOrder.expectedDeliveryDate || searchedOrder.estimatedDelivery || '2–4 Business Days'}
                  </strong>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Truck className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Courier Partner: <strong className="text-white">{searchedOrder.courierName || 'TCS Express Pakistan'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-zinc-400">Tracking Code:</span>
                    <strong className="text-[#f9e7c4] font-mono">{searchedOrder.trackingNumber}</strong>
                  </div>
                </div>

                {searchedOrder.deliveryTimeSlot && (
                  <div className="flex items-center gap-2 text-xs text-zinc-300 pt-0.5">
                    <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Arrival Time Window: <strong className="text-white">{searchedOrder.deliveryTimeSlot}</strong></span>
                  </div>
                )}

                {searchedOrder.deliveryNotes && (
                  <div className="pt-2 border-t border-[#d4af37]/20 text-xs text-amber-200/90 font-light flex items-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#d4af37] shrink-0 mt-0.5" />
                    <span><strong>Store Delivery Note:</strong> {searchedOrder.deliveryNotes}</span>
                  </div>
                )}
              </div>

              {/* Progress Stepper Bar */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Current Stage:</span>
                  <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[11px]">
                    {searchedOrder.status === 'pending'
                      ? '🟡 1. Order Placed · Awaiting Review'
                      : searchedOrder.status === 'confirmed'
                      ? '🟢 2. Confirmed by Admin · In Queue for Packing'
                      : searchedOrder.status === 'crafting' || searchedOrder.status === 'quality_check'
                      ? '📦 3. Packaging & Box Preparation'
                      : searchedOrder.status === 'dispatched'
                      ? '🚚 4. Dispatched via Courier Transit'
                      : searchedOrder.status === 'handed_over'
                      ? '🤝 5. Handed Over · Courier Out for Delivery'
                      : '🎉 6. Delivered to Customer'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#d4af37] via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${(currentStep / 6) * 100}%`,
                    }}
                  />
                </div>

                {/* Stepper Labels */}
                <div className="grid grid-cols-6 text-[9px] sm:text-[10px] text-zinc-400 text-center gap-1 pt-1">
                  <div className={currentStep >= 1 ? 'text-[#d4af37] font-semibold' : ''}>
                    1. Placed
                  </div>
                  <div className={currentStep >= 2 ? 'text-emerald-400 font-semibold' : ''}>
                    2. Confirmed
                  </div>
                  <div className={currentStep >= 3 ? 'text-[#d4af37] font-semibold' : ''}>
                    3. Packaging
                  </div>
                  <div className={currentStep >= 4 ? 'text-[#d4af37] font-semibold' : ''}>
                    4. Dispatched
                  </div>
                  <div className={currentStep >= 5 ? 'text-amber-400 font-semibold' : ''}>
                    5. Handed Over
                  </div>
                  <div className={currentStep >= 6 ? 'text-emerald-400 font-bold' : ''}>
                    6. Delivered
                  </div>
                </div>
              </div>

              {/* Order Footwear Items */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">
                  Items in this Order ({searchedOrder.items.length}):
                </span>
                <div className="space-y-2">
                  {searchedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-lg bg-zinc-900 border border-white/10"
                        />
                        <div>
                          <strong className="text-white block font-serif">{item.product.name}</strong>
                          <span className="text-[11px] text-zinc-400">
                            Finish: {item.finish.name} · Size: EU {item.size} · Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-zinc-200">
                        Rs. {(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Destination */}
              <div className="p-3 bg-black/30 border border-white/5 rounded-xl flex items-start gap-2.5 text-xs text-zinc-300">
                <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                    Delivery Destination Address:
                  </span>
                  <span>
                    {searchedOrder.shippingAddress.street}, {searchedOrder.shippingAddress.city}, {searchedOrder.shippingAddress.postalCode}, Pakistan
                  </span>
                  <span className="block text-[11px] text-zinc-400 mt-0.5">
                    Contact: {searchedOrder.shippingAddress.phone}
                  </span>
                </div>
              </div>

            </div>
          ) : hasSearched ? (
            <div className="text-center py-10 bg-[#12151e] rounded-2xl border border-white/10 p-6 space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <h4 className="font-serif text-base text-white">No Order Found Matching "{query}"</h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Please verify your Order Reference Number (e.g. V-10294) or the contact phone number used during checkout.
              </p>
            </div>
          ) : (
            <div className="text-center py-10 bg-[#12151e] rounded-2xl border border-white/10 p-6 space-y-2">
              <Package className="w-10 h-10 text-zinc-600 mx-auto" />
              <h4 className="font-serif text-base text-white">Enter Your Order Details to Track</h4>
              <p className="text-xs text-zinc-400">
                Type your Order ID or registered mobile phone number above to see live confirmation and arrival dates.
              </p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Close Tracker
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
