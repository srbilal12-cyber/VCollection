export type Category = 'all' | 'formal' | 'loafers' | 'boots' | 'casual' | 'bespoke';

export interface ShoeFinish {
  name: string;
  hex: string;
  colorName: string;
  image?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  fit: 'True to Size' | 'Runs Slightly Large' | 'Runs Slightly Small';
}

export interface Product {
  id: string;
  name: string;
  collection: string;
  category: Category;
  gender: 'men' | 'women' | 'unisex';
  price: number; // Retail selling price
  costPrice?: number; // Wholesale / production cost price (kitnay ka aya)
  originalPrice?: number;
  hasDiscount?: boolean;
  discountPercent?: number;
  description: string;
  story: string;
  details: {
    leather: string;
    construction: string;
    sole: string;
    origin: string;
    last: string;
  };
  images: string[];
  finishes: ShoeFinish[];
  sizes: number[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  isBestSeller?: boolean;
  isNew?: boolean;
  stockCount: number;
  inStock?: boolean;
  tags: string[];
  threeModelConfig?: {
    upperColor: string;
    soleColor: string;
    roughness: number;
    metalness: number;
  };
}

export interface CartItem {
  id: string;
  product: Product;
  size: number;
  finish: ShoeFinish;
  quantity: number;
}

export interface FilterState {
  category: Category;
  gender: 'all' | 'men' | 'women';
  minPrice: number;
  maxPrice: number;
  sizes: number[];
  selectedFinishes: string[];
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
  searchQuery: string;
  viewMode: 'grid' | 'list';
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  dropShippingFee?: number;
  codFee?: number;
  total: number;
  totalCost?: number; // Sum of cost prices for profit analytics
  totalProfit?: number; // Total price - Total cost
  status: 'pending' | 'confirmed' | 'crafting' | 'quality_check' | 'dispatched' | 'handed_over' | 'delivered' | 'cancelled';
  trackingNumber: string;
  courierName?: string;
  expectedDeliveryDate?: string;
  deliveryTimeSlot?: string;
  deliveryNotes?: string;
  confirmedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: 'card' | 'cod' | 'wallet';
  estimatedDelivery: string;
}

export interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  tier: 'Patron' | 'Artisan Circle' | 'Connoisseur';
  points: number;
  savedAddresses: SavedAddress[];
  orders: Order[];
  wishlistIds: string[];
}
