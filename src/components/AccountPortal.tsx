import React, { useState } from 'react';
import { Package, Heart, MapPin, Award, Truck, CheckCircle2, ChevronRight, Plus, LogOut, ArrowRight, UserCheck, X, ShieldCheck, Calendar, Clock } from 'lucide-react';
import { Order, Product, SavedAddress, UserProfile } from '../types';

interface AccountPortalProps {
  user: UserProfile;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onRemoveWishlist: (productId: string) => void;
  onAddNewAddress: (address: SavedAddress) => void;
  onTrackOrder: (order: Order) => void;
  onNavigateOwner?: () => void;
  isOwnerAuthenticated?: boolean;
  ownerEmail?: string;
  onOpenOwnerAuth?: () => void;
  isCustomerLoggedIn?: boolean;
  onCustomerLogout?: () => void;
  onOpenCustomerAuth?: () => void;
}

export const AccountPortal: React.FC<AccountPortalProps> = ({
  user,
  products,
  onSelectProduct,
  onRemoveWishlist,
  onAddNewAddress,
  onTrackOrder,
  onNavigateOwner,
  isOwnerAuthenticated = false,
  ownerEmail = '',
  onOpenOwnerAuth,
  isCustomerLoggedIn = false,
  onCustomerLogout,
  onOpenCustomerAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'privileges'>('orders');
  const [newAddressModal, setNewAddressModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPostal, setNewPostal] = useState('');
  const [newCountry, setNewCountry] = useState('Pakistan');

  const wishlistedProducts = products.filter((p) => user.wishlistIds.includes(p.id));

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newStreet || !newCity) return;
    const addr: SavedAddress = {
      id: `addr-${Date.now()}`,
      fullName: newFullName,
      phone: newPhone,
      street: newStreet,
      city: newCity,
      postalCode: newPostal,
      country: newCountry,
      isDefault: false,
    };
    onAddNewAddress(addr);
    setNewAddressModal(false);
    setNewFullName('');
    setNewPhone('');
    setNewStreet('');
    setNewCity('');
    setNewPostal('');
  };

  return (
    <div className="bg-[#0b0d11] min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* VIP Patron Header Card */}
        <div className="p-8 rounded-2xl bg-[#12151e] border border-gold-subtle shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 gold-foil-line" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#aa8329] text-black font-serif text-2xl font-bold flex items-center justify-center shadow-lg">
                {isCustomerLoggedIn && user.name ? user.name.charAt(0) : 'V'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
                    {isCustomerLoggedIn ? `${user.tier} Tier Member` : 'Client & Patron Portal'}
                  </span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl text-[#f9e7c4] mt-0.5">
                  {isCustomerLoggedIn && user.name ? user.name : 'V Collection Account'}
                </h1>
                <p className="text-xs text-zinc-400">
                  {isCustomerLoggedIn && user.email ? user.email : 'Sign in or create your account to track orders and save addresses.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 block">
                  Artisanal Points
                </span>
                <span className="font-serif text-2xl font-bold text-white tabular-nums">
                  {user.points || 0} pts
                </span>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 block">
                  Orders On File
                </span>
                <span className="font-serif text-2xl font-bold text-[#d4af37] tabular-nums">
                  {user.orders.length}
                </span>
              </div>
              {isCustomerLoggedIn && onCustomerLogout && (
                <button
                  onClick={onCustomerLogout}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors flex items-center gap-1.5"
                  title="Sign out of customer account"
                >
                  <LogOut className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Sign Out</span>
                </button>
              )}

              {!isCustomerLoggedIn && onOpenCustomerAuth && (
                <button
                  onClick={onOpenCustomerAuth}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8329] text-black text-xs font-semibold hover:brightness-110 transition-all shadow"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
          {[
            { id: 'orders', label: 'Order History & Tracking', icon: Package, count: user.orders.length },
            { id: 'wishlist', label: 'Saved Silhouettes', icon: Heart, count: user.wishlistIds.length },
            { id: 'addresses', label: 'Delivery Addresses', icon: MapPin, count: user.savedAddresses.length },
            { id: 'privileges', label: 'Atelier Privileges', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#d4af37] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] opacity-80 tabular-nums">({tab.count})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: Order History & Tracking */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {user.orders.length === 0 ? (
              <div className="text-center py-16 bg-[#10131b] rounded-2xl border border-white/10 p-6 space-y-3">
                <Package className="w-12 h-12 text-zinc-600 mx-auto" />
                <h3 className="font-serif text-lg text-white">No commissions placed yet</h3>
                <p className="text-xs text-zinc-400">
                  Your bespoke footwear history and live atelier tracking will appear here once commissioned.
                </p>
              </div>
            ) : (
              user.orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#10131b] border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-serif text-lg text-white font-semibold">
                          Order Reference #{order.id}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Order Confirmed by Management
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border flex items-center gap-1.5 ${
                          order.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : order.status === 'confirmed'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-white/5 text-zinc-300 border-white/10'
                        }`}>
                          {order.status === 'pending' ? (
                            <>
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>Pending Store Confirmation</span>
                            </>
                          ) : order.status === 'confirmed' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Order Confirmed ✅</span>
                            </>
                          ) : order.status === 'dispatched' ? (
                            <>
                              <Truck className="w-3 h-3 text-blue-400" />
                              <span>En Route via Courier</span>
                            </>
                          ) : (
                            order.status.replace('_', ' ')
                          )}
                        </span>
                      </div>

                      {/* Delivery Date & Arrival Highlight */}
                      <div className="flex items-center gap-2 text-xs text-[#f9e7c4] flex-wrap">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                          Expected to Reach You on:
                        </span>
                        <strong className="text-white font-mono underline decoration-[#d4af37]">
                          {order.expectedDeliveryDate || order.estimatedDelivery || '2–4 Business Days'}
                        </strong>
                        <span className="text-zinc-500">·</span>
                        <span className="text-zinc-400">Courier: {order.courierName || 'TCS Express Pakistan'}</span>
                      </div>

                      {order.deliveryNotes && (
                        <div className="text-[11px] text-amber-200/90 bg-[#d4af37]/10 p-2 rounded-lg border border-[#d4af37]/20 flex items-start gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#d4af37] shrink-0 mt-0.5" />
                          <span><strong>Management Note:</strong> {order.deliveryNotes}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:items-end gap-1 shrink-0">
                      <span className="text-xs text-zinc-400 block">Total Settlement</span>
                      <span className="font-serif text-xl text-[#f9e7c4] font-semibold tabular-nums">
                        Rs. {order.total.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => onTrackOrder(order)}
                        className="mt-1 px-3 py-1 rounded-lg bg-[#d4af37]/20 hover:bg-[#d4af37] text-[#d4af37] hover:text-black font-semibold text-xs transition-colors flex items-center gap-1.5 border border-[#d4af37]/40 shadow-sm"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track Delivery Live</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Tracking Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#d4af37] font-medium flex items-center gap-1.5">
                        <Truck className="w-4 h-4" />
                        <span>Tracking Code: {order.trackingNumber}</span>
                      </span>
                      <span className="text-zinc-400">Insured Doorstep Drop Shipping</span>
                    </div>

                    <div className="relative pt-4 pb-2">
                      <div className="h-1 bg-white/10 rounded-full w-full">
                        <div
                          className="h-full bg-gradient-to-r from-[#d4af37] to-amber-300 rounded-full transition-all duration-500"
                          style={{
                            width:
                              order.status === 'confirmed'
                                ? '25%'
                                : order.status === 'crafting'
                                ? '50%'
                                : order.status === 'quality_check'
                                ? '75%'
                                : '100%',
                          }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] text-zinc-400 mt-2">
                        <span className="text-[#d4af37]">1. Order Placed</span>
                        <span className={order.status !== 'confirmed' ? 'text-[#d4af37]' : ''}>
                          2. Hand-Lasting & Welt
                        </span>
                        <span className={order.status === 'dispatched' || order.status === 'delivered' ? 'text-[#d4af37]' : ''}>
                          3. Master QC
                        </span>
                        <span className={order.status === 'dispatched' || order.status === 'delivered' ? 'text-emerald-400 font-semibold' : ''}>
                          4. Dispatched (Express Courier - Pakistan)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Item List */}
                  <div className="space-y-3 pt-2">
                    {order.items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={it.product.images[0]}
                            alt={it.product.name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-12 object-cover rounded-lg bg-black/40 border border-white/10"
                          />
                          <div>
                            <h4 className="text-xs font-semibold text-white">{it.product.name}</h4>
                            <span className="text-[11px] text-zinc-400">
                              EU {it.size} · {it.finish.colorName} · Qty: {it.quantity}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-semibold text-[#f5ebd7] tabular-nums">
                          Rs. {(it.product.price * it.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: Wishlist */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistedProducts.length === 0 ? (
              <div className="text-center py-16 bg-[#10131b] rounded-2xl border border-white/10 p-6 space-y-3">
                <Heart className="w-12 h-12 text-zinc-600 mx-auto" />
                <h3 className="font-serif text-lg text-white">Your wishlist is empty</h3>
                <p className="text-xs text-zinc-400">
                  Tap the heart on any shoe in the catalog to save it for your next commission.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-[#10131b] border border-white/10 rounded-2xl space-y-3 hover:border-gold-subtle transition-all"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-full aspect-[4/3] object-cover rounded-xl bg-black/40"
                    />
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#d4af37] block">
                        {p.collection}
                      </span>
                      <h4 className="font-serif text-lg text-white font-medium">{p.name}</h4>
                      <span className="text-sm font-semibold text-[#f5ebd7] block tabular-nums mt-1">
                        Rs. {p.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => onSelectProduct(p)}
                        className="flex-1 py-2 rounded-xl bg-[#d4af37] text-black text-xs font-semibold uppercase tracking-wider"
                      >
                        Inspect & Buy
                      </button>
                      <button
                        onClick={() => onRemoveWishlist(p.id)}
                        className="px-3 py-2 rounded-xl bg-white/5 text-zinc-400 hover:text-rose-400 text-xs border border-white/10"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Saved Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm uppercase tracking-wider text-zinc-400 font-semibold">
                Saved Delivery Destinations
              </h3>
              <button
                onClick={() => setNewAddressModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#d4af37] text-black text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Destination</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-5 bg-[#10131b] border border-white/10 rounded-2xl space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">{addr.fullName}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] uppercase tracking-wider bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 px-2 py-0.5 rounded font-semibold">
                        Primary Residence
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300">{addr.street}</p>
                  <p className="text-xs text-zinc-400">{addr.city}, {addr.postalCode}</p>
                  <p className="text-xs text-zinc-500">{addr.country}</p>
                  <p className="text-xs text-zinc-400 pt-1">Tel: {addr.phone}</p>
                </div>
              ))}
            </div>

            {/* Add Address Modal */}
            {newAddressModal && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <form
                  onSubmit={handleSaveAddress}
                  className="w-full max-w-md bg-[#10131b] border border-gold-subtle rounded-2xl p-6 space-y-4 shadow-2xl"
                >
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <h3 className="font-serif text-lg text-white">Add Delivery Destination</h3>
                    <button type="button" onClick={() => setNewAddressModal(false)} className="text-zinc-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Telephone</label>
                    <input
                      type="tel"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Postal Code</label>
                      <input
                        type="text"
                        required
                        value={newPostal}
                        onChange={(e) => setNewPostal(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Country</label>
                    <input
                      type="text"
                      required
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setNewAddressModal(false)}
                      className="px-4 py-2 rounded-xl bg-white/5 text-zinc-300 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-wider"
                    >
                      Save Destination
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Atelier Privileges */}
        {activeTab === 'privileges' && (
          <div className="p-8 bg-[#10131b] border border-white/10 rounded-2xl space-y-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
                Bespoke Society Privileges
              </span>
              <h3 className="font-serif text-2xl text-white mt-1">
                Your Patron Tier Membership Benefits
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                As a verified patron, your feet measurements and anatomical preferences are archived at our Riviera del Brenta workshop.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-xs font-semibold text-[#f5ebd7] block">Complimentary Resoling</span>
                <p className="text-xs text-zinc-400">
                  Enjoy one complimentary Goodyear welt oak-bark resoling and toe plate refresh annually.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-xs font-semibold text-[#f5ebd7] block">Private Trunk Shows</span>
                <p className="text-xs text-zinc-400">
                  Exclusive invitations to seasonal leather preview salons in Milan, London, and New York.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-xs font-semibold text-[#f5ebd7] block">Dedicated Concierge</span>
                <p className="text-xs text-zinc-400">
                  Direct WhatsApp & phone line to our chief shoemaker for custom patina and fitting advice.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
