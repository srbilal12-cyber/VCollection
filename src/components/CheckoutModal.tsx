import React, { useState } from 'react';
import { X, CheckCircle2, CreditCard, Truck, ShieldCheck, ArrowRight, ArrowLeft, Lock, Banknote, Sparkles, Mail, Send, Database } from 'lucide-react';
import { CartItem, Order, SavedAddress, UserProfile } from '../types';
import { dispatchOrderEmailAlert, getOwnerNotificationEmail, generateOrderMailtoUrl } from '../utils/orderEmailService';
import { syncOrderToSupabase, syncCustomerToSupabase, SUPABASE_PROJECT_ID } from '../lib/supabase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  appliedDiscount: number;
  isGiftWrapped: boolean;
  giftMessage: string;
  user: UserProfile;
  isCustomerLoggedIn?: boolean;
  onRequireLogin?: () => void;
  onCustomerLoginSuccess?: (user: UserProfile) => void;
  onOrderComplete: (order: Order) => void;
  onOpenTracker?: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  appliedDiscount,
  isGiftWrapped,
  giftMessage,
  user,
  isCustomerLoggedIn = false,
  onRequireLogin,
  onCustomerLoginSuccess,
  onOrderComplete,
  onOpenTracker,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    user.savedAddresses.find((a) => a.isDefault)?.id || user.savedAddresses[0]?.id || 'custom'
  );

  // Address form fields - start clean so customers enter their own information
  const currentAddr = user.savedAddresses.find((a) => a.id === selectedAddressId);
  const [fullName, setFullName] = useState(currentAddr?.fullName || (isCustomerLoggedIn ? user.name : ''));
  const [email, setEmail] = useState(isCustomerLoggedIn ? user.email : '');
  const [phone, setPhone] = useState(currentAddr?.phone || '');
  const [street, setStreet] = useState(currentAddr?.street || '');
  const [city, setCity] = useState(currentAddr?.city || 'Lahore');
  const [postalCode, setPostalCode] = useState(currentAddr?.postalCode || '');
  const [country, setCountry] = useState(currentAddr?.country || 'Pakistan');
  const [shippingMethod, setShippingMethod] = useState<'white-glove' | 'express'>('white-glove');

  // Account creation state when customer is not logged in
  const [accountPassword, setAccountPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Payment form fields (default to COD for seamless shopping in Pakistan)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'wallet'>('cod');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(isCustomerLoggedIn ? user.name : '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [codAcknowledged, setCodAcknowledged] = useState(false);

  // Completed order reference
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const subtotal = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const dropShippingFee = 200; // Rs. 200 flat drop shipping for any order
  const codFee = paymentMethod === 'cod' ? 100 : 0; // Rs. 100 on Cash on Delivery
  const giftCost = isGiftWrapped ? 250 : 0;
  const grandTotal = Math.max(0, subtotal - appliedDiscount + dropShippingFee + codFee + giftCost);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !street || !city || !postalCode) return;

    // Requirement: Every customer must have an account to place an order
    if (!isCustomerLoggedIn) {
      if (!accountPassword || accountPassword.length < 6) {
        setAuthError('Please enter a password of at least 6 characters to create your customer account.');
        return;
      }

      setAuthError(null);
      const newCustomer: UserProfile = {
        id: `usr-${Date.now()}`,
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        tier: 'Patron',
        points: 150,
        savedAddresses: [
          {
            id: `addr-${Date.now()}`,
            fullName: fullName.trim(),
            phone: phone.trim(),
            street: street.trim(),
            city: city.trim(),
            postalCode: postalCode.trim(),
            country: country.trim(),
            isDefault: true,
          },
        ],
        orders: [],
        wishlistIds: [],
      };

      // ☁️ Sync customer directly to Supabase Backend
      syncCustomerToSupabase(newCustomer, accountPassword).catch((err) => {
        console.warn('[Supabase Customer Auto-Register Notice]:', err);
      });

      // Save to localStorage registered users
      try {
        const stored = localStorage.getItem('vcollection_registered_users');
        const list = stored ? JSON.parse(stored) : [];
        list.push({ ...newCustomer, password: accountPassword });
        localStorage.setItem('vcollection_registered_users', JSON.stringify(list));
      } catch (err) {}

      if (onCustomerLoginSuccess) {
        onCustomerLoginSuccess(newCustomer);
      }
    }

    setStep(2);
  };

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'cod' && !codAcknowledged) return;

    setIsSubmittingOrder(true);

    const orderCost = items.reduce((sum, it) => {
      const unitCost = it.product.costPrice ?? Math.round(it.product.price * 0.55);
      return sum + unitCost * it.quantity;
    }, 0);
    const orderProfit = Math.max(0, grandTotal - orderCost);

    const newOrder: Order = {
      id: `V-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().split('T')[0],
      items: [...items],
      subtotal,
      discount: appliedDiscount,
      shipping: dropShippingFee,
      dropShippingFee,
      codFee,
      total: grandTotal,
      totalCost: orderCost,
      totalProfit: orderProfit,
      status: 'pending', // INITIAL STATUS: PENDING STORE OWNER CONFIRMATION
      trackingNumber: `TCS-PK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      courierName: 'TCS Express Pakistan',
      expectedDeliveryDate: 'Pending Admin Confirmation (2–4 Business Days)',
      deliveryTimeSlot: '2:00 PM – 6:00 PM (Standard Courier Slot)',
      deliveryNotes: 'Order received. Store director Bilal is reviewing your order and will confirm delivery schedule shortly.',
      shippingAddress: {
        fullName,
        email,
        phone,
        street,
        city,
        postalCode,
        country,
      },
      paymentMethod,
      estimatedDelivery: '2–4 Business Days (Express Courier)',
    };

    setCompletedOrder(newOrder);
    onOrderComplete(newOrder);

    // ☁️ Stored in Supabase Backend!
    syncOrderToSupabase(newOrder, user?.id).catch((err) => {
      console.warn('[Supabase Order Sync Warning]:', err);
    });

    // Automated dispatch of email alert to authorized owner
    try {
      dispatchOrderEmailAlert(newOrder);
    } catch (err) {
      console.error('Error dispatching order email alert', err);
    }

    setIsSubmittingOrder(false);
    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0f121a] border border-gold-subtle rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header Bar */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#12151e]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#d4af37] font-semibold block">
              Atelier Checkout Experience
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-[#f5ebd7]">
              {step === 1 && '1. Shipping & Concierge Delivery'}
              {step === 2 && '2. Secure Luxury Settlement'}
              {step === 3 && 'Order Confirmed · Commission Registered'}
            </h3>
          </div>
          {step !== 3 && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Progress Line */}
        <div className="grid grid-cols-3 h-1 bg-white/5">
          <div className={`h-full ${step >= 1 ? 'bg-[#d4af37]' : ''}`} />
          <div className={`h-full ${step >= 2 ? 'bg-[#d4af37]' : ''}`} />
          <div className={`h-full ${step >= 3 ? 'bg-[#d4af37]' : ''}`} />
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          
          {/* STEP 1: Shipping Details */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              {/* Saved Address Pill Toggle */}
              {user.savedAddresses.length > 0 && (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
                    Use VIP Saved Address:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {user.savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          setFullName(addr.fullName);
                          setPhone(addr.phone);
                          setStreet(addr.street);
                          setCity(addr.city);
                          setPostalCode(addr.postalCode);
                          setCountry(addr.country);
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-[#d4af37] bg-white/5 shadow-md'
                            : 'border-white/10 hover:border-white/20 bg-black/30'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-white">
                          <span>{addr.fullName}</span>
                          {addr.isDefault && <span className="text-[10px] text-[#d4af37]">Default</span>}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{addr.street}, {addr.city}</p>
                        <p className="text-xs text-zinc-500">{addr.country}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Account Registration */}
              {!isCustomerLoggedIn ? (
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#171b26] to-[#12151e] border border-[#d4af37]/40 space-y-3 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                      <span className="text-xs font-bold text-[#f9e7c4]">
                        Customer Account Registration
                      </span>
                    </div>
                    {onRequireLogin && (
                      <button
                        type="button"
                        onClick={onRequireLogin}
                        className="text-[11px] text-[#d4af37] hover:underline font-semibold"
                      >
                        Already have an account? Sign In →
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    Create an account to securely track your order, manage addresses, and receive warranty coverage.
                  </p>

                  <div className="pt-1">
                    <label className="text-xs text-[#f9e7c4] font-medium block mb-1.5">
                      Create Password:
                    </label>
                    <input
                      type="password"
                      required={!isCustomerLoggedIn}
                      value={accountPassword}
                      onChange={(e) => {
                        setAccountPassword(e.target.value);
                        if (authError) setAuthError(null);
                      }}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#d4af37]"
                    />
                    {authError && (
                      <p className="text-[11px] text-rose-400 mt-1 font-medium">{authError}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Customer Account: <strong className="text-white">{user.name}</strong> ({user.email})</span>
                  </div>
                </div>
              )}

              {/* Form Input Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Email (for Order Confirmation & Tracking)</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Mobile Telephone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Street Address & Suite</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Country</label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Drop Shipping & Logistics Service */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
                  Drop Shipping & Fulfillment:
                </label>
                <div className="p-4 rounded-xl border border-[#d4af37] bg-white/5 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#d4af37]" />
                      <span>Insured Drop Shipping Courier (TCS / Trax Express)</span>
                    </span>
                    <span className="text-[#d4af37] font-mono text-sm font-bold">Rs. 200</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Direct drop shipping across Pakistan in protective luxury atelier boxing (2–4 business days). Flat Rs. 200 applies to every order.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <span className="text-xs text-zinc-400">
                  Subtotal: <strong className="text-white">Rs. {grandTotal.toLocaleString()}</strong>
                </span>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8329] text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-2 hover:brightness-110 shadow-lg"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Payment Method */}
          {step === 2 && (
            <form onSubmit={handleCompletePayment} className="space-y-6">
              {/* Payment Type Tabs */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all relative ${
                    paymentMethod === 'cod'
                      ? 'border-[#d4af37] bg-white/10 text-[#f5ebd7]'
                      : 'border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-[#d4af37]" />
                  <span>Cash on Delivery</span>
                  <span className="text-[10px] text-[#d4af37] font-mono font-medium">+Rs. 100 Fee</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#d4af37] bg-white/10 text-[#f5ebd7]'
                      : 'border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#d4af37]" />
                  <span>Credit Card</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-medium">No COD Fee</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'wallet'
                      ? 'border-[#d4af37] bg-white/10 text-[#f5ebd7]'
                      : 'border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-[#d4af37]" />
                  <span>Digital Wallet</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-medium">No COD Fee</span>
                </button>
              </div>

              {/* Card Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  {/* Luxury Card Mock Preview */}
                  <div className="p-6 rounded-2xl bg-gradient-to-tr from-[#151923] via-[#1d2232] to-[#12141c] border border-gold-subtle shadow-xl text-zinc-200 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-serif text-sm tracking-widest text-[#d4af37] font-semibold">
                        V ATELIER CARD
                      </span>
                      <Lock className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="font-mono text-base tracking-widest text-white mb-4">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block">Cardholder</span>
                        <span>{cardHolder || 'CARDHOLDER NAME'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block">Expires</span>
                        <span>{cardExpiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs text-zinc-400 mb-1">Card Number</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Expiration (MM/YY)</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">CVC Code</label>
                      <input
                        type="text"
                        required
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Cash on Delivery (COD) Option */}
              {paymentMethod === 'cod' && (
                <div className="p-5 bg-black/40 border border-gold-subtle/50 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white text-sm font-semibold">
                      <Banknote className="w-5 h-5 text-[#d4af37]" />
                      <span>Cash on Delivery (White-Glove Doorstep Inspection)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-[10px] font-mono font-bold">
                      +Rs. 100 COD Fee
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-light">
                    Our courier will present your boxed pair for inspection. You may verify the leather finish, size fit, and included accessories before tendering payment of <strong>Rs. {grandTotal.toLocaleString()}</strong> in cash. (Includes <strong>Rs. 100 Cash on Delivery charge</strong> + <strong>Rs. 200 Drop Shipping fee</strong>).
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={codAcknowledged}
                      onChange={(e) => setCodAcknowledged(e.target.checked)}
                      required
                      className="rounded border-zinc-600 text-[#d4af37] focus:ring-[#d4af37]"
                    />
                    <span className="text-xs text-zinc-200">
                      I confirm I will be available to tender Rs. {grandTotal.toLocaleString()} in cash to courier.
                    </span>
                  </label>
                </div>
              )}

              {/* Digital Wallet Option */}
              {paymentMethod === 'wallet' && (
                <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-[#d4af37] mx-auto" />
                  <p className="text-xs text-zinc-300">
                    One-touch biometric authorization via Apple Pay, Google Wallet, or Atelier Patron Token.
                  </p>
                  <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-mono">
                    Token Ready: {user.tier} Patron Verified (Saves Rs. 100 COD Fee)
                  </span>
                </div>
              )}

              {/* Order Cost Itemized Summary */}
              <div className="p-4 bg-black/60 border border-white/10 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Footwear Subtotal:</span>
                  <span className="text-zinc-200 font-mono">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span>Drop Shipping Charges:</span>
                    <span className="text-[10px] text-[#d4af37] bg-[#d4af37]/10 px-1.5 py-0.5 rounded">All Orders</span>
                  </span>
                  <span className="text-zinc-200 font-mono font-semibold">Rs. {dropShippingFee}</span>
                </div>
                {paymentMethod === 'cod' ? (
                  <div className="flex justify-between text-[#d4af37]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span>Cash on Delivery (COD) Fee:</span>
                      <span className="text-[10px] bg-[#d4af37]/20 px-1.5 py-0.5 rounded">Courier Handling</span>
                    </span>
                    <span className="font-mono font-bold">+Rs. {codFee}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-emerald-400 text-[11px]">
                    <span>Cash on Delivery (COD) Fee:</span>
                    <span className="font-mono">Rs. 0 (Card / Prepaid Benefit)</span>
                  </div>
                )}
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Atelier VIP Privilege:</span>
                    <span className="font-mono">-Rs. {appliedDiscount.toLocaleString()}</span>
                  </div>
                )}
                {isGiftWrapped && (
                  <div className="flex justify-between text-zinc-400">
                    <span>Atelier Gift Wrap:</span>
                    <span className="text-zinc-200 font-mono">Rs. {giftCost}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                  <span>Total Due:</span>
                  <span className="text-[#f9e7c4] font-serif text-lg font-bold tabular-nums">
                    Rs. {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Navigation & Submit */}
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Shipping</span>
                </button>

                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e2c158] to-[#aa8329] text-black font-semibold text-xs uppercase tracking-widest hover:brightness-110 shadow-xl shadow-[#d4af37]/20 flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authorize Commission · Rs. {grandTotal.toLocaleString()}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Order Confirmation & Receipt */}
          {step === 3 && completedOrder && (
            <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
                  Commission Confirmed
                </span>
                <h3 className="font-serif text-3xl text-[#f9e7c4]">
                  Thank You, {completedOrder.shippingAddress.fullName.split(' ')[0]}
                </h3>
                <p className="text-xs text-zinc-400">
                  Order Reference: <strong className="text-white font-mono">{completedOrder.id}</strong> · Tracking:{' '}
                  <strong className="text-[#d4af37] font-mono">{completedOrder.trackingNumber}</strong>
                </p>
              </div>

              {/* Order Status Notification Banner */}
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl max-w-lg mx-auto flex items-center justify-center gap-2 text-xs text-emerald-300 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-medium">Order Confirmed & Securely Registered</span>
              </div>

              {/* Live Order Status & Tracking Banner */}
              <div className="p-4 bg-gradient-to-r from-amber-500/10 via-black to-emerald-500/10 border border-[#d4af37]/40 rounded-xl text-left max-w-lg mx-auto space-y-3 shadow-lg">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-zinc-300 font-medium">Order Status:</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold uppercase tracking-wider">
                    {completedOrder.status === 'confirmed' ? '✓ Order Confirmed' : 'Pending Confirmation'}
                  </span>
                </div>

                <div className="text-xs text-zinc-300 space-y-1 bg-black/40 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Order Reference:</span>
                    <strong className="text-[#f9e7c4] font-mono text-sm">{completedOrder.id}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Estimated Delivery:</span>
                    <strong className="text-white font-mono text-xs">{completedOrder.expectedDeliveryDate || '2–4 Business Days'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Courier Partner:</span>
                    <strong className="text-zinc-200">{completedOrder.courierName || 'TCS Express Pakistan'}</strong>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Your order has been recorded. Once our atelier team verifies and schedules delivery, live dispatch tracking and exact arrival window will be available in your tracking console.
                </p>

                {/* Track Order Live Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenTracker) {
                      onOpenTracker(completedOrder.id);
                      onClose();
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6ca65] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
                >
                  <Truck className="w-4 h-4 text-black" />
                  <span>Track Order Live</span>
                </button>
              </div>

              {/* Receipt Summary Box */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-left max-w-lg mx-auto text-xs space-y-2">
                <div className="font-semibold text-white border-b border-white/10 pb-2 flex justify-between">
                  <span>Selected Footwear</span>
                  <span>Total: Rs. {completedOrder.total.toLocaleString()}</span>
                </div>
                {completedOrder.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-zinc-300">
                    <span>
                      {it.product.name} (EU {it.size}, {it.finish.colorName}) x {it.quantity}
                    </span>
                    <span className="tabular-nums font-mono">Rs. {(it.product.price * it.quantity).toLocaleString()}</span>
                  </div>
                ))}
                {completedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>VIP Atelier Privilege</span>
                    <span className="font-mono">-Rs. {completedOrder.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-1.5 border-t border-white/5 space-y-1 text-zinc-300">
                  <div className="flex justify-between">
                    <span>Drop Shipping Charges</span>
                    <span className="font-mono text-zinc-200">Rs. {completedOrder.dropShippingFee ?? 200}</span>
                  </div>
                  {completedOrder.paymentMethod === 'cod' && (
                    <div className="flex justify-between text-[#d4af37]">
                      <span>Cash on Delivery (COD) Fee</span>
                      <span className="font-mono">+Rs. {completedOrder.codFee ?? 100}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-zinc-400 pt-1 border-t border-white/5">
                  <span>Destination</span>
                  <span>
                    {completedOrder.shippingAddress.street}, {completedOrder.shippingAddress.city}
                  </span>
                </div>
              </div>

              {/* Owner Notification Dispatch Confirmation */}
              <div className="p-3.5 bg-gradient-to-r from-[#d4af37]/10 via-[#d4af37]/5 to-transparent border border-[#d4af37]/30 rounded-xl text-left max-w-lg mx-auto text-xs space-y-1.5 shadow-inner">
                <div className="flex items-center gap-2 text-[#f9e7c4] font-semibold">
                  <div className="p-1 rounded bg-[#d4af37]/20 text-[#d4af37]">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <span>Order Alert Dispatched to Atelier Management</span>
                </div>
                <p className="text-[11px] text-zinc-300">
                  An automated email alert with complete delivery details and footwear specifications has been forwarded to{' '}
                  <strong className="text-white font-mono">{getOwnerNotificationEmail()}</strong>.
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <a
                    href={generateOrderMailtoUrl(completedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] text-[#d4af37] hover:underline font-mono"
                  >
                    <Send className="w-3 h-3" />
                    Open Order Email in Mail Client
                  </a>
                  <span className="text-[10px] text-emerald-400 font-mono">Status: Alert Logged</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-wider"
                >
                  Return to Storefront
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
