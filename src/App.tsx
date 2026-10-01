/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturedCollections } from './components/FeaturedCollections';
import { CraftsmanshipSection } from './components/CraftsmanshipSection';
import { TrustBadges } from './components/TrustBadges';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SearchModal } from './components/SearchModal';
import { ShopPage } from './components/ShopPage';
import { AccountPortal } from './components/AccountPortal';
import { OwnerDashboard } from './components/OwnerDashboard';
import { SeparateOwnerPortal } from './components/SeparateOwnerPortal';
import { OwnerAuthModal, AUTHORIZED_OWNER_EMAIL } from './components/OwnerAuthModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { FaqPage } from './components/FaqPage';
import { Footer } from './components/Footer';
import { OrderTrackingModal } from './components/OrderTrackingModal';

import { INITIAL_PRODUCTS, INITIAL_USER } from './data/products';
import { Product, CartItem, Category, ShoeFinish, Order, SavedAddress, UserProfile, Review } from './types';
import { Check } from 'lucide-react';
import {
  syncOrderToSupabase,
  updateOrderInSupabase,
  fetchOrdersFromSupabase,
  SUPABASE_PROJECT_ID
} from './lib/supabase';

export default function App() {
  // Persistent Products Catalog
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('vcollection_products_v3') || localStorage.getItem('vcollection_products_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading saved products', e);
    }
    return INITIAL_PRODUCTS;
  });

  // Persistent User Profile & Orders
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('vcollection_user_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed;
      }
    } catch (e) {
      console.error('Error loading saved user', e);
    }
    return INITIAL_USER;
  });

  // Persistent Global Orders (preserved across guest & patron sessions, accessible to owner)
  const [allOrders, setAllOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('vcollection_all_orders_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading all orders', e);
    }
    return [];
  });

  const saveAllOrders = (ordersList: Order[]) => {
    setAllOrders(ordersList);
    try {
      localStorage.setItem('vcollection_all_orders_v3', JSON.stringify(ordersList));
    } catch (e) {
      console.error('Error saving all orders', e);
    }
  };

  // ☁️ Sync orders from Supabase on mount
  useEffect(() => {
    fetchOrdersFromSupabase()
      .then((remoteOrders) => {
        if (remoteOrders && remoteOrders.length > 0) {
          setAllOrders((prev) => {
            const existingIds = new Set(prev.map((o) => o.id));
            const newRemote = remoteOrders.filter((o) => !existingIds.has(o.id));
            const remoteMap = new Map(remoteOrders.map((o) => [o.id, o]));
            const updatedPrev = prev.map((o) => remoteMap.get(o.id) || o);
            const merged = [...newRemote, ...updatedPrev];
            try {
              localStorage.setItem('vcollection_all_orders_v2', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      })
      .catch((err) => {
        console.info('[Supabase] Initial orders fetch notice:', err);
      });
  }, []);

  // Listen for #owner or #/owner or ?portal=owner in URL
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (hash.includes('owner') || params.get('portal') === 'owner') {
        setCurrentPage('owner');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Order Tracking Modal State
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState<boolean>(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');

  const handleOpenOrderTracking = (orderId?: string) => {
    if (orderId) {
      setTrackingOrderId(orderId);
    } else if (allOrders.length > 0) {
      setTrackingOrderId(allOrders[0].id);
    }
    setIsTrackingModalOpen(true);
  };

  // Customer Authentication State (for verified reviews & patron orders)
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vcollection_customer_auth') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState<boolean>(false);
  const [customerAuthContext, setCustomerAuthContext] = useState<string | null>(null);

  // Exclusive Owner Authentication State
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(() => {
    try {
      const auth = localStorage.getItem('vcollection_owner_auth');
      const email = localStorage.getItem('vcollection_owner_email');
      return auth === 'true' && email?.toLowerCase() === AUTHORIZED_OWNER_EMAIL.toLowerCase();
    } catch (e) {
      return false;
    }
  });

  const [ownerEmail, setOwnerEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('vcollection_owner_email') || '';
    } catch (e) {
      return '';
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 'cart-init-1',
      product: INITIAL_PRODUCTS[1], // Milano Horsebit Loafer
      size: 42,
      finish: INITIAL_PRODUCTS[1].finishes[0],
      quantity: 1,
    },
  ]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState<number>(0);
  const [checkoutGiftWrapped, setCheckoutGiftWrapped] = useState<boolean>(false);
  const [checkoutGiftMessage, setCheckoutGiftMessage] = useState<string>('');

  // Selected Product for Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Theme state: 'dark' (Obsidian Nero Marquina) vs 'bright' (Travertine & Ivory)
  const [theme, setTheme] = useState<'dark' | 'bright'>(() => {
    try {
      const saved = localStorage.getItem('vcollection_theme_v2');
      if (saved === 'dark' || saved === 'bright') return saved;
    } catch (e) {}
    return 'dark';
  });

  // Save theme on toggle
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'bright' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('vcollection_theme_v2', nextTheme);
    } catch (e) {}
    showToast(
      nextTheme === 'bright' ? 'Bright Atelier Mode' : 'Dark Obsidian Mode',
      nextTheme === 'bright' ? 'Classical Italian Travertine & Ivory' : 'Nero Marquina & Deep Obsidian'
    );
  };

  // Sync products to localStorage with resilient fallback
  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    try {
      localStorage.setItem('vcollection_products_v3', JSON.stringify(newProducts));
    } catch (e) {
      console.warn('Quota warning while saving products, pruning redundant storage cache', e);
      try {
        localStorage.removeItem('vcollection_products_v2');
        localStorage.setItem('vcollection_products_v3', JSON.stringify(newProducts));
      } catch (err) {
        console.error('Critical quota error in localStorage', err);
      }
    }
  };

  // Sync user/orders to localStorage
  const saveUser = (newUser: UserProfile) => {
    setUser(newUser);
    try {
      localStorage.setItem('vcollection_user_v2', JSON.stringify(newUser));
    } catch (e) {
      console.error('Error saving user profile', e);
    }
  };

  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; sub?: string } | null>(null);

  const showToast = (message: string, sub?: string) => {
    setToast({ message, sub });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Scroll to top on page transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Wishlist toggle
  const handleToggleWishlist = (productId: string) => {
    const isSaved = user.wishlistIds.includes(productId);
    const newWishlist = isSaved
      ? user.wishlistIds.filter((id) => id !== productId)
      : [...user.wishlistIds, productId];

    saveUser({ ...user, wishlistIds: newWishlist });
    const prod = products.find((p) => p.id === productId);
    showToast(
      isSaved ? 'Removed from Wishlist' : 'Saved to Atelier Wishlist',
      prod?.name
    );
  };

  // Add to Cart
  const handleAddToCart = (
    product: Product,
    finish: ShoeFinish,
    size: number,
    quantity: number = 1
  ) => {
    const existingIndex = cart.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.size === size &&
        item.finish.name === finish.name
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      setCart(updated);
    } else {
      const newItem: CartItem = {
        id: `ci-${Date.now()}-${Math.random()}`,
        product,
        size,
        finish,
        quantity,
      };
      setCart([...cart, newItem]);
    }

    showToast('Added to Shopping Bag', `${product.name} (EU ${size})`);
    setIsCartOpen(true);
  };

  // Quick Add shortcut
  const handleQuickAdd = (product: Product, finish: ShoeFinish, size: number) => {
    handleAddToCart(product, finish, size, 1);
  };

  // Instant Buy (PDP direct to checkout)
  const handleInstantBuy = (
    product: Product,
    finish: ShoeFinish,
    size: number,
    quantity: number
  ) => {
    handleAddToCart(product, finish, size, quantity);
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Update Cart Quantity
  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove Item from Cart
  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    showToast('Item removed from Bag');
  };

  // Open Product Detail Modal
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  // Trigger Checkout from Cart
  const handleProceedToCheckout = (discount: number, giftWrapped: boolean, giftMsg: string) => {
    setCheckoutDiscount(discount);
    setCheckoutGiftWrapped(giftWrapped);
    setCheckoutGiftMessage(giftMsg);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Handle Order Placement Completion
  const handleOrderComplete = (newOrder: Order) => {
    const earnedPoints = Math.round(newOrder.total * 0.1);
    const updatedAll = [newOrder, ...allOrders];
    saveAllOrders(updatedAll);

    // ☁️ Stored in Supabase Backend
    syncOrderToSupabase(newOrder, user?.id).catch((err) => {
      console.warn('[Supabase Order Sync Warning]:', err);
    });

    const updatedUser: UserProfile = {
      ...user,
      points: user.points + earnedPoints,
      orders: [newOrder, ...user.orders],
    };
    saveUser(updatedUser);
    setCart([]);
    showToast('Order Placed Successfully', `Reference #${newOrder.id} · Awaiting Confirmation`);
  };

  // Add new address
  const handleAddNewAddress = (newAddr: SavedAddress) => {
    saveUser({
      ...user,
      savedAddresses: [...user.savedAddresses, newAddr],
    });
    showToast('Destination Added', `${newAddr.city}, ${newAddr.country}`);
  };

  // OWNER ACTIONS
  const handleAddProduct = (newProd: Product) => {
    const updated = [newProd, ...products];
    saveProducts(updated);
    showToast('New Shoe Listed in Atelier', `${newProd.name} · Rs. ${newProd.price.toLocaleString()}`);
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    const updated = products.map((p) => (p.id === updatedProd.id ? updatedProd : p));
    saveProducts(updated);
    showToast('Shoe Specifications Updated', `${updatedProd.name} · Rs. ${updatedProd.price.toLocaleString()}`);
  };

  const handleDeleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    const updated = products.filter((p) => p.id !== productId);
    saveProducts(updated);
    showToast('Shoe Archival Complete', target ? `Removed ${target.name}` : undefined);
  };

  const handleResetProducts = () => {
    saveProducts(INITIAL_PRODUCTS);
    showToast('Atelier Catalog Reset', '8 Heritage Italian Masterpieces Restored');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updatedAll = allOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    saveAllOrders(updatedAll);

    // ☁️ Update status in Supabase Backend
    updateOrderInSupabase(orderId, { status: newStatus }).catch((err) => {
      console.warn('[Supabase Status Update Notice]:', err);
    });

    const updatedOrders = user.orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    saveUser({ ...user, orders: updatedOrders });
    showToast(`Order #${orderId} Updated`, `Status changed to: ${newStatus.replace('_', ' ')}`);
  };

  const handleUpdateOrderDetails = (orderId: string, updates: Partial<Order>) => {
    const updatedAll = allOrders.map((o) => (o.id === orderId ? { ...o, ...updates } : o));
    saveAllOrders(updatedAll);

    // ☁️ Update details in Supabase Backend
    updateOrderInSupabase(orderId, updates).catch((err) => {
      console.warn('[Supabase Order Details Update Notice]:', err);
    });

    const updatedUserOrders = user.orders.map((o) => (o.id === orderId ? { ...o, ...updates } : o));
    saveUser({ ...user, orders: updatedUserOrders });

    if (updates.status === 'delivered') {
      showToast(`Order #${orderId} Marked Delivered! 🎉`, 'Customer tracking updated: Order successfully delivered.');
    } else if (updates.status === 'dispatched') {
      showToast(`Order #${orderId} Dispatched! 🚚`, 'Courier partner tracking is now active.');
    } else if (updates.status === 'crafting') {
      showToast(`Order #${orderId} Handed Over / Packaging 📦`, 'Order is prepared for courier dispatch.');
    } else if (updates.status === 'confirmed') {
      showToast(`Order #${orderId} Confirmed! ✅`, 'Customer can now track confirmation & arrival.');
    } else if (updates.expectedDeliveryDate) {
      showToast(`Arrival Date Saved for #${orderId}`, `${updates.expectedDeliveryDate}`);
    } else {
      showToast(`Order #${orderId} Updated`);
    }
  };

  // Owner Login and Logout Handlers
  const handleOwnerLoginSuccess = (email: string) => {
    if (email.toLowerCase() === AUTHORIZED_OWNER_EMAIL.toLowerCase()) {
      setIsOwnerAuthenticated(true);
      setOwnerEmail(email);
      try {
        localStorage.setItem('vcollection_owner_auth', 'true');
        localStorage.setItem('vcollection_owner_email', email);
      } catch (e) {}
      showToast('Owner Verified', 'Executive portal unlocked');
      setCurrentPage('owner');
      window.location.hash = '#/owner-portal';
    }
  };

  const handleOwnerLogout = () => {
    setIsOwnerAuthenticated(false);
    setOwnerEmail('');
    try {
      localStorage.removeItem('vcollection_owner_auth');
      localStorage.removeItem('vcollection_owner_email');
    } catch (e) {}
    showToast('Signed Out', 'Owner administrative session ended');
    window.location.hash = '';
    if (currentPage === 'owner') {
      setCurrentPage('home');
    }
  };

  // Customer Account Handlers
  const handleCustomerLoginSuccess = (newUser: UserProfile) => {
    setUser(newUser);
    setIsCustomerLoggedIn(true);
    try {
      localStorage.setItem('vcollection_customer_auth', 'true');
      localStorage.setItem('vcollection_user_v2', JSON.stringify(newUser));
    } catch (e) {}
    showToast('Customer Verified', `Welcome ${newUser.name}! Your account is active.`);
  };

  const handleCustomerLogout = () => {
    setIsCustomerLoggedIn(false);
    try {
      localStorage.removeItem('vcollection_customer_auth');
    } catch (e) {}
    showToast('Signed Out', 'You have signed out of your customer account');
  };

  const handleRequireCustomerAuth = (context?: string) => {
    setCustomerAuthContext(context || 'Account required to continue');
    setIsCustomerAuthOpen(true);
  };

  const handleSaveReview = (productId: string, review: Review) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        const newReviews = [review, ...p.reviews];
        const avgRating = Number(
          (newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length).toFixed(1)
        );
        return {
          ...p,
          reviews: newReviews,
          rating: avgRating,
          reviewCount: newReviews.length,
        };
      }
      return p;
    });

    saveProducts(updated);

    // Also award +50 points to user account
    if (isCustomerLoggedIn) {
      const updatedUser = {
        ...user,
        points: user.points + 50,
      };
      saveUser(updatedUser);
    }

    showToast('Review Published', 'Your verified review is live with +50 reward points.');
  };

  const cartTotalItems = cart.reduce((acc, it) => acc + it.quantity, 0);

  // SEPARATE ISOLATED OWNER PORTAL
  if (currentPage === 'owner') {
    return (
      <SeparateOwnerPortal
        products={products}
        orders={allOrders}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetProducts={handleResetProducts}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onUpdateOrderDetails={handleUpdateOrderDetails}
        onViewProductStorefront={(p) => {
          setSelectedProduct(p);
          setCurrentPage('home');
          window.location.hash = '';
        }}
        onReturnToStorefront={() => {
          setCurrentPage('home');
          window.location.hash = '';
        }}
        theme={theme}
        ownerEmail={ownerEmail}
        isOwnerAuthenticated={isOwnerAuthenticated}
        onLoginSuccess={handleOwnerLoginSuccess}
        onLogoutOwner={handleOwnerLogout}
      />
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'bright' ? 'theme-bright' : 'theme-dark'} bg-[#0b0d11] text-[#e6e8eb] flex flex-col font-sans selection:bg-[#d4af37]/30 selection:text-[#f9e7c4] relative transition-colors duration-300`}>
      {/* Film-like Noise / Grain Texture Overlay */}
      <div className="noise-grain-overlay" aria-hidden="true" />

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 right-6 z-50 bg-[#161a24] border border-gold-subtle text-white p-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-white">{toast.message}</span>
            {toast.sub && <span className="text-[11px] text-zinc-400">{toast.sub}</span>}
          </div>
        </div>
      )}

      {/* Main Sticky Navigation */}
      <Navbar
        cartCount={cartTotalItems}
        wishlistCount={user.wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAccount={() => setCurrentPage('account')}
        onOpenTracker={() => handleOpenOrderTracking()}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentPage('shop');
        }}
        onNavigatePage={(page) => setCurrentPage(page)}
        currentPage={currentPage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isOwnerAuthenticated={isOwnerAuthenticated}
        ownerEmail={ownerEmail}
        onLogoutOwner={handleOwnerLogout}
      />

      {/* Dynamic Main Body Content */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <>
            {/* Hero Section */}
            <HeroSection
              onExploreClick={() => {
                setSelectedCategory('all');
                setCurrentPage('shop');
              }}
              onSelectProduct={handleSelectProduct}
              featuredProduct={products[0]}
              loaferProduct={products[1] || products[0]}
              theme={theme}
            />

            {/* Featured Collections & Best Sellers */}
            <FeaturedCollections
              products={products}
              onSelectProduct={handleSelectProduct}
              onQuickAdd={handleQuickAdd}
              wishlistIds={user.wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              onViewAllClick={() => {
                setSelectedCategory('all');
                setCurrentPage('shop');
              }}
            />

            {/* Quality Standard Section */}
            <CraftsmanshipSection
              onExploreBespoke={() => {
                setCurrentPage('contact');
              }}
            />

            {/* Trust Badges */}
            <TrustBadges />
          </>
        )}

        {currentPage === 'shop' && (
          <ShopPage
            products={products}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectProduct={handleSelectProduct}
            onQuickAdd={handleQuickAdd}
            wishlistIds={user.wishlistIds}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {currentPage === 'craftsmanship' && (
          <>
            <CraftsmanshipSection onExploreBespoke={() => setCurrentPage('contact')} />
            <AboutPage />
          </>
        )}

        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'faq' && <FaqPage />}

        {currentPage === 'account' && (
          <AccountPortal
            user={user}
            products={products}
            onSelectProduct={handleSelectProduct}
            onRemoveWishlist={handleToggleWishlist}
            onAddNewAddress={handleAddNewAddress}
            onTrackOrder={(order) => handleOpenOrderTracking(order.id)}
            onNavigateOwner={() => setCurrentPage('owner')}
            isOwnerAuthenticated={isOwnerAuthenticated}
            ownerEmail={ownerEmail}
            onOpenOwnerAuth={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Global Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(prod, finish, size, qty) => {
          handleAddToCart(prod, finish, size, qty);
          setSelectedProduct(null);
        }}
        onInstantBuy={handleInstantBuy}
        isWishlisted={selectedProduct ? user.wishlistIds.includes(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onSelectRelated={handleSelectProduct}
        allProducts={products}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleProceedToCheckout}
      />

      {/* Multi-Step Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        appliedDiscount={checkoutDiscount}
        isGiftWrapped={checkoutGiftWrapped}
        giftMessage={checkoutGiftMessage}
        user={user}
        isCustomerLoggedIn={isCustomerLoggedIn}
        onRequireLogin={() => {
          setCustomerAuthContext('Customer account is required to place and track orders.');
          setIsCustomerAuthOpen(true);
        }}
        onCustomerLoginSuccess={handleCustomerLoginSuccess}
        onOrderComplete={handleOrderComplete}
        onOpenTracker={(orderId) => handleOpenOrderTracking(orderId)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={handleSelectProduct}
      />

      {/* Exclusive Owner Verification Modal */}
      <OwnerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleOwnerLoginSuccess}
        currentEmail={ownerEmail}
        isOwnerAuthenticated={isOwnerAuthenticated}
        onLogout={handleOwnerLogout}
      />

      {/* Live Order Tracking Modal (Accessible to any visitor/shopper) */}
      <OrderTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        orders={allOrders}
        initialOrderId={trackingOrderId}
      />

      {/* Global Luxury Footer */}
      <Footer
        onNavigatePage={(page) => setCurrentPage(page)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentPage('shop');
        }}
        onOpenOwnerAuth={() => {
          if (isOwnerAuthenticated) {
            setCurrentPage('owner');
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        onOpenTracker={() => handleOpenOrderTracking()}
      />
    </div>
  );
}
