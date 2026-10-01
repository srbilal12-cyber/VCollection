import React, { useState, useRef, useEffect } from 'react';
import {
  Package,
  Plus,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  Edit3,
  Trash2,
  Eye,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  X,
  RefreshCw,
  Tag,
  Layers,
  Award,
  ChevronDown,
  Upload,
  ImagePlus,
  Camera,
  Lock,
  Mail,
  Check,
  Loader2,
  Link as LinkIcon,
  Copy,
  ExternalLink,
  Send,
  Calendar,
  Palette,
  Percent,
  PlusCircle,
  Printer,
  FileText,
  Download,
  BarChart3,
  Receipt,
  Phone,
  QrCode
} from 'lucide-react';
import { Product, Order, Category, ShoeFinish } from '../types';
import { AUTHORIZED_OWNER_EMAIL } from './OwnerAuthModal';
import { optimizeImageFile, validateImageUrl } from '../utils/imageOptimizer';

export const POPULAR_FINISH_PRESETS: ShoeFinish[] = [
  { name: 'Nero Black', hex: '#111317', colorName: 'Black' },
  { name: 'Espresso Brown', hex: '#2b1b17', colorName: 'Espresso' },
  { name: 'Antiqued Cognac', hex: '#633517', colorName: 'Cognac' },
  { name: 'Oxblood Riserva', hex: '#4e1423', colorName: 'Burgundy' },
  { name: 'Tuscan Tan', hex: '#8c6239', colorName: 'Tan' },
  { name: 'Midnight Navy', hex: '#1a2436', colorName: 'Navy Blue' },
  { name: 'Racing Green Patina', hex: '#1c3329', colorName: 'Dark Green' },
  { name: 'Bordeaux Wine', hex: '#5b142b', colorName: 'Wine' },
  { name: 'Cigar Suede', hex: '#4a3728', colorName: 'Cigar' },
  { name: 'Slate Grey', hex: '#334155', colorName: 'Grey' },
];
import {
  getOwnerNotificationEmail,
  setOwnerNotificationEmail,
  generateOrderMailtoUrl,
  formatOrderEmailContent,
  getOrderEmailLogs,
  OrderEmailLog,
  DEFAULT_OWNER_EMAIL
} from '../utils/orderEmailService';

interface OwnerDashboardProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onResetProducts: () => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onUpdateOrderDetails?: (orderId: string, updates: Partial<Order>) => void;
  onViewProductStorefront: (product: Product) => void;
  onCloseOwnerPortal: () => void;
  theme: 'dark' | 'bright';
  ownerEmail?: string;
  isOwnerAuthenticated: boolean;
  onOpenAuthModal: () => void;
  onLogoutOwner: () => void;
}

const PRESET_IMAGES = [
  { label: 'Italian Horsebit Loafer (Studio)', url: '/src/assets/images/shoe_loafer_cognac_1790359108681.jpg' },
  { label: 'Italian Horsebit Loafer (3/4 Profile)', url: '/src/assets/images/loafer_quarter_view_1790360031084.jpg' },
  { label: 'Italian Horsebit Loafer (Side View)', url: '/src/assets/images/loafer_side_profile_1790360048340.jpg' },
  { label: 'Italian Horsebit Loafer (Top Down)', url: '/src/assets/images/loafer_top_down_1790360062870.jpg' },
  { label: 'The Sovereign Wholecut Oxford (Nero)', url: '/src/assets/images/shoe_oxford_nero_1790359094455.jpg' },
  { label: 'The Kensington Chelsea Boot (Suede)', url: '/src/assets/images/shoe_chelsea_boot_1790359121354.jpg' },
  { label: 'Master Heritage Cordwainer Silhouette', url: '/src/assets/images/hero_luxury_shoe_1790359076245.jpg' },
];

const PRESET_PRICES = [2850, 3900, 4950, 5900, 6450, 7850, 8500, 9500];

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  products,
  orders,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetProducts,
  onUpdateOrderStatus,
  onUpdateOrderDetails,
  onViewProductStorefront,
  onCloseOwnerPortal,
  theme,
  ownerEmail = '',
  isOwnerAuthenticated,
  onOpenAuthModal,
  onLogoutOwner,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics' | 'monthly-summary'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [quickPriceEditId, setQuickPriceEditId] = useState<string | null>(null);
  const [quickPriceValue, setQuickPriceValue] = useState<number>(5000);
  const [orderFilter, setOrderFilter] = useState<string>('all');

  // Monthly Accounting Statement Filters
  const [selectedSummaryMonth, setSelectedSummaryMonth] = useState<string>('all');
  const [summaryStatusFilter, setSummaryStatusFilter] = useState<'delivered' | 'all'>('delivered');

  // Form State for Adding / Editing Shoe
  const [formName, setFormName] = useState('');
  const [formCollection, setFormCollection] = useState('Italian Riviera');
  const [formCategory, setFormCategory] = useState<Category>('loafers');
  const [formGender, setFormGender] = useState<'men' | 'women' | 'unisex'>('men');
  const [formCostPrice, setFormCostPrice] = useState<number>(3500); // Kitnay ka aya (Wholesale/Production cost)
  const [formPrice, setFormPrice] = useState<number>(6450); // Sold kitnay ka krna ha
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(7500);
  const [formDescription, setFormDescription] = useState('');
  const [formStory, setFormStory] = useState('');
  const [formLeather, setFormLeather] = useState('Antiqued Tuscan Calfskin');
  const [formConstruction, setFormConstruction] = useState('Blake-Rapid Welt');
  const [formSole, setFormSole] = useState('Oak Bark Leather Sole');
  const [formOrigin, setFormOrigin] = useState('Florence, Italy');
  const [formLast, setFormLast] = useState('Sleek Almond Last');
  const [formImages, setFormImages] = useState<string[]>([PRESET_IMAGES[0].url]);
  const [formStock, setFormStock] = useState<number>(6);
  const [formTags, setFormTags] = useState('Loafers, Handcrafted, Tuscan Leather');
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);
  const [formIsNew, setFormIsNew] = useState(true);
  const [formSizes, setFormSizes] = useState<number[]>([39, 40, 41, 42, 43, 44, 45]);
  const [formFinishes, setFormFinishes] = useState<ShoeFinish[]>([
    { name: 'Nero Black', hex: '#111317', colorName: 'Black' },
    { name: 'Espresso Brown', hex: '#2b1b17', colorName: 'Espresso' },
    { name: 'Antiqued Cognac', hex: '#633517', colorName: 'Cognac' },
  ]);

  // Discount Management State
  const [formHasDiscount, setFormHasDiscount] = useState<boolean>(false);
  const [formDiscountPercent, setFormDiscountPercent] = useState<number>(20);
  const [formBasePrice, setFormBasePrice] = useState<number>(6450);

  // New Color Customization State
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#633517');
  const [newColorCategory, setNewColorCategory] = useState('Brown');

  // Shoe Deletion Modal State
  const [shoeToDelete, setShoeToDelete] = useState<Product | null>(null);

  // Gallery File Upload & Image Processing State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [isOptimizingImage, setIsOptimizingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Email Notification configuration state
  const [notificationEmail, setNotificationEmail] = useState<string>(getOwnerNotificationEmail());
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmailInput, setTempEmailInput] = useState(notificationEmail);
  const [emailLogs, setEmailLogs] = useState<OrderEmailLog[]>(getOrderEmailLogs());
  const [selectedLogForModal, setSelectedLogForModal] = useState<OrderEmailLog | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [emailSavedToast, setEmailSavedToast] = useState(false);

  // Delivery Schedule & Arrival Management State
  const [editingDeliveryOrderId, setEditingDeliveryOrderId] = useState<string | null>(null);
  const [tempDeliveryDate, setTempDeliveryDate] = useState<string>('');
  const [tempDeliveryTimeSlot, setTempDeliveryTimeSlot] = useState<string>('2:00 PM – 6:00 PM (Afternoon)');
  const [tempCourierName, setTempCourierName] = useState<string>('TCS Express Pakistan');
  const [tempTrackingNumber, setTempTrackingNumber] = useState<string>('');
  const [tempDeliveryNotes, setTempDeliveryNotes] = useState<string>('');
  const [deliverySavedId, setDeliverySavedId] = useState<string | null>(null);

  const handleOpenDeliveryEditor = (ord: Order) => {
    setEditingDeliveryOrderId(ord.id);
    setTempDeliveryDate(ord.expectedDeliveryDate || ord.estimatedDelivery || '');
    setTempDeliveryTimeSlot(ord.deliveryTimeSlot || '2:00 PM – 6:00 PM (Afternoon)');
    setTempCourierName(ord.courierName || 'TCS Express Pakistan');
    setTempTrackingNumber(ord.trackingNumber || '');
    setTempDeliveryNotes(ord.deliveryNotes || '');
  };

  const handleSaveDeliverySchedule = (orderId: string) => {
    const updates: Partial<Order> = {
      expectedDeliveryDate: tempDeliveryDate,
      estimatedDelivery: tempDeliveryDate,
      deliveryTimeSlot: tempDeliveryTimeSlot,
      courierName: tempCourierName,
      trackingNumber: tempTrackingNumber,
      deliveryNotes: tempDeliveryNotes,
    };
    if (onUpdateOrderDetails) {
      onUpdateOrderDetails(orderId, updates);
    }
    setDeliverySavedId(orderId);
    setTimeout(() => setDeliverySavedId(null), 3000);
    setEditingDeliveryOrderId(null);
  };

  const handleConfirmOrder = (orderId: string) => {
    const updates: Partial<Order> = {
      status: 'confirmed',
      confirmedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    if (onUpdateOrderDetails) {
      onUpdateOrderDetails(orderId, updates);
    } else {
      onUpdateOrderStatus(orderId, 'confirmed');
    }
  };

  // Refresh email logs when orders change or tab is clicked
  useEffect(() => {
    setEmailLogs(getOrderEmailLogs());
  }, [orders, activeTab]);

  // Check if owner email is authorized
  const isAuthorized = isOwnerAuthenticated && ownerEmail.toLowerCase() === AUTHORIZED_OWNER_EMAIL.toLowerCase();

  // Helper to compute wholesale / production cost of an order (Kitnay ka aya)
  const getOrderCost = (o: Order) => {
    if (typeof o.totalCost === 'number' && o.totalCost > 0) return o.totalCost;
    return o.items.reduce((sum, it) => {
      const unitCost = it.product.costPrice ?? Math.round(it.product.price * 0.55);
      return sum + unitCost * it.quantity;
    }, 0);
  };

  // Helper to compute profit of an order (Profit kitna aya)
  const getOrderProfit = (o: Order) => {
    if (typeof o.totalProfit === 'number' && o.totalProfit > 0) return o.totalProfit;
    const cost = getOrderCost(o);
    return Math.max(0, o.total - cost);
  };

  // Metrics: Total Price Box & Total Profit Box (separated as requested)
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalCost = orders.reduce((acc, o) => acc + getOrderCost(o), 0);
  const totalProfit = orders.reduce((acc, o) => acc + getOrderProfit(o), 0);
  const totalOrdersCount = orders.length;

  const deliveredOrdersList = orders.filter((o) => o.status === 'delivered');
  const deliveredOrders = deliveredOrdersList.length;
  const deliveredRevenue = deliveredOrdersList.reduce((acc, o) => acc + o.total, 0);
  const deliveredCost = deliveredOrdersList.reduce((acc, o) => acc + getOrderCost(o), 0);
  const deliveredProfit = deliveredOrdersList.reduce((acc, o) => acc + getOrderProfit(o), 0);

  const dispatchedOrders = orders.filter((o) => o.status === 'dispatched' || o.status === 'handed_over').length;
  const inProductionOrders = orders.filter((o) => o.status === 'crafting' || o.status === 'quality_check' || o.status === 'pending' || o.status === 'confirmed').length;
  const lowStockProducts = products.filter((p) => p.stockCount <= 3);
  const totalInventoryUnits = products.reduce((acc, p) => acc + p.stockCount, 0);
  const totalInventoryValuation = products.reduce((acc, p) => acc + (p.price * p.stockCount), 0);
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Monthly breakdown groups for Monthly Statement
  const availableMonths = Array.from(
    new Set(
      orders.map((o) => {
        if (!o.date) return '2026-10';
        return o.date.slice(0, 7);
      })
    )
  ).sort().reverse();
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  if (!availableMonths.includes(currentMonthKey)) {
    availableMonths.unshift(currentMonthKey);
  }

  // Filtered orders for Monthly Summary tab
  const monthlySummaryOrders = orders.filter((o) => {
    const orderMonth = o.date ? o.date.slice(0, 7) : currentMonthKey;
    const matchesMonth = selectedSummaryMonth === 'all' || orderMonth === selectedSummaryMonth;
    const matchesStatus = summaryStatusFilter === 'all' ? true : o.status === 'delivered';
    return matchesMonth && matchesStatus;
  });

  const monthlyTotalRevenue = monthlySummaryOrders.reduce((sum, o) => sum + o.total, 0);
  const monthlyTotalCost = monthlySummaryOrders.reduce((sum, o) => sum + getOrderCost(o), 0);
  const monthlyTotalProfit = monthlySummaryOrders.reduce((sum, o) => sum + getOrderProfit(o), 0);
  const monthlyProfitMargin = monthlyTotalRevenue > 0 ? Math.round((monthlyTotalProfit / monthlyTotalRevenue) * 100) : 0;

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q) ||
        p.details.leather.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  // Reset Add Form
  const resetForm = () => {
    setFormName('');
    setFormCollection('Italian Riviera');
    setFormCategory('loafers');
    setFormGender('men');
    setFormPrice(6450);
    setFormOriginalPrice(6450);
    setFormBasePrice(6450);
    setFormHasDiscount(false);
    setFormDiscountPercent(20);
    setFormDescription('Supple hand-patinated Italian leather loafer, designed with pure comfort and boardroom poise.');
    setFormStory('Handcrafted in our Tuscan atelier with continuous hand-stitching and cork footbed.');
    setFormLeather('Antiqued Tuscan Calfskin');
    setFormConstruction('Blake-Rapid Welt');
    setFormSole('Oak Bark-Tanned Leather Sole');
    setFormOrigin('Florence, Italy');
    setFormLast('Sleek Almond Last');
    setFormImages([PRESET_IMAGES[0].url]);
    setFormStock(6);
    setFormTags('Loafers, Handcrafted, Tuscan Leather');
    setFormIsBestSeller(false);
    setFormIsNew(true);
    setFormSizes([39, 40, 41, 42, 43, 44, 45]);
    setFormFinishes([
      { name: 'Nero Black', hex: '#111317', colorName: 'Black' },
      { name: 'Espresso Brown', hex: '#2b1b17', colorName: 'Espresso' },
      { name: 'Antiqued Cognac', hex: '#633517', colorName: 'Cognac' },
    ]);
    setUploadError(null);
    setUploadSuccessMsg(null);
    setImageUrlInput('');
  };

  // Open Edit Modal
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCollection(p.collection);
    setFormCategory(p.category);
    setFormGender(p.gender);
    
    const isDiscounted = !!p.hasDiscount || (!!p.originalPrice && p.originalPrice > p.price);
    setFormHasDiscount(isDiscounted);
    if (isDiscounted && p.originalPrice) {
      setFormBasePrice(p.originalPrice);
      setFormDiscountPercent(p.discountPercent || Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100));
    } else {
      setFormBasePrice(p.price);
      setFormDiscountPercent(20);
    }

    setFormPrice(p.price);
    setFormOriginalPrice(p.originalPrice || p.price);
    setFormDescription(p.description);
    setFormStory(p.story);
    setFormLeather(p.details.leather);
    setFormConstruction(p.details.construction);
    setFormSole(p.details.sole);
    setFormOrigin(p.details.origin);
    setFormLast(p.details.last);
    setFormImages(p.images.length > 0 ? [...p.images] : [PRESET_IMAGES[0].url]);
    setFormStock(p.stockCount);
    setFormTags(p.tags.join(', '));
    setFormIsBestSeller(!!p.isBestSeller);
    setFormIsNew(!!p.isNew);
    setFormSizes([...p.sizes]);
    setFormFinishes(p.finishes && p.finishes.length > 0 ? [...p.finishes] : [
      { name: 'Nero Black', hex: '#111317', colorName: 'Black' },
      { name: 'Espresso Brown', hex: '#2b1b17', colorName: 'Espresso' },
    ]);
    setUploadError(null);
    setUploadSuccessMsg(null);
    setImageUrlInput('');
  };

  // Process and optimize uploaded image files from gallery/disk
  const handleProcessFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setUploadError(null);
    setUploadSuccessMsg(null);
    setIsOptimizingImage(true);

    try {
      const optimizedUrls: string[] = [];
      for (const file of files) {
        try {
          const optimized = await optimizeImageFile(file, 1280, 1280, 0.85);
          optimizedUrls.push(optimized);
        } catch (err: any) {
          console.warn('File conversion issue', err);
          setUploadError(err?.message || 'Could not process one of the selected files.');
        }
      }

      if (optimizedUrls.length > 0) {
        setFormImages((prev) => {
          // If only the default preset is currently in form, replace it with user's picture!
          const isOnlyDefaultPreset =
            prev.length === 1 && PRESET_IMAGES.some((p) => p.url === prev[0]);
          if (isOnlyDefaultPreset) {
            return optimizedUrls;
          }
          return [...optimizedUrls, ...prev];
        });
        setUploadSuccessMsg(
          `Success: ${optimizedUrls.length} ${
            optimizedUrls.length === 1 ? 'picture' : 'pictures'
          } added from your device!`
        );
      }
    } catch (e: any) {
      setUploadError(e?.message || 'Error processing images from device');
    } finally {
      setIsOptimizingImage(false);
    }
  };

  // Handle Gallery Photo Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleProcessFiles(e.target.files);
    }
    e.target.value = '';
  };

  // Handle Drag & Drop of Image Files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  // Handle Adding Photo via direct URL
  const handleAddImageUrl = async () => {
    const url = imageUrlInput.trim();
    if (!url) return;

    setUploadError(null);
    setUploadSuccessMsg(null);
    setIsOptimizingImage(true);

    try {
      const isValid = await validateImageUrl(url);
      if (!isValid) {
        setUploadError('Unable to load picture from this web link. Please verify it is a direct image URL (ending in .jpg, .png, etc.) or accessible online.');
        setIsOptimizingImage(false);
        return;
      }

      setFormImages((prev) => {
        const isOnlyDefaultPreset =
          prev.length === 1 && PRESET_IMAGES.some((p) => p.url === prev[0]);
        if (isOnlyDefaultPreset) {
          return [url];
        }
        return [url, ...prev];
      });
      setImageUrlInput('');
      setUploadSuccessMsg('Success: Picture link attached to listing!');
    } catch {
      setUploadError('Failed to verify picture link.');
    } finally {
      setIsOptimizingImage(false);
    }
  };

  // Save new notification email
  const handleSaveNotificationEmail = () => {
    const clean = tempEmailInput.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    setOwnerNotificationEmail(clean);
    setNotificationEmail(clean);
    setIsEditingEmail(false);
    setEmailSavedToast(true);
    setTimeout(() => setEmailSavedToast(false), 3000);
  };

  // Remove an image from current form
  const handleRemoveImage = (indexToRemove: number) => {
    if (formImages.length <= 1) {
      setUploadError('At least one shoe picture is required.');
      return;
    }
    setFormImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Make an image primary (first)
  const handleMakePrimary = (indexToPrimary: number) => {
    setFormImages((prev) => {
      const selected = prev[indexToPrimary];
      const rest = prev.filter((_, idx) => idx !== indexToPrimary);
      return [selected, ...rest];
    });
  };

  // Handle Save Form (Add or Edit)
  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();

    // STRICT OWNER GMAIL VERIFICATION
    if (!isAuthorized) {
      alert(`Access Denied: Only ${AUTHORIZED_OWNER_EMAIL} is authorized to list footwear or edit specifications.`);
      return;
    }

    if (!formName.trim()) return;

    // Enforce base price and calculate discount if active
    const basePriceNum = Math.max(2500, Math.min(15000, Number(formBasePrice || formPrice)));
    let validPrice = basePriceNum;
    let validOrigPrice: number | undefined = undefined;
    let validDiscountPercent = 0;

    if (formHasDiscount && formDiscountPercent > 0) {
      validDiscountPercent = Math.min(90, Math.max(1, Number(formDiscountPercent)));
      validPrice = Math.round(basePriceNum * (1 - validDiscountPercent / 100));
      validOrigPrice = basePriceNum;
    } else {
      validPrice = basePriceNum;
      validOrigPrice = undefined;
      validDiscountPercent = 0;
    }

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const safeImages = formImages.length > 0 ? formImages : [PRESET_IMAGES[0].url];

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        name: formName.trim(),
        collection: formCollection,
        category: formCategory,
        gender: formGender,
        price: validPrice,
        costPrice: Math.max(500, Math.min(validPrice, Number(formCostPrice || 3500))),
        originalPrice: validOrigPrice,
        hasDiscount: formHasDiscount,
        discountPercent: validDiscountPercent,
        description: formDescription,
        story: formStory,
        details: {
          leather: formLeather,
          construction: formConstruction,
          sole: formSole,
          origin: formOrigin,
          last: formLast,
        },
        images: safeImages,
        stockCount: Number(formStock),
        tags: tagsArray,
        isBestSeller: formIsBestSeller,
        isNew: formIsNew,
        sizes: formSizes,
        finishes: formFinishes.length > 0 ? formFinishes : POPULAR_FINISH_PRESETS.slice(0, 3),
      };
      onUpdateProduct(updated);
      setEditingProduct(null);
      setIsAddModalOpen(false);
    } else {
      const newProduct: Product = {
        id: `prod-custom-${Date.now()}`,
        name: formName.trim(),
        collection: formCollection,
        category: formCategory,
        gender: formGender,
        price: validPrice,
        costPrice: Math.max(500, Math.min(validPrice, Number(formCostPrice || 3500))),
        originalPrice: validOrigPrice,
        hasDiscount: formHasDiscount,
        discountPercent: validDiscountPercent,
        description: formDescription,
        story: formStory,
        details: {
          leather: formLeather,
          construction: formConstruction,
          sole: formSole,
          origin: formOrigin,
          last: formLast,
        },
        images: safeImages,
        finishes: formFinishes.length > 0 ? formFinishes : POPULAR_FINISH_PRESETS.slice(0, 3),
        sizes: formSizes,
        rating: 5.0,
        reviewCount: 1,
        reviews: [
          {
            id: `rev-${Date.now()}`,
            author: 'Atelier Master Cordwainer',
            rating: 5,
            date: 'Listed today',
            title: 'Master Cordwainer Certified',
            comment: 'Artisanal commission verified by the master cordwainer. Outstanding hand-finish, balance, and arch fit.',
            verified: true,
            fit: 'True to Size',
          },
        ],
        isBestSeller: formIsBestSeller,
        isNew: formIsNew,
        stockCount: Number(formStock),
        tags: tagsArray,
        threeModelConfig: {
          upperColor: '#16181d',
          soleColor: '#3c2415',
          roughness: 0.28,
          metalness: 0.15,
        },
      };
      onAddProduct(newProduct);
      setIsAddModalOpen(false);
      resetForm();
    }
  };

  // Quick Price Update Handler
  const handleSaveQuickPrice = (productId: string) => {
    if (!isAuthorized) {
      alert(`Access Denied: Only ${AUTHORIZED_OWNER_EMAIL} can adjust prices.`);
      return;
    }
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const boundedPrice = Math.max(2500, Math.min(10000, Number(quickPriceValue)));
    const updated: Product = {
      ...prod,
      price: boundedPrice,
      originalPrice: prod.originalPrice && prod.originalPrice > boundedPrice ? prod.originalPrice : Math.round(boundedPrice * 1.15),
    };
    onUpdateProduct(updated);
    setQuickPriceEditId(null);
  };

  // Toggle Size in Form
  const toggleSize = (sz: number) => {
    if (formSizes.includes(sz)) {
      if (formSizes.length > 1) {
        setFormSizes(formSizes.filter((s) => s !== sz));
      }
    } else {
      setFormSizes([...formSizes, sz].sort((a, b) => a - b));
    }
  };

  // If NOT authorized owner, show strict lock screen
  if (!isAuthorized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-[#12151e] border border-gold-subtle rounded-2xl p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 gold-foil-line" />

          <div className="w-16 h-16 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
              Restricted Administrative Terminal
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#f9e7c4]">
              Owner Verification Required
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This terminal is confidential. Only the authorized atelier owner's Gmail (<strong className="text-white">{AUTHORIZED_OWNER_EMAIL}</strong>) has access to list footwear, select prices, and manage commissions.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 text-xs text-zinc-300 font-mono flex items-center justify-center gap-2">
            <Mail className="w-4 h-4 text-[#d4af37]" />
            <span>Authorized: {AUTHORIZED_OWNER_EMAIL}</span>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onOpenAuthModal}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8329] text-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify & Unlock Owner Portal</span>
            </button>

            <button
              onClick={onCloseOwnerPortal}
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs transition-colors"
            >
              Return to Public Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header / Atelier Owner Banner */}
      <div className="bg-[#12151e] border border-gold-subtle rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 inset-x-0 gold-foil-line" />
        
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Owner Management</span>
            </div>
            <span className="text-[10px] text-zinc-400">· Exclusive Listing Authority</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl text-[#f9e7c4] tracking-tight">
            Footwear Atelier Executive Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl font-light">
            You hold exclusive master administrative authority. Upload shoe photos from your <strong className="text-[#f5ebd7]">phone/device gallery</strong>, list new models, set prices between <strong className="text-[#f5ebd7]">Rs. 2,500 and Rs. 10,000 PKR</strong>, inspect inventory, and progress client commissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8329] text-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>List New Shoe</span>
          </button>

          <button
            onClick={onCloseOwnerPortal}
            className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>View Client Storefront</span>
          </button>

          <button
            onClick={onLogoutOwner}
            className="px-3 py-3 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 text-xs transition-colors"
            title="Lock Owner Portal"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Primary Financial & Accounting Cards (Total Price Box & Total Profit Box separated) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Box 1: Total Gross Income / Price Box */}
        <div className="bg-[#12151e] border border-gold-subtle/50 rounded-2xl p-5 sm:p-6 space-y-2 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold">
              Total Gross Income (Total Price)
            </span>
            <DollarSign className="w-4 h-4 text-[#d4af37]" />
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#f9e7c4] tabular-nums">
            Rs. {totalRevenue.toLocaleString()}
          </h3>
          <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Across all {totalOrdersCount} patron orders</span>
          </p>
        </div>

        {/* Box 2: Total Net Profit Box */}
        <div className="bg-gradient-to-br from-[#12151e] to-emerald-950/20 border border-emerald-500/40 rounded-2xl p-5 sm:p-6 space-y-2 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-emerald-300">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold">
              Total Net Profit (Profit Box)
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums">
            +Rs. {totalProfit.toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-300/80 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Pure atelier profit after shoe costs</span>
          </p>
        </div>

        {/* Box 3: Total Wholesale / Production Cost (Kitnay ka aya) */}
        <div className="bg-[#12151e] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold">
              Shoe Production Cost (Kitnay Ka Aya)
            </span>
            <Layers className="w-4 h-4 text-zinc-400" />
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tabular-nums">
            Rs. {totalCost.toLocaleString()}
          </h3>
          <p className="text-[11px] text-zinc-400">
            Wholesale leather & craftsmanship cost
          </p>
        </div>

        {/* Box 4: Delivered Orders & Settle Value */}
        <div className="bg-[#12151e] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold">
              Delivered Orders Settled
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#f5ebd7] tabular-nums">
            {deliveredOrders} <span className="text-base text-zinc-400 font-sans font-normal">Delivered</span>
          </h3>
          <p className="text-[11px] text-emerald-400 font-medium">
            Rs. {deliveredRevenue.toLocaleString()} collected revenue
          </p>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'products'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Shoe Catalog & Pricing</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'products' ? 'bg-black/20 text-black' : 'bg-white/10 text-zinc-300'}`}>
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'orders'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Client Orders & Pipeline</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'orders' ? 'bg-black/20 text-black' : 'bg-white/10 text-zinc-300'}`}>
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('monthly-summary')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'monthly-summary'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Monthly Statement & Print</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'monthly-summary' ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-300'}`}>
              Print
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'analytics'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Atelier Financials</span>
          </button>
        </div>

        {activeTab === 'products' && (
          <button
            onClick={() => {
              if (confirm('Restore default heritage collection catalog (8 classic Italian shoe models)?')) {
                onResetProducts();
              }
            }}
            className="text-xs text-zinc-400 hover:text-[#d4af37] flex items-center gap-1.5 transition-colors"
            title="Reset catalog to curated default models"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restore Atelier Presets</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          TAB 1: PRODUCT CATALOG & PRICE SELECTION
          ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          
          {/* Quick Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#10131b] p-4 rounded-2xl border border-white/10">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog by shoe model, leather, collection, or tag..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {(['all', 'loafers', 'formal', 'boots', 'casual', 'bespoke'] as Category[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider capitalize whitespace-nowrap transition-colors ${
                    filterCategory === cat
                      ? 'bg-[#d4af37] text-black font-semibold'
                      : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Table / Management Cards */}
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((p) => {
              const isEditingPrice = quickPriceEditId === p.id;
              const isOutOfStock = p.stockCount === 0 || p.inStock === false;

              return (
                <div
                  key={p.id}
                  className={`bg-[#12151e] border rounded-2xl p-4 sm:p-5 transition-all shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
                    isOutOfStock ? 'border-rose-900/40 bg-gradient-to-r from-[#141215] to-[#12151e]' : 'border-white/10 hover:border-gold-subtle/50'
                  }`}
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className={`w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-black/40 border border-white/10 ${
                          isOutOfStock ? 'opacity-60 grayscale-[30%]' : ''
                        }`}
                      />
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center p-1 text-center">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-rose-300">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-[#d4af37] font-semibold">
                          {p.collection} · {p.category}
                        </span>
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-bold uppercase tracking-wider animate-pulse">
                            Out of Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-wider">
                            In Stock ({p.stockCount} pairs)
                          </span>
                        )}
                        {p.isBestSeller && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold uppercase tracking-wider">
                            Best Seller
                          </span>
                        )}
                        {p.isNew && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-wider">
                            New Arrival
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-lg sm:text-xl text-[#f5ebd7] font-medium truncate">
                        {p.name}
                      </h3>

                      <p className="text-xs text-zinc-400 truncate max-w-xl">
                        {p.details.leather} · {p.details.construction} · {p.details.origin}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1">
                        <span>Sizes: {p.sizes.join(', ')}</span>
                        <span>·</span>
                        <span className={isOutOfStock ? 'text-rose-400 font-bold' : p.stockCount <= 3 ? 'text-amber-400 font-semibold' : 'text-zinc-300'}>
                          {isOutOfStock ? 'Status: Out of Stock' : `Stock: ${p.stockCount} pairs`}
                        </span>
                        <span>·</span>
                        <div className="flex items-center gap-1">
                          {p.finishes.map((f) => (
                            <span
                              key={f.name}
                              className="w-2.5 h-2.5 rounded-full border border-white/20 inline-block"
                              style={{ backgroundColor: f.hex }}
                              title={f.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price Control & Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10">
                    
                    {/* Price Controller Module */}
                    <div className="bg-[#171b26] border border-gold-subtle/40 rounded-xl p-3 min-w-[220px]">
                      {isEditingPrice ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400">Set Price (PKR):</span>
                            <span className="text-[#f9e7c4] font-bold font-mono">
                              Rs. {quickPriceValue.toLocaleString()}
                            </span>
                          </div>
                          
                          <input
                            type="range"
                            min="2500"
                            max="10000"
                            step="100"
                            value={quickPriceValue}
                            onChange={(e) => setQuickPriceValue(Number(e.target.value))}
                            className="w-full accent-[#d4af37] bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                          />

                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="2500"
                              max="10000"
                              step="50"
                              value={quickPriceValue}
                              onChange={(e) => setQuickPriceValue(Number(e.target.value))}
                              className="w-24 px-2 py-1 bg-black/60 border border-white/20 rounded text-xs text-white font-mono"
                            />
                            <button
                              onClick={() => handleSaveQuickPrice(p.id)}
                              className="px-2.5 py-1 rounded bg-[#d4af37] text-black text-xs font-bold hover:brightness-110"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setQuickPriceEditId(null)}
                              className="px-2 py-1 rounded bg-white/10 text-zinc-300 text-xs hover:bg-white/20"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-semibold">
                              Selling Price (Sold Kitnay Ka Krna Ha)
                            </span>
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="font-serif text-xl sm:text-2xl text-[#f9e7c4] font-semibold tabular-nums">
                                Rs. {p.price.toLocaleString()}
                              </span>
                              {p.originalPrice && p.originalPrice > p.price && (
                                <>
                                  <span className="text-xs text-zinc-500 line-through tabular-nums">
                                    Rs. {p.originalPrice.toLocaleString()}
                                  </span>
                                  <span className="text-[10px] font-bold text-black bg-[#d4af37] px-2 py-0.5 rounded shadow-sm">
                                    {p.discountPercent || Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% OFF
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Cost Price & Profit Badges (Kitnay ka aya & Profit kitna aya) */}
                            {(() => {
                              const shoeCost = p.costPrice || Math.round(p.price * 0.55);
                              const shoeProfit = Math.max(0, p.price - shoeCost);
                              const shoeMargin = Math.round((shoeProfit / p.price) * 100);
                              return (
                                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                  <span className="px-2 py-0.5 rounded bg-zinc-800/80 border border-white/10 text-zinc-300 text-[10px] font-mono">
                                    Cost: Rs. {shoeCost.toLocaleString()}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                                    Profit: +Rs. {shoeProfit.toLocaleString()} ({shoeMargin}%)
                                  </span>
                                  {p.hasDiscount && (
                                    <span className="px-1.5 py-0.5 rounded bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] text-[9px] font-semibold uppercase">
                                      {p.discountPercent}% Discount
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </div>

                          <button
                            onClick={() => {
                              setQuickPriceEditId(p.id);
                              setQuickPriceValue(p.price);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-xs font-semibold hover:bg-[#d4af37] hover:text-black transition-colors"
                            title="Tweak shoe price"
                          >
                            Tweak Price
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Stock Quick Stepper & Direct Out of Stock / In Stock Toggle */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="flex items-center justify-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10">
                        <button
                          onClick={() => {
                            const newCount = Math.max(0, p.stockCount - 1);
                            onUpdateProduct({ ...p, stockCount: newCount, inStock: newCount > 0 });
                          }}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center justify-center text-sm font-bold"
                          title="Reduce stock"
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-xs font-mono font-semibold text-white">
                          {p.stockCount}
                        </span>
                        <button
                          onClick={() => {
                            const newCount = p.stockCount + 1;
                            onUpdateProduct({ ...p, stockCount: newCount, inStock: true });
                          }}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center justify-center text-sm font-bold"
                          title="Increase stock"
                        >
                          +
                        </button>
                      </div>

                      {/* 1-Click Out of Stock / In Stock Toggle Button */}
                      {isOutOfStock ? (
                        <button
                          onClick={() => onUpdateProduct({ ...p, stockCount: 10, inStock: true })}
                          className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm whitespace-nowrap"
                          title="Restock shoe and make available"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark In Stock</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateProduct({ ...p, stockCount: 0, inStock: false })}
                          className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm whitespace-nowrap"
                          title="Mark this shoe as out of stock on storefront"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Mark Out of Stock</span>
                        </button>
                      )}
                    </div>

                    {/* Action Buttons: Edit, View Storefront, Delete Shoe */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                        title="Edit shoe details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onViewProductStorefront(p)}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                        title="Inspect on live store"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setShoeToDelete(p)}
                        className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm"
                        title="Permanently remove shoe from store"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Shoe</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 bg-[#12151e] rounded-2xl border border-white/10 p-8 space-y-3">
                <Package className="w-12 h-12 text-zinc-600 mx-auto" />
                <h3 className="font-serif text-lg text-white">No footwear found matching criteria</h3>
                <p className="text-xs text-zinc-400">
                  Try adjusting your search query or category filter.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCategory('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#d4af37] text-black text-xs font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CLIENT ORDERS & CORDWAINER PIPELINE
          ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* OWNER ORDER EMAIL ALERTS SYSTEM PANEL */}
          <div className="bg-gradient-to-r from-[#171b26] via-[#141824] to-[#10131d] border border-[#d4af37]/30 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center shrink-0 shadow-inner">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-serif text-base text-[#f5ebd7] font-bold">
                      Owner Order Email Notification System
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active Dispatch
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Whenever any customer orders footwear, an automated order notification with full customer contact, delivery address, and shoes ordered is routed to:
                  </p>
                </div>
              </div>

              {/* Notification Email Box & Controls */}
              <div className="bg-black/50 border border-white/10 rounded-xl p-3 flex items-center gap-3 shrink-0">
                {!isEditingEmail ? (
                  <>
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                        Alert Recipient Mail:
                      </span>
                      <strong className="text-xs text-[#f9e7c4] font-mono block">
                        {notificationEmail}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTempEmailInput(notificationEmail);
                        setIsEditingEmail(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white text-[11px] font-medium transition-colors"
                    >
                      Change Mail
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={tempEmailInput}
                      onChange={(e) => setTempEmailInput(e.target.value)}
                      placeholder="owner@gmail.com"
                      className="px-2.5 py-1.5 rounded-lg bg-black border border-[#d4af37] text-xs text-white font-mono outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveNotificationEmail}
                      className="px-3 py-1.5 rounded-lg bg-[#d4af37] text-black font-semibold text-xs transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(false)}
                      className="px-2 py-1.5 rounded-lg bg-white/10 text-zinc-400 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Email notification status bar */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
                  Authorized Director Email: <strong className="text-zinc-200 font-mono">{AUTHORIZED_OWNER_EMAIL}</strong>
                </span>
                <span className="hidden sm:inline">|</span>
                <span>
                  Dispatched Order Logs: <strong className="text-white font-mono">{emailLogs.length}</strong>
                </span>
              </div>

              {emailSavedToast && (
                <span className="text-[11px] text-emerald-400 font-medium animate-in fade-in">
                  Notification email updated successfully!
                </span>
              )}
            </div>
          </div>

          {/* ORDER KPI METRICS */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-[#12151e] border border-white/10 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-semibold">Total Orders</span>
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-2xl font-bold text-white tabular-nums">{orders.length}</span>
                <span className="text-[10px] text-zinc-400">All Time</span>
              </div>
            </div>

            <div className={`bg-[#12151e] border rounded-xl p-3.5 space-y-1 transition-all ${
              orders.filter((o) => o.status === 'pending').length > 0
                ? 'border-amber-500/60 bg-gradient-to-b from-amber-500/10 to-[#12151e] shadow-lg shadow-amber-500/10'
                : 'border-white/10'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-amber-300 block font-semibold">
                  Pending Orders
                </span>
                {orders.filter((o) => o.status === 'pending').length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-2xl font-bold text-amber-300 tabular-nums">
                  {orders.filter((o) => o.status === 'pending').length}
                </span>
                <span className="text-[10px] text-amber-400/90 font-medium">Require Confirm</span>
              </div>
            </div>

            <div className="bg-[#12151e] border border-emerald-500/30 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 block font-semibold">Confirmed Orders</span>
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-2xl font-bold text-emerald-300 tabular-nums">
                  {orders.filter((o) => o.status === 'confirmed').length}
                </span>
                <span className="text-[10px] text-emerald-400/80 font-medium">Approved by You</span>
              </div>
            </div>

            <div className="bg-[#12151e] border border-blue-500/30 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-blue-400 block font-semibold">En Route (Dispatched)</span>
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-2xl font-bold text-blue-300 tabular-nums">
                  {orders.filter((o) => o.status === 'dispatched').length}
                </span>
                <span className="text-[10px] text-blue-400/80 font-medium">With Courier</span>
              </div>
            </div>

            <div className="bg-[#12151e] border border-purple-500/30 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-purple-400 block font-semibold">Delivered</span>
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-2xl font-bold text-purple-300 tabular-nums">
                  {orders.filter((o) => o.status === 'delivered').length}
                </span>
                <span className="text-[10px] text-purple-400/80 font-medium">Completed</span>
              </div>
            </div>
          </div>

          {/* Order Status Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#10131b] p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mr-1">
                Filter Stage:
              </span>
              {[
                { id: 'all', label: `All Orders (${orders.length})` },
                {
                  id: 'pending',
                  label: `🔔 Pending Review (${orders.filter((o) => o.status === 'pending').length})`,
                  highlight: orders.filter((o) => o.status === 'pending').length > 0,
                },
                { id: 'confirmed', label: `✅ Confirmed (${orders.filter((o) => o.status === 'confirmed').length})` },
                { id: 'dispatched', label: `🚚 In Transit (${orders.filter((o) => o.status === 'dispatched').length})` },
                { id: 'handed_over', label: `🤝 Handed Over (${orders.filter((o) => o.status === 'handed_over').length})` },
                { id: 'delivered', label: `📦 Delivered (${orders.filter((o) => o.status === 'delivered').length})` },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setOrderFilter(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    orderFilter === st.id
                      ? 'bg-[#d4af37] text-black font-semibold shadow'
                      : st.highlight
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                  }`}
                >
                  <span>{st.label}</span>
                </button>
              ))}
            </div>

            <div className="text-xs text-zinc-400">
              Showing: <strong className="text-white">{filteredOrders.length} commissions</strong>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.map((ord) => {
              const ordCost = getOrderCost(ord);
              const ordProfit = getOrderProfit(ord);

              return (
              <div
                key={ord.id}
                className="bg-[#12151e] border border-white/10 hover:border-gold-subtle/50 rounded-2xl p-5 transition-all shadow-md space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm font-bold text-[#f9e7c4]">
                        Order #{ord.id}
                      </span>
                      <span className="text-xs text-zinc-400">
                        Date: {ord.date}
                      </span>
                      <span className="text-xs text-[#d4af37] font-mono">
                        {ord.trackingNumber}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-300">
                      <strong>Client:</strong> {ord.shippingAddress.fullName} · {ord.shippingAddress.phone} · {ord.shippingAddress.email}
                    </div>

                    <div className="text-xs text-zinc-400">
                      <strong>Destination:</strong> {ord.shippingAddress.street}, {ord.shippingAddress.city}, {ord.shippingAddress.country}
                    </div>

                    {/* Order Financial Breakdown (Sold Price, Cost Price, Net Profit) */}
                    <div className="flex items-center gap-2 flex-wrap pt-1 text-xs font-mono">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-[#f5ebd7] font-semibold border border-white/10">
                        Total Price: Rs. {ord.total.toLocaleString()}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-black/50 text-zinc-400 border border-white/5">
                        Cost (Kitnay Ka Aya): Rs. {ordCost.toLocaleString()}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                        Net Profit: +Rs. {ordProfit.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Stage Dropdown & Quick Confirm Button for Owner */}
                  <div className="flex flex-wrap items-center sm:items-end gap-2.5 shrink-0">
                    {ord.status === 'pending' ? (
                      <button
                        type="button"
                        onClick={() => handleConfirmOrder(ord.id)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:brightness-110 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg active:scale-95 animate-pulse"
                      >
                        <CheckCircle2 className="w-4 h-4 text-black" />
                        <span>✓ Confirm Order</span>
                      </button>
                    ) : ord.status === 'confirmed' ? (
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Order Confirmed ✅</span>
                      </div>
                    ) : (
                      <div className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium flex items-center gap-1">
                        <span>Status: <strong className="text-white uppercase">{ord.status}</strong></span>
                      </div>
                    )}

                    <div className="flex flex-col sm:items-end gap-1">
                      <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                        Stage:
                      </label>
                      <select
                        value={ord.status}
                        onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as Order['status'])}
                        className="px-3 py-2 rounded-xl bg-black/50 border border-gold-subtle text-xs font-semibold text-[#f9e7c4] focus:outline-none focus:ring-1 focus:ring-[#d4af37] cursor-pointer"
                      >
                        <option value="pending">🟡 1. Pending Review</option>
                        <option value="confirmed">🟢 2. Order Confirmed</option>
                        <option value="crafting">📦 3. Packaging & Prep</option>
                        <option value="dispatched">🚚 4. Dispatched via Courier</option>
                        <option value="handed_over">🤝 5. Handed Over (Out for Delivery)</option>
                        <option value="delivered">🎉 6. Delivered to Customer</option>
                        <option value="cancelled">❌ Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {ord.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center gap-3 bg-black/30 p-2.5 rounded-xl border border-white/5"
                    >
                      <img
                        src={it.product.images[0]}
                        alt={it.product.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 object-cover rounded-lg bg-zinc-900 border border-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-white truncate">
                          {it.product.name}
                        </h4>
                        <span className="text-[11px] text-zinc-400 block">
                          EU {it.size} · {it.finish.colorName} · Qty: {it.quantity}
                        </span>
                        <span className="text-xs font-mono font-semibold text-[#f9e7c4] block">
                          Rs. {(it.product.price * it.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* OWNER DELIVERY SCHEDULE & CUSTOMER ARRIVAL ACCESS PANEL (KAB DELIVER HO GA AUR KAB POHANCHAY GA) */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#171b26] to-[#12151e] border border-[#d4af37]/35 space-y-3 shadow-inner">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#d4af37]" />
                      <div>
                        <span className="text-xs font-serif font-bold text-[#f5ebd7] block">
                          Delivery Schedule & Customer Arrival Access
                        </span>
                        <span className="text-[10px] text-zinc-400 block">
                          Set when this order reaches the customer so they can track it live
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (editingDeliveryOrderId === ord.id) {
                            setEditingDeliveryOrderId(null);
                          } else {
                            handleOpenDeliveryEditor(ord);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37] text-[#d4af37] hover:text-black font-semibold text-[11px] transition-all flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{editingDeliveryOrderId === ord.id ? 'Close Editor' : 'Edit Arrival Date & Courier'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Active Schedule Overview (Visible to Owner & matches what Customer sees) */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 space-y-0.5">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Customer Arrival Date:</span>
                      <strong className="text-[#f9e7c4] font-mono text-xs block">
                        {ord.expectedDeliveryDate || ord.estimatedDelivery || 'Pending Store Confirmation'}
                      </strong>
                    </div>

                    <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 space-y-0.5">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Arrival Time Window:</span>
                      <strong className="text-white text-xs block">
                        {ord.deliveryTimeSlot || '2:00 PM – 6:00 PM (Afternoon)'}
                      </strong>
                    </div>

                    <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 space-y-0.5">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Courier & Tracking:</span>
                      <strong className="text-zinc-200 text-xs block truncate">
                        {ord.courierName || 'TCS Express Pakistan'} · <span className="font-mono text-[#d4af37]">{ord.trackingNumber}</span>
                      </strong>
                    </div>

                    <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 space-y-0.5">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Client Live Status:</span>
                      <strong className={`text-xs flex items-center gap-1 ${ord.status === 'pending' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {ord.status === 'pending' ? (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            <span>🟡 Awaiting Confirm</span>
                          </>
                        ) : ord.status === 'confirmed' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>✓ Confirmed</span>
                          </>
                        ) : (
                          <>
                            <Truck className="w-3.5 h-3.5" />
                            <span>{ord.status.toUpperCase()}</span>
                          </>
                        )}
                      </strong>
                    </div>
                  </div>

                  {ord.deliveryNotes && (
                    <div className="text-[11px] text-zinc-300 bg-black/30 p-2.5 rounded-lg border border-white/5">
                      <strong className="text-zinc-400">Note for Customer:</strong> {ord.deliveryNotes}
                    </div>
                  )}

                  {/* Inline Delivery Editor (when active) */}
                  {editingDeliveryOrderId === ord.id && (
                    <div className="mt-3 p-4 bg-black/70 border border-[#d4af37]/40 rounded-xl space-y-3 animate-in fade-in">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-[11px] uppercase tracking-wider text-[#d4af37] font-semibold">
                          Set Exact Arrival Date & Time for Customer:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              const d = new Date();
                              d.setDate(d.getDate() + 1);
                              setTempDeliveryDate(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
                            }}
                            className="px-2 py-0.5 rounded bg-white/10 hover:bg-[#d4af37] hover:text-black text-[10px] text-zinc-300"
                          >
                            +1 Day (Tomorrow)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const d = new Date();
                              d.setDate(d.getDate() + 2);
                              setTempDeliveryDate(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
                            }}
                            className="px-2 py-0.5 rounded bg-white/10 hover:bg-[#d4af37] hover:text-black text-[10px] text-zinc-300"
                          >
                            +2 Days (Express)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const d = new Date();
                              d.setDate(d.getDate() + 3);
                              setTempDeliveryDate(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
                            }}
                            className="px-2 py-0.5 rounded bg-white/10 hover:bg-[#d4af37] hover:text-black text-[10px] text-zinc-300"
                          >
                            +3 Days (Standard)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const d = new Date();
                              d.setDate(d.getDate() + 5);
                              setTempDeliveryDate(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
                            }}
                            className="px-2 py-0.5 rounded bg-white/10 hover:bg-[#d4af37] hover:text-black text-[10px] text-zinc-300"
                          >
                            +5 Days
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-400 block font-semibold">
                            Arrival Date:
                          </label>
                          <input
                            type="text"
                            value={tempDeliveryDate}
                            onChange={(e) => setTempDeliveryDate(e.target.value)}
                            placeholder="e.g. Wednesday, Oct 02, 2026"
                            className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white font-mono outline-none focus:border-[#d4af37]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-400 block font-semibold">
                            Arrival Time Window:
                          </label>
                          <select
                            value={tempDeliveryTimeSlot}
                            onChange={(e) => setTempDeliveryTimeSlot(e.target.value)}
                            className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white outline-none focus:border-[#d4af37]"
                          >
                            <option value="Morning (10:00 AM – 1:00 PM)">Morning (10:00 AM – 1:00 PM)</option>
                            <option value="Afternoon (2:00 PM – 6:00 PM)">Afternoon (2:00 PM – 6:00 PM)</option>
                            <option value="Evening (6:00 PM – 9:00 PM)">Evening (6:00 PM – 9:00 PM)</option>
                            <option value="Anytime (9:00 AM – 8:00 PM)">Anytime (9:00 AM – 8:00 PM)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-400 block font-semibold">Courier Partner:</label>
                          <select
                            value={tempCourierName}
                            onChange={(e) => setTempCourierName(e.target.value)}
                            className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white outline-none focus:border-[#d4af37]"
                          >
                            <option value="TCS Express Pakistan">TCS Express Pakistan</option>
                            <option value="Trax Logistics">Trax Logistics</option>
                            <option value="Leopards Courier">Leopards Courier</option>
                            <option value="Call Courier">Call Courier</option>
                            <option value="M&P Express">M&P Express</option>
                            <option value="Atelier White-Glove VIP Rider">Atelier White-Glove VIP Rider</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-400 block font-semibold">Tracking Number:</label>
                          <input
                            type="text"
                            value={tempTrackingNumber}
                            onChange={(e) => setTempTrackingNumber(e.target.value)}
                            placeholder="TCS-PK-..."
                            className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white font-mono outline-none focus:border-[#d4af37]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 block font-semibold">
                          Delivery Note to Customer (Visible on customer tracking):
                        </label>
                        <input
                          type="text"
                          value={tempDeliveryNotes}
                          onChange={(e) => setTempDeliveryNotes(e.target.value)}
                          placeholder="e.g. Rider will deliver tomorrow afternoon, please keep Rs. 6,750 ready in cash."
                          className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white outline-none focus:border-[#d4af37]"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-zinc-400">
                          Saves directly to customer order record & live tracker
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingDeliveryOrderId(null)}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveDeliverySchedule(ord.id)}
                            className="px-4 py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#e2c158] text-black font-bold text-xs uppercase tracking-wider shadow"
                          >
                            Save Schedule & Update Client Tracker
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {deliverySavedId === ord.id && (
                    <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Delivery schedule updated! Client tracker will show new arrival date.</span>
                    </div>
                  )}
                </div>

                {/* Order Email Alert Status & Actions */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Mail className="w-4 h-4 text-[#d4af37]" />
                    <span>
                      Alert Routed to: <strong className="text-[#f9e7c4] font-mono">{notificationEmail}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={generateOrderMailtoUrl(ord, notificationEmail)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37] text-[#d4af37] hover:text-black font-semibold text-[11px] transition-all flex items-center gap-1.5"
                      title="Open pre-composed order notification in Gmail or mail app"
                    >
                      <Send className="w-3 h-3" />
                      <span>Open in Mail</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        const { body } = formatOrderEmailContent(ord, notificationEmail);
                        navigator.clipboard.writeText(body);
                        setCopiedOrderId(ord.id);
                        setTimeout(() => setCopiedOrderId(null), 2500);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white text-[11px] font-medium transition-colors flex items-center gap-1.5"
                    >
                      {copiedOrderId === ord.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Invoice</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer breakdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-2 border-t border-white/5">
                  <div className="space-y-0.5">
                    <div className="text-zinc-400">
                      Payment Method:{' '}
                      <strong className="text-white uppercase">{ord.paymentMethod}</strong>
                      {ord.paymentMethod === 'cod' && (
                        <span className="ml-2 text-[#d4af37] bg-[#d4af37]/10 px-1.5 py-0.5 rounded text-[10px] font-mono">
                          +Rs. {ord.codFee ?? 100} COD Fee
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Drop Shipping Logistics: <span className="font-mono text-zinc-200">Rs. {ord.dropShippingFee ?? 200}</span>
                      {ord.discount > 0 && (
                        <span className="ml-2 text-emerald-400 font-mono">
                          Discount: -Rs. {ord.discount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-400 mr-2">Total Collection:</span>
                    <strong className="text-base text-[#f9e7c4] font-serif tabular-nums font-bold">
                      Rs. {ord.total.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="text-center py-16 bg-[#12151e] rounded-2xl border border-white/10 p-8 space-y-3">
                <Clock className="w-12 h-12 text-zinc-600 mx-auto" />
                <h3 className="font-serif text-lg text-white">No commissions found in this stage</h3>
                <p className="text-xs text-zinc-400">
                  New commissions placed by clients through the checkout will automatically register here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: ATELIER FINANCIALS & ANALYTICS
          ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-[#12151e] border border-gold-subtle/40 rounded-2xl p-6 space-y-2">
              <span className="text-xs uppercase tracking-wider text-zinc-400 block">
                Total Gross Revenue
              </span>
              <h3 className="font-serif text-3xl text-[#f9e7c4] font-bold tabular-nums">
                Rs. {totalRevenue.toLocaleString()}
              </h3>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Across {totalOrdersCount} patron commissions</span>
              </p>
            </div>

            <div className="bg-[#12151e] border border-white/10 rounded-2xl p-6 space-y-2">
              <span className="text-xs uppercase tracking-wider text-zinc-400 block">
                Inventory Valuation
              </span>
              <h3 className="font-serif text-3xl text-white font-bold tabular-nums">
                Rs. {totalInventoryValuation.toLocaleString()}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {totalInventoryUnits} finished pairs in atelier stock
              </p>
            </div>

            <div className="bg-[#12151e] border border-white/10 rounded-2xl p-6 space-y-2">
              <span className="text-xs uppercase tracking-wider text-zinc-400 block">
                Average Order Value (AOV)
              </span>
              <h3 className="font-serif text-3xl text-[#f5ebd7] font-bold tabular-nums">
                Rs. {averageOrderValue.toLocaleString()}
              </h3>
              <p className="text-[11px] text-[#c5a880]">
                Within PKR 2,500 – 10,000 threshold
              </p>
            </div>

            <div className="bg-[#12151e] border border-white/10 rounded-2xl p-6 space-y-2">
              <span className="text-xs uppercase tracking-wider text-zinc-400 block">
                In-Production Commissions
              </span>
              <h3 className="font-serif text-3xl text-amber-300 font-bold tabular-nums">
                {inProductionOrders}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {dispatchedOrders} in courier transit · {deliveredOrders} delivered
              </p>
            </div>

          </div>

          {/* Low Stock Warning Panel */}
          {lowStockProducts.length > 0 && (
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Atelier Low-Stock Warning ({lowStockProducts.length} shoe models need cordwaining)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-black/40 rounded-xl border border-amber-500/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 object-cover rounded-lg bg-zinc-900"
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-white truncate max-w-[150px]">
                          {p.name}
                        </h4>
                        <span className="text-[11px] text-amber-300">
                          Only {p.stockCount} pairs left
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onUpdateProduct({ ...p, stockCount: p.stockCount + 5 });
                      }}
                      className="px-2.5 py-1 rounded bg-amber-400 text-black text-xs font-bold hover:brightness-110"
                    >
                      +5 Restock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Policy Card */}
          <div className="bg-[#10131b] border border-gold-subtle rounded-2xl p-6 space-y-3">
            <h4 className="font-serif text-lg text-[#f9e7c4] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#d4af37]" />
              <span>Atelier Pricing Compliance</span>
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Every shoe in V Collection is strictly cataloged between <strong className="text-white">Rs. 2,500 and Rs. 10,000 PKR</strong>. As the owner (<strong className="text-[#f9e7c4]">{AUTHORIZED_OWNER_EMAIL}</strong>), whenever you create a new shoe or adjust an existing model, the system automatically validates the price against this range.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: MONTHLY ACCOUNTING, DELIVERY & PROFIT PRINTABLE STATEMENT
          ========================================================================= */}
      {activeTab === 'monthly-summary' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header & Controls Bar */}
          <div className="bg-[#12151e] border border-gold-subtle rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] text-[10px] font-bold uppercase tracking-wider">
                  Executive Financial Ledger
                </span>
                <span className="text-[10px] text-zinc-400">· Monthly Audit & Reconciliation</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#f9e7c4]">
                Monthly Financial & Delivery Statement
              </h2>
              <p className="text-xs text-zinc-400 max-w-2xl font-light">
                Inspect which orders were delivered, total gross income collected, production costs, and pure net profit. Click <strong className="text-white">Print Monthly Summary</strong> to generate an official hard-copy audit or save as PDF.
              </p>
            </div>

            {/* Print Action & Filters */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-amber-400 to-[#aa8329] text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-xl"
              >
                <Printer className="w-4 h-4 text-black" />
                <span>Print Monthly Summary (PDF)</span>
              </button>
            </div>
          </div>

          {/* Filters Bar: Month Selector & Status Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#10131b] p-4 rounded-2xl border border-white/10 no-print">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#d4af37]" />
                <span className="text-xs uppercase tracking-wider text-zinc-300 font-semibold">
                  Statement Billing Month:
                </span>
              </div>

              <select
                value={selectedSummaryMonth}
                onChange={(e) => setSelectedSummaryMonth(e.target.value)}
                className="px-4 py-2 rounded-xl bg-black/60 border border-gold-subtle text-xs font-semibold text-[#f9e7c4] focus:outline-none focus:ring-1 focus:ring-[#d4af37] cursor-pointer"
              >
                <option value="all">📅 All Time (All Recorded Cycles)</option>
                {availableMonths.map((m) => {
                  const [y, mo] = m.split('-');
                  const monthName = new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  return (
                    <option key={m} value={m}>
                      📆 {monthName}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSummaryStatusFilter('delivered')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  summaryStatusFilter === 'delivered'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                    : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                ✓ Delivered Orders Only ({orders.filter(o => o.status === 'delivered').length})
              </button>

              <button
                type="button"
                onClick={() => setSummaryStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  summaryStatusFilter === 'all'
                    ? 'bg-[#d4af37] text-black shadow-sm'
                    : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                All Orders ({orders.length})
              </button>
            </div>
          </div>

          {/* Monthly Period Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 no-print">
            <div className="bg-[#12151e] border border-white/10 rounded-2xl p-5 space-y-1 shadow-md">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                Orders in Statement
              </span>
              <h3 className="font-serif text-3xl font-bold text-white tabular-nums">
                {monthlySummaryOrders.length}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {summaryStatusFilter === 'delivered' ? 'Completed & Delivered' : 'Total in pipeline'}
              </p>
            </div>

            <div className="bg-[#12151e] border border-gold-subtle/50 rounded-2xl p-5 space-y-1 shadow-md">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                Gross Income (Total Price)
              </span>
              <h3 className="font-serif text-3xl font-bold text-[#f9e7c4] tabular-nums">
                Rs. {monthlyTotalRevenue.toLocaleString()}
              </h3>
              <p className="text-[11px] text-[#c5a880]">
                Customer payments received
              </p>
            </div>

            <div className="bg-[#12151e] border border-white/10 rounded-2xl p-5 space-y-1 shadow-md">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                Wholesale Cost (Kitnay Ka Aya)
              </span>
              <h3 className="font-serif text-3xl font-bold text-zinc-300 tabular-nums">
                Rs. {monthlyTotalCost.toLocaleString()}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Crafting & leather costs
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#12151e] to-emerald-950/30 border border-emerald-500/50 rounded-2xl p-5 space-y-1 shadow-md">
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
                Total Net Profit
              </span>
              <h3 className="font-serif text-3xl font-bold text-emerald-400 tabular-nums">
                +Rs. {monthlyTotalProfit.toLocaleString()}
              </h3>
              <p className="text-[11px] text-emerald-300 font-medium">
                {monthlyProfitMargin}% Net Profit Margin
              </p>
            </div>
          </div>

          {/* Printable Statement Container (High-Resolution Ledger Document) */}
          <div className="printable-statement-container bg-[#12151e] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            
            {/* Formal Statement Header (Visible in UI & on Print) */}
            <div className="print-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#d4af37] font-bold block">
                  V Collection Luxury Cordwaining Atelier
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#f9e7c4] tracking-tight">
                  Official Monthly Statement of Delivered Orders & Net Profit
                </h3>
                <div className="flex items-center gap-3 text-xs text-zinc-400 pt-1 flex-wrap">
                  <span>Atelier Director: <strong className="text-white font-medium">Syed Bilal</strong></span>
                  <span>·</span>
                  <span>Support: <strong className="text-[#f5ebd7]">+92 342 1080908</strong></span>
                  <span>·</span>
                  <span>Storefront: <strong className="text-zinc-300">V Collection Official (vcollection.pk)</strong></span>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs text-zinc-400 space-y-1 shrink-0 bg-black/40 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                <div>Statement Period: <strong className="text-[#f9e7c4] uppercase font-semibold">
                  {selectedSummaryMonth === 'all'
                    ? 'All Cycles to Date'
                    : new Date(Number(selectedSummaryMonth.split('-')[0]), Number(selectedSummaryMonth.split('-')[1]) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </strong></div>
                <div>Filter Scope: <strong className="text-white capitalize">{summaryStatusFilter} Orders</strong></div>
                <div>Date of Audit Report: <strong className="text-zinc-300 font-mono">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></div>
              </div>
            </div>

            {/* Formal Financial Summary Callout */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-black/40 border border-white/10 text-xs">
              <div>
                <span className="text-zinc-400 text-[10px] uppercase tracking-wider block">Total Orders</span>
                <strong className="text-base text-white font-mono">{monthlySummaryOrders.length} orders</strong>
              </div>
              <div>
                <span className="text-zinc-400 text-[10px] uppercase tracking-wider block">Total Sold Price (Gross)</span>
                <strong className="text-base text-[#f9e7c4] font-mono font-bold">Rs. {monthlyTotalRevenue.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-zinc-400 text-[10px] uppercase tracking-wider block">Wholesale Cost</span>
                <strong className="text-base text-zinc-300 font-mono">Rs. {monthlyTotalCost.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-emerald-400 text-[10px] uppercase tracking-wider block font-bold">Net Atelier Profit</span>
                <strong className="text-base text-emerald-400 font-mono font-bold">+Rs. {monthlyTotalProfit.toLocaleString()}</strong>
              </div>
            </div>

            {/* Itemized Orders Ledger Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/15 text-[10px] uppercase tracking-wider text-zinc-400 bg-black/30">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Order #</th>
                    <th className="py-3 px-3">Patron Client & City</th>
                    <th className="py-3 px-3">Footwear Items</th>
                    <th className="py-3 px-3 text-right">Sold Price (PKR)</th>
                    <th className="py-3 px-3 text-right">Cost Price (PKR)</th>
                    <th className="py-3 px-3 text-right">Net Profit</th>
                    <th className="py-3 px-3">Courier Tracking</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {monthlySummaryOrders.map((ord) => {
                    const ordCost = getOrderCost(ord);
                    const ordProfit = getOrderProfit(ord);

                    return (
                      <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-mono text-zinc-400 whitespace-nowrap">
                          {ord.date}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#f9e7c4] whitespace-nowrap">
                          #{ord.id}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-white block">
                            {ord.shippingAddress.fullName}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {ord.shippingAddress.city}, {ord.shippingAddress.phone}
                          </span>
                        </td>
                        <td className="py-3 px-3 max-w-[200px]">
                          {ord.items.map((it, i) => (
                            <div key={i} className="truncate text-zinc-300">
                              {it.quantity}x {it.product.name} (EU {it.size}, {it.finish.name})
                            </div>
                          ))}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-[#f5ebd7] whitespace-nowrap">
                          Rs. {ord.total.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-zinc-400 whitespace-nowrap">
                          Rs. {ordCost.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                          +Rs. {ordProfit.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                          <div>{ord.courierName || 'TCS Express'}</div>
                          <div className="text-[10px] text-zinc-500">{ord.trackingNumber}</div>
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : ord.status === 'dispatched' || ord.status === 'handed_over'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : ord.status === 'confirmed'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {ord.status === 'handed_over' ? 'Handed Over' : ord.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {monthlySummaryOrders.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-zinc-500">
                        No orders recorded matching this billing cycle and status filter.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-white/20 bg-black/50 font-semibold text-xs text-white">
                    <td colSpan={4} className="py-4 px-3 uppercase tracking-wider text-[#d4af37]">
                      Grand Accounting Totals ({monthlySummaryOrders.length} orders):
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-[#f9e7c4] font-bold text-sm">
                      Rs. {monthlyTotalRevenue.toLocaleString()}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-zinc-300 text-sm">
                      Rs. {monthlyTotalCost.toLocaleString()}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-emerald-400 font-bold text-sm">
                      +Rs. {monthlyTotalProfit.toLocaleString()}
                    </td>
                    <td colSpan={2} className="py-4 px-3 text-right text-zinc-400 text-[11px]">
                      Margin: <strong className="text-emerald-400">{monthlyProfitMargin}%</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Document Signature & Official Endorsement */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-400">
              <div className="space-y-1">
                <p className="font-serif italic text-zinc-300 text-sm">
                  "Handcrafted cordwaining integrity. Reconciled under atelier executive management."
                </p>
                <p className="text-[11px] text-zinc-500">
                  Electronic Verification ID: ATELIER-PK-AUDIT-{selectedSummaryMonth.toUpperCase()}-VERIFIED
                </p>
              </div>
              <div className="border-t border-zinc-700 pt-2 text-center sm:text-right min-w-[200px]">
                <span className="font-serif text-sm font-semibold text-[#f9e7c4] block">Syed Bilal</span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">Master Cordwainer & Atelier Director</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD NEW SHOE / EDIT SHOE
          ========================================================================= */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12151e] border border-gold-subtle rounded-2xl w-full max-w-3xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 inset-x-0 gold-foil-line" />

            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block">
                    {editingProduct ? 'Atelier Modification' : 'New Footwear Commission'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Authorized: {AUTHORIZED_OWNER_EMAIL}
                  </span>
                </div>
                <h2 className="font-serif text-2xl text-[#f9e7c4] mt-0.5">
                  {editingProduct ? `Edit "${editingProduct.name}"` : 'List New Shoe in Collection'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitProduct} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Row 1: Name & Collection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-300 font-semibold block">
                    Shoe Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. The Verona Belgian Loafer"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-300 font-semibold block">
                    Collection *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCollection}
                    onChange={(e) => setFormCollection(e.target.value)}
                    placeholder="e.g. Italian Riviera Serie"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Row 2: Category & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-300 font-semibold block">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Category)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="loafers">Italian Loafers</option>
                    <option value="formal">Oxfords & Formalwear</option>
                    <option value="boots">Boots & Chelseas</option>
                    <option value="casual">Luxury Casuals & Derbys</option>
                    <option value="bespoke">Bespoke Cordwaining</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-300 font-semibold block">
                    Gender *
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as 'men' | 'women' | 'unisex')}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="men">Gentlemen (Men)</option>
                    <option value="women">Ladies (Women)</option>
                    <option value="unisex">Unisex Collection</option>
                  </select>
                </div>
              </div>

              {/* Row 3: PRICE IN PKR & DISCOUNT CONTROLLER */}
              <div className="bg-[#171b26] p-4 sm:p-5 rounded-2xl border border-gold-subtle/40 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#d4af37]" />
                    <span className="text-xs uppercase tracking-wider text-[#d4af37] font-semibold">
                      Footwear Pricing & Discount Management
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-xl font-bold text-[#f9e7c4] tabular-nums block">
                      Rs. {formHasDiscount
                        ? Math.round(Number(formBasePrice) * (1 - Number(formDiscountPercent) / 100)).toLocaleString()
                        : Number(formBasePrice).toLocaleString()} PKR
                    </span>
                    {formHasDiscount && (
                      <span className="text-[11px] text-zinc-400 line-through tabular-nums">
                        Original: Rs. {Number(formBasePrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Wholesale / Production Cost Input (Kitnay Ka Aya Ha) */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-black/40 border border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-zinc-300 font-semibold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Wholesale / Production Cost (Kitnay Ka Aya Ha):</span>
                    </label>
                    <span className="text-[11px] text-[#f9e7c4] font-mono font-bold">
                      Rs. {Number(formCostPrice).toLocaleString()} PKR
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="12000"
                    step="50"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(Number(e.target.value))}
                    className="w-full accent-zinc-400 bg-zinc-800 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {[2500, 3500, 4200, 5000].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormCostPrice(c)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                          formCostPrice === c
                            ? 'bg-white/20 text-white font-bold'
                            : 'bg-black/40 text-zinc-400 hover:text-white border border-white/10'
                        }`}
                      >
                        Rs. {c.toLocaleString()}
                      </button>
                    ))}
                    <div className="ml-auto w-32">
                      <input
                        type="number"
                        min="500"
                        max="15000"
                        step="50"
                        value={formCostPrice}
                        onChange={(e) => setFormCostPrice(Number(e.target.value))}
                        className="w-full px-2.5 py-1 rounded bg-black/60 border border-white/20 text-xs text-white font-mono text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* Base Retail Price Input (Sold Kitnay Ka Krna Ha) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-zinc-300 font-semibold">
                      Selling Price (Sold Kitnay Ka Krna Ha - PKR):
                    </label>
                    <span className="text-[11px] text-zinc-400">Range: Rs. 2,500 – Rs. 15,000</span>
                  </div>
                  <input
                    type="range"
                    min="2500"
                    max="15000"
                    step="50"
                    value={formBasePrice}
                    onChange={(e) => setFormBasePrice(Number(e.target.value))}
                    className="w-full accent-[#d4af37] bg-zinc-800 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {[4500, 5500, 6450, 7500, 8500, 9500].map((pr) => (
                      <button
                        key={pr}
                        type="button"
                        onClick={() => setFormBasePrice(pr)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
                          formBasePrice === pr
                            ? 'bg-[#d4af37] text-black'
                            : 'bg-black/50 text-zinc-300 hover:text-white border border-white/15'
                        }`}
                      >
                        Rs. {pr.toLocaleString()}
                      </button>
                    ))}
                    <div className="ml-auto w-36">
                      <input
                        type="number"
                        min="2500"
                        max="15000"
                        step="50"
                        value={formBasePrice}
                        onChange={(e) => setFormBasePrice(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-xs text-white font-mono text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* Discount Switch & Percentage Control */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-[#d4af37]" />
                      <span className="text-xs font-semibold text-white">
                        Apply Promotional Discount on this Shoe?
                      </span>
                    </div>

                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setFormHasDiscount(!formHasDiscount)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formHasDiscount ? 'bg-[#d4af37]' : 'bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                          formHasDiscount ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {formHasDiscount ? (
                    <div className="space-y-3 pt-2 border-t border-white/10 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-medium">Select Discount Percentage:</span>
                        <span className="font-bold text-[#d4af37] text-sm font-mono">
                          {formDiscountPercent}% OFF
                        </span>
                      </div>

                      {/* Preset Discount Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {[10, 15, 20, 25, 30, 40, 50].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setFormDiscountPercent(pct)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              formDiscountPercent === pct
                                ? 'bg-gradient-to-r from-[#d4af37] to-[#aa8329] text-black shadow-md scale-105'
                                : 'bg-white/5 text-zinc-300 hover:text-white border border-white/10'
                            }`}
                          >
                            {pct}% OFF
                          </button>
                        ))}
                        <div className="flex items-center gap-1.5 ml-auto">
                          <span className="text-[11px] text-zinc-400">Custom:</span>
                          <input
                            type="number"
                            min="1"
                            max="90"
                            value={formDiscountPercent}
                            onChange={(e) => setFormDiscountPercent(Math.min(90, Math.max(1, Number(e.target.value))))}
                            className="w-16 px-2 py-1 rounded bg-black/60 border border-white/20 text-xs text-white text-center font-mono font-bold text-[#d4af37]"
                          />
                          <span className="text-xs text-zinc-400">%</span>
                        </div>
                      </div>

                      {/* Calculation Summary Card */}
                      <div className="p-3 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl flex items-center justify-between text-xs flex-wrap gap-2">
                        <div className="space-y-0.5">
                          <span className="text-zinc-300 block">
                            Original: <strong className="text-white">Rs. {Number(formBasePrice).toLocaleString()}</strong>
                          </span>
                          <span className="text-[#d4af37] block">
                            Discount: <strong>-{formDiscountPercent}% (-Rs. {Math.round(Number(formBasePrice) * (Number(formDiscountPercent) / 100)).toLocaleString()})</strong>
                          </span>
                        </div>
                        <div className="text-right ml-auto">
                          <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">Customer Pays</span>
                          <span className="font-serif text-base font-bold text-emerald-400">
                            Rs. {Math.round(Number(formBasePrice) * (1 - Number(formDiscountPercent) / 100)).toLocaleString()} PKR
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-400">
                      Standard retail pricing active. Shoe will sell at regular price with no discount badge.
                    </p>
                  )}
                </div>

                {/* Real-time Profit Calculation for Owner (Profit kitna aya ha) */}
                {(() => {
                  const effectivePrice = formHasDiscount
                    ? Math.round(Number(formBasePrice) * (1 - Number(formDiscountPercent) / 100))
                    : Number(formBasePrice);
                  const profitPerPair = effectivePrice - Number(formCostPrice);
                  const marginPct = effectivePrice > 0 ? Math.round((profitPerPair / effectivePrice) * 100) : 0;

                  return (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-black/60 to-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
                          Expected Profit per Pair (Profit Kitna Aya Ha)
                        </span>
                        <div className="flex items-baseline gap-2 pt-0.5">
                          <span className={`text-xl font-serif font-bold ${profitPerPair >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                            {profitPerPair >= 0 ? `+Rs. ${profitPerPair.toLocaleString()}` : `-Rs. ${Math.abs(profitPerPair).toLocaleString()}`} PKR
                          </span>
                          <span className="text-xs text-zinc-400 font-mono">
                            ({marginPct}% Net Profit Margin)
                          </span>
                        </div>
                      </div>
                      <div className="text-left sm:text-right text-[11px] text-zinc-400 space-y-0.5">
                        <div>Sold Price to Customer: <strong className="text-white">Rs. {effectivePrice.toLocaleString()}</strong></div>
                        <div>Production Cost (Kitnay Ka Aya): <strong className="text-zinc-300">Rs. {Number(formCostPrice).toLocaleString()}</strong></div>
                      </div>
                    </div>
                  );
                })()}

                {/* Initial Stock Count */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] text-zinc-400 block">Initial Atelier Stock (Pairs Available):</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Row 3B: SHOE COLORS & LEATHER FINISHES SELECTION */}
              <div className="bg-[#171b26] p-4 sm:p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#d4af37]" />
                    <label className="text-xs uppercase tracking-wider text-zinc-200 font-semibold block">
                      Shoe Colors & Leather Finishes ({formFinishes.length} active)
                    </label>
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    Customers can choose from these colors on the storefront
                  </span>
                </div>

                {/* Active Selected Colors Chips */}
                <div className="flex flex-wrap gap-2">
                  {formFinishes.map((f, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-black/60 border border-[#d4af37]/40 flex items-center gap-2 text-xs text-white shadow-sm"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/50 shadow-inner shrink-0"
                        style={{ backgroundColor: f.hex }}
                      />
                      <span className="font-medium">{f.name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">({f.colorName})</span>
                      {formFinishes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setFormFinishes(formFinishes.filter((_, i) => i !== idx))}
                          className="ml-1 text-zinc-400 hover:text-rose-400 transition-colors p-0.5"
                          title="Remove color"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quick Add Popular Colors */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                    Quick-Add Popular Leather Tones:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_FINISH_PRESETS.map((preset) => {
                      const alreadyAdded = formFinishes.some((f) => f.name.toLowerCase() === preset.name.toLowerCase());
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          disabled={alreadyAdded}
                          onClick={() => {
                            if (!alreadyAdded) {
                              setFormFinishes([...formFinishes, preset]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                            alreadyAdded
                              ? 'opacity-40 cursor-not-allowed bg-black/30 border border-white/5 text-zinc-500'
                              : 'bg-black/50 hover:bg-black/80 border border-white/15 text-zinc-300 hover:text-white hover:border-[#d4af37]'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: preset.hex }} />
                          <span>{preset.name}</span>
                          {!alreadyAdded && <Plus className="w-3 h-3 text-[#d4af37]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add Custom Color Tool */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                    Or Create Custom Leather Color:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Color Name (e.g. Royal Navy)"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      className="px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Family (e.g. Navy Blue)"
                      value={newColorCategory}
                      onChange={(e) => setNewColorCategory(e.target.value)}
                      className="px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                    />
                    <div className="flex items-center gap-2 bg-black/60 border border-white/15 rounded-xl px-3 py-1.5">
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-zinc-300">{newColorHex}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newColorName.trim()) return;
                        setFormFinishes([
                          ...formFinishes,
                          {
                            name: newColorName.trim(),
                            hex: newColorHex,
                            colorName: newColorCategory.trim() || newColorName.trim(),
                          },
                        ]);
                        setNewColorName('');
                      }}
                      disabled={!newColorName.trim()}
                      className="px-4 py-2 bg-[#d4af37] hover:bg-[#e5c158] disabled:opacity-40 text-black font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Color</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 4: GALLERY / DEVICE PHOTO UPLOAD & PRESET SELECTOR */}
              <div className="space-y-4 bg-[#171b26] p-4 sm:p-5 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#d4af37]" />
                    <label className="text-xs uppercase tracking-wider text-zinc-200 font-semibold block">
                      Shoe Photography (Upload Gallery or Paste Link) *
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400">
                      {formImages.length} {formImages.length === 1 ? 'photo' : 'photos'} attached
                    </span>
                    {formImages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFormImages([formImages[0]])}
                        className="text-[10px] text-zinc-400 hover:text-zinc-200 underline"
                      >
                        Keep Only Primary
                      </button>
                    )}
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.jfif"
                  multiple
                  className="hidden"
                />

                {/* Drag & Drop Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all space-y-2 group ${
                    isDraggingOver
                      ? 'border-[#d4af37] bg-[#d4af37]/10 scale-[1.01]'
                      : 'border-[#d4af37]/40 hover:border-[#d4af37] bg-black/40 hover:bg-black/60'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    {isOptimizingImage ? (
                      <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      {isOptimizingImage
                        ? 'Optimizing & Attaching Photo... Please wait'
                        : isDraggingOver
                        ? 'Drop Picture Here to Attach'
                        : 'Tap to Pick Pictures from Your Device Gallery / Files'}
                    </span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5">
                      Supports JPG, PNG, WEBP from your phone camera roll, WhatsApp, or PC (drag & drop supported)
                    </span>
                  </div>
                </div>

                {/* Option 2: Direct Picture Link / Web URL Input */}
                <div className="pt-2 border-t border-white/10 space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 block flex items-center gap-1.5">
                    <LinkIcon className="w-3 h-3 text-[#d4af37]" /> Or Paste Image Web Link / URL:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      placeholder="https://example.com/shoe-photo.jpg"
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-black/60 border border-white/20 text-white placeholder-zinc-500 font-mono focus:border-[#d4af37] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      disabled={!imageUrlInput.trim() || isOptimizingImage}
                      className="px-4 py-2 bg-[#d4af37] hover:bg-[#e5c158] disabled:opacity-40 text-black font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Link
                    </button>
                  </div>
                </div>

                {/* Success Feedback Alert */}
                {uploadSuccessMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{uploadSuccessMsg}</span>
                  </div>
                )}

                {/* Error Feedback Alert */}
                {uploadError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Current Attached Photos Grid with Primary badge & Delete */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                      Attached Listing Pictures (The 1st picture is shown on store catalog):
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Drag or click 'Set Primary' to reorder
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {formImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-xl border overflow-hidden p-1.5 bg-black/50 group transition-all ${
                          idx === 0
                            ? 'border-[#d4af37] ring-2 ring-[#d4af37]/60 shadow-lg'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Shoe view ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-24 object-cover rounded-lg bg-zinc-900"
                        />
                        {idx === 0 ? (
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-[#d4af37] text-black text-[9px] font-bold uppercase tracking-wider shadow">
                            Primary View
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMakePrimary(idx)}
                            className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/85 hover:bg-[#d4af37] hover:text-black text-[9px] text-zinc-200 uppercase tracking-wider transition-colors shadow"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-2.5 right-2.5 p-1 rounded-full bg-black/85 hover:bg-rose-600 text-white transition-colors shadow"
                          title="Remove picture"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="mt-1 text-center">
                          <span className="text-[9px] text-zinc-400 font-mono">
                            {idx === 0 ? 'Cover Shot' : `Angle #${idx + 1}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional Atelier Presets Selector */}
                <div className="pt-2 border-t border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                      Or Choose from Italian Atelier Presets:
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormImages(formImages.filter((url) => !PRESET_IMAGES.some((p) => p.url === url)))}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 underline"
                    >
                      Clear Presets
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_IMAGES.map((img) => (
                      <button
                        key={img.url}
                        type="button"
                        onClick={() => {
                          if (!formImages.includes(img.url)) {
                            setFormImages([img.url, ...formImages]);
                          } else {
                            handleMakePrimary(formImages.indexOf(img.url));
                          }
                        }}
                        className="p-1.5 rounded-xl border border-white/10 hover:border-[#d4af37] bg-black/30 text-left transition-all hover:bg-black/50"
                      >
                        <img
                          src={img.url}
                          alt={img.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-12 object-cover rounded-lg mb-1"
                        />
                        <span className="text-[9px] text-zinc-300 block line-clamp-1">
                          {img.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 5: Editorial Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-300 font-semibold block">
                    Leather Type
                  </label>
                  <input
                    type="text"
                    value={formLeather}
                    onChange={(e) => setFormLeather(e.target.value)}
                    placeholder="e.g. Antiqued Tuscan Calfskin"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-300 font-semibold block">
                    Construction Welt
                  </label>
                  <input
                    type="text"
                    value={formConstruction}
                    onChange={(e) => setFormConstruction(e.target.value)}
                    placeholder="e.g. Goodyear Welted (270° beveled waist)"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-300 font-semibold block">
                    Sole Type
                  </label>
                  <input
                    type="text"
                    value={formSole}
                    onChange={(e) => setFormSole(e.target.value)}
                    placeholder="e.g. Oak Bark-Tanned Baker Leather Sole"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-300 font-semibold block">
                    Atelier Origin & Last
                  </label>
                  <input
                    type="text"
                    value={`${formOrigin} · ${formLast}`}
                    onChange={(e) => {
                      const parts = e.target.value.split('·');
                      setFormOrigin(parts[0]?.trim() || 'Florence, Italy');
                      setFormLast(parts[1]?.trim() || 'Sleek Almond Last');
                    }}
                    placeholder="Florence, Italy · Sleek Almond Last"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white"
                  />
                </div>
              </div>

              {/* Row 6: Description & Story */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-300 font-semibold block">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief editorial copy describing the shoe..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-300 font-semibold block">
                    Cordwainer Heritage Story
                  </label>
                  <textarea
                    rows={2}
                    value={formStory}
                    onChange={(e) => setFormStory(e.target.value)}
                    placeholder="Story of the hide selection and atelier lasting..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Row 7: Sizes & Flags */}
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-wider text-zinc-300 font-semibold block">
                  Available EU Sizes:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[38, 39, 40, 41, 42, 43, 44, 45, 46].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className={`w-11 h-9 rounded-lg text-xs font-semibold tabular-nums border transition-all ${
                        formSizes.includes(sz)
                          ? 'bg-[#d4af37] text-black border-[#d4af37]'
                          : 'bg-black/50 text-zinc-400 border-white/15 hover:border-white/30'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={formIsBestSeller}
                      onChange={(e) => setFormIsBestSeller(e.target.checked)}
                      className="rounded accent-[#d4af37] w-4 h-4"
                    />
                    <span>Highlight as Best Seller</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={formIsNew}
                      onChange={(e) => setFormIsNew(e.target.checked)}
                      className="rounded accent-[#d4af37] w-4 h-4"
                    />
                    <span>Mark as New Atelier Arrival</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10 flex-wrap">
                {editingProduct ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShoeToDelete(editingProduct);
                      setIsAddModalOpen(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/80 border border-rose-800/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Shoe from Store</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingProduct(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold uppercase tracking-wider"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8329] text-black text-xs font-semibold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md"
                  >
                    {editingProduct ? 'Save Modifications' : 'Publish Shoe to Archive'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {shoeToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#12151e] border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-rose-400 font-semibold block">
                  Permanent Removal
                </span>
                <h3 className="font-serif text-lg text-white font-bold">
                  Delete Shoe from Catalog?
                </h3>
              </div>
            </div>

            <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl flex items-center gap-3">
              <img
                src={shoeToDelete.images[0]}
                alt={shoeToDelete.name}
                className="w-14 h-14 object-cover rounded-xl bg-zinc-900 border border-white/10 shrink-0"
              />
              <div className="text-xs space-y-0.5">
                <strong className="text-white block font-serif text-sm">{shoeToDelete.name}</strong>
                <span className="text-zinc-400 block">{shoeToDelete.collection} · {shoeToDelete.category}</span>
                <span className="text-[#d4af37] font-semibold font-mono block">
                  Rs. {shoeToDelete.price.toLocaleString()} PKR
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to permanently delete <strong>{shoeToDelete.name}</strong>? This footwear will be completely removed from your live store catalog, customer shopping views, and inventory.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShoeToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold"
              >
                Cancel / Keep Shoe
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteProduct(shoeToDelete.id);
                  setShoeToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Completely</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
