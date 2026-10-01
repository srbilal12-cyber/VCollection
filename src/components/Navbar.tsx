import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, User as UserIcon, Menu, X, ChevronDown, Sparkles, Sun, Moon, Truck } from 'lucide-react';
import { Category, UserProfile } from '../types';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenAccount: () => void;
  onOpenTracker?: () => void;
  onSelectCategory: (cat: Category) => void;
  onNavigatePage: (page: string) => void;
  currentPage: string;
  theme?: 'dark' | 'bright';
  onToggleTheme?: () => void;
  isOwnerAuthenticated?: boolean;
  ownerEmail?: string;
  onLogoutOwner?: () => void;
  isCustomerLoggedIn?: boolean;
  currentUser?: UserProfile | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenSearch,
  onOpenAccount,
  onOpenTracker,
  onSelectCategory,
  onNavigatePage,
  currentPage,
  theme = 'dark',
  onToggleTheme,
  isCustomerLoggedIn = false,
  currentUser,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  const handleCategoryClick = (cat: Category) => {
    onSelectCategory(cat);
    onNavigatePage('shop');
    setMegaMenuOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Public Top Announcement Bar */}
      <div className="bg-[#12151d] text-[#c5a880] text-[11px] md:text-xs py-2 px-4 tracking-wider border-b border-[#c5a880]/15 flex items-center justify-center text-center top-announcement-bar">
        <span className="font-medium text-white tracking-wide">Nationwide Insured Delivery on all orders across Pakistan</span>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#0b0d11]/90 backdrop-blur-md border-b border-[#d4af37]/20 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-300 hover:text-white focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => onNavigatePage('home')}
            className="group flex flex-col items-center sm:items-start text-left focus:outline-none"
          >
            <span className="font-serif text-2xl md:text-3xl tracking-[0.25em] text-[#f5ebd7] font-semibold uppercase group-hover:text-[#d4af37] transition-colors">
              V COLLECTION
            </span>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-[0.18em] font-medium text-zinc-300">
            <button
              onClick={() => onNavigatePage('home')}
              className={`hover:text-[#d4af37] transition-colors py-2 relative ${currentPage === 'home' ? 'text-[#d4af37]' : ''}`}
            >
              Home
              {currentPage === 'home' && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#d4af37]" />
              )}
            </button>

            {/* Mega Menu Trigger */}
            <div
              className="relative py-2"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <button
                onClick={() => {
                  onSelectCategory('all');
                  onNavigatePage('shop');
                }}
                className={`flex items-center gap-1 hover:text-[#d4af37] transition-colors ${currentPage === 'shop' ? 'text-[#d4af37]' : ''}`}
              >
                Collections
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega Menu Dropdown */}
              {megaMenuOpen && (
                <div className="absolute top-full -left-20 w-[640px] bg-[#10131b] border border-gold-subtle rounded-xl shadow-2xl p-6 grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div>
                    <h4 className="text-[11px] uppercase tracking-widest text-[#d4af37] font-semibold mb-3">
                      Formal & Heritage
                    </h4>
                    <ul className="space-y-2 text-xs normal-case tracking-normal">
                      <li>
                        <button
                          onClick={() => handleCategoryClick('formal')}
                          className="text-zinc-300 hover:text-white transition-colors text-left"
                        >
                          Wholecut Oxfords
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleCategoryClick('formal')}
                          className="text-zinc-300 hover:text-white transition-colors text-left"
                        >
                          Double Monkstraps
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleCategoryClick('formal')}
                          className="text-zinc-300 hover:text-white transition-colors text-left"
                        >
                          Quarter-Brogue Derbys
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-[11px] uppercase tracking-widest text-[#d4af37] font-semibold mb-3">
                      Italian Loafers
                    </h4>
                    <ul className="space-y-2 text-xs normal-case tracking-normal">
                      <li>
                        <button
                          onClick={() => handleCategoryClick('loafers')}
                          className="text-zinc-300 hover:text-white transition-colors text-left"
                        >
                          Horsebit Loafers
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleCategoryClick('loafers')}
                          className="text-zinc-300 hover:text-white transition-colors text-left"
                        >
                          Belgian Penny Loafers
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleCategoryClick('casual')}
                          className="text-zinc-300 hover:text-white transition-colors text-left"
                        >
                          Monaco Minimalist Sneakers
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-[11px] uppercase tracking-widest text-[#d4af37] font-semibold mb-3">
                      Boots & Bespoke
                    </h4>
                    <ul className="space-y-2 text-xs normal-case tracking-normal">
                      <li>
                        <button
                          onClick={() => handleCategoryClick('boots')}
                          className="text-zinc-300 hover:text-white transition-colors text-left"
                        >
                          Suede Chelsea Boots
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleCategoryClick('boots')}
                          className="text-zinc-300 hover:text-white transition-colors text-left"
                        >
                          Alpine Wingtip Boots
                        </button>
                      </li>
                      <li className="pt-2">
                        <button
                          onClick={() => {
                            onSelectCategory('all');
                            onNavigatePage('shop');
                            setMegaMenuOpen(false);
                          }}
                          className="text-[#d4af37] text-xs font-semibold hover:underline flex items-center gap-1"
                        >
                          View Full Catalog →
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigatePage('craftsmanship')}
              className={`hover:text-[#d4af37] transition-colors py-2 relative ${currentPage === 'craftsmanship' ? 'text-[#d4af37]' : ''}`}
            >
              Craftsmanship
            </button>

            <button
              onClick={() => onNavigatePage('about')}
              className={`hover:text-[#d4af37] transition-colors py-2 relative ${currentPage === 'about' ? 'text-[#d4af37]' : ''}`}
            >
              Atelier
            </button>

            <button
              onClick={() => onNavigatePage('contact')}
              className={`hover:text-[#d4af37] transition-colors py-2 relative ${currentPage === 'contact' ? 'text-[#d4af37]' : ''}`}
            >
              Concierge
            </button>
          </nav>

          {/* Zone 3: Actions & Affordances (Clean & Luxurious) */}
          <div className="flex items-center gap-3 sm:gap-4 text-zinc-300">
            {/* Track Order Button */}
            {onOpenTracker && (
              <button
                onClick={onOpenTracker}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-[#d4af37]/20 border border-white/10 hover:border-[#d4af37]/40 text-zinc-300 hover:text-[#d4af37] text-xs font-medium transition-all shadow-sm"
                title="Track order status and arrival schedule"
              >
                <Truck className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Track Order</span>
              </button>
            )}

            {/* Search Affordance */}
            <button
              onClick={onOpenSearch}
              className="p-2 hover:text-[#d4af37] transition-colors rounded-full hover:bg-white/5"
              aria-label="Search Collection"
              title="Search shoes"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => {
                onNavigatePage('account');
              }}
              className="p-2 hover:text-[#d4af37] transition-colors rounded-full hover:bg-white/5 relative"
              aria-label="Wishlist"
              title="Saved Shoes"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#d4af37] text-black font-semibold text-[10px] flex items-center justify-center tabular-nums">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* User Account Portal */}
            <button
              onClick={onOpenAccount}
              className="p-1.5 hover:text-[#d4af37] transition-colors rounded-full hover:bg-white/5 relative flex items-center gap-1.5"
              aria-label="Customer Account"
              title={isCustomerLoggedIn && currentUser ? `Signed In as ${currentUser.name}` : 'Sign In / Register Customer Account'}
            >
              {isCustomerLoggedIn && currentUser ? (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#aa8329] text-black font-semibold text-xs flex items-center justify-center relative shadow-sm">
                  {currentUser.name.charAt(0).toUpperCase()}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black" />
                </div>
              ) : (
                <div className="p-1 text-zinc-300 hover:text-white flex items-center gap-1">
                  <UserIcon className="w-5 h-5" />
                </div>
              )}
            </button>

            {/* Theme Mode Toggle */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 hover:text-[#d4af37] transition-colors rounded-full hover:bg-white/5 relative flex items-center justify-center"
                aria-label={theme === 'dark' ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
                title={theme === 'dark' ? 'Switch to Bright Atelier (Ivory & Gold)' : 'Switch to Dark Atelier (Obsidian & Marble)'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-[#d4af37] hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-5 h-5 text-[#aa8329] hover:-rotate-12 transition-transform" />
                )}
              </button>
            )}

            {/* Shopping Bag Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8329] text-black font-semibold rounded-lg hover:brightness-110 transition-all shadow-md active:scale-95 whitespace-nowrap text-xs uppercase tracking-wider"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bag</span>
              <span className="w-5 h-5 rounded-full bg-black/80 text-[#f5ebd7] text-[11px] flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer (Clean, Zero Admin Clutter) */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0e1117] border-b border-[#d4af37]/20 px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs uppercase tracking-wider text-zinc-300">
              <button
                onClick={() => {
                  onNavigatePage('home');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 hover:text-[#d4af37]"
              >
                Home
              </button>
              <button
                onClick={() => handleCategoryClick('formal')}
                className="text-left py-2 hover:text-[#d4af37]"
              >
                Oxfords & Formals
              </button>
              <button
                onClick={() => handleCategoryClick('loafers')}
                className="text-left py-2 hover:text-[#d4af37]"
              >
                Italian Loafers
              </button>
              <button
                onClick={() => handleCategoryClick('boots')}
                className="text-left py-2 hover:text-[#d4af37]"
              >
                Boots & Chukkas
              </button>
              <button
                onClick={() => handleCategoryClick('casual')}
                className="text-left py-2 hover:text-[#d4af37]"
              >
                Luxury Sneakers
              </button>
              <button
                onClick={() => {
                  onNavigatePage('craftsmanship');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 hover:text-[#d4af37]"
              >
                Craftsmanship
              </button>
              <button
                onClick={() => {
                  onNavigatePage('about');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 hover:text-[#d4af37]"
              >
                Atelier Story
              </button>
              <button
                onClick={() => {
                  onNavigatePage('contact');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 hover:text-[#d4af37]"
              >
                Concierge Care
              </button>

              {onOpenTracker && (
                <button
                  onClick={() => {
                    onOpenTracker();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2.5 px-3 rounded-xl bg-[#d4af37]/15 hover:bg-[#d4af37]/25 border border-[#d4af37]/40 text-[#f9e7c4] flex items-center justify-between text-xs font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#d4af37]" />
                    <span>Track Order</span>
                  </div>
                  <span className="text-[10px] text-[#d4af37] font-mono">Live Tracker →</span>
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => {
                  onOpenSearch();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                Search shoes
              </button>

              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  className="text-xs text-zinc-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 border border-white/10"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>Bright Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-[#aa8329]" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => {
                  onOpenAccount();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-[#d4af37] font-medium"
              >
                {isCustomerLoggedIn && currentUser ? `${currentUser.name} (Account) →` : 'Sign In / Register →'}
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
