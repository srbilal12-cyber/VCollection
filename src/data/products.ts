import { Product } from '../types';

export const CRAFTSMANSHIP_IMAGE = '/src/assets/images/craftsmanship_atelier_1790359135817.jpg';
export const HERO_SHOE_IMAGE = '/src/assets/images/hero_luxury_shoe_1790359076245.jpg';
export const LOAFER_QUARTER_IMAGE = '/src/assets/images/loafer_quarter_view_1790360031084.jpg';
export const LOAFER_SIDE_IMAGE = '/src/assets/images/loafer_side_profile_1790360048340.jpg';
export const LOAFER_TOP_IMAGE = '/src/assets/images/loafer_top_down_1790360062870.jpg';
export const LOAFER_STUDIO_IMAGE = '/src/assets/images/shoe_loafer_cognac_1790359108681.jpg';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-oxford-01',
    name: 'The Sovereign Wholecut Oxford',
    collection: 'Master Heritage Line',
    category: 'formal',
    gender: 'men',
    price: 7850,
    costPrice: 4300,
    originalPrice: 9200,
    description: 'Carved from a single flawless hide of French box calfskin, The Sovereign Wholecut represents the ultimate test of artisanal shoemaking with seamless contouring and mirror-gloss chisel toe.',
    story: 'Cut by hand from unbroken hides selected from the Tanneries du Puy in France. Each pair requires 32 hours of continuous hand-stitching, cork molding, and violin-waist sole sculpting by master cordwainers.',
    details: {
      leather: 'Full-Grain French Box Calfskin',
      construction: 'Handcrafted Goodyear Welt (270° beveled waist)',
      sole: 'Oak Bark-Tanned Baker Leather Sole with Brass Toe Plate',
      origin: 'Riviera del Brenta, Italy',
      last: 'Chiseled English Last (E-Fitting standard)'
    },
    images: [
      '/src/assets/images/shoe_oxford_nero_1790359094455.jpg',
      '/src/assets/images/hero_luxury_shoe_1790359076245.jpg',
    ],
    finishes: [
      { name: 'Nero Obsidian', hex: '#111317', colorName: 'Black' },
      { name: 'Antiqued Cognac', hex: '#8a4b28', colorName: 'Cognac' },
      { name: 'Bordeaux Riserva', hex: '#4e1423', colorName: 'Burgundy' },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45, 46],
    rating: 4.95,
    reviewCount: 42,
    isBestSeller: true,
    isNew: false,
    stockCount: 4,
    tags: ['Wholecut', 'Black Tie', 'Goodyear Welt', 'Calfskin'],
    threeModelConfig: {
      upperColor: '#16181d',
      soleColor: '#3c2415',
      roughness: 0.28,
      metalness: 0.15
    },
    reviews: [
      {
        id: 'rev-1',
        author: 'Lord Julian Sterling',
        rating: 5,
        date: '12 days ago',
        title: 'Unrivaled silhouette and arch support',
        comment: 'The violin waist hugs the foot like a bespoke cast. The French box calf shines to a glass glaze with minimal cream. Simply unmatched at this price point.',
        verified: true,
        fit: 'True to Size'
      },
      {
        id: 'rev-2',
        author: 'Massimo R.',
        rating: 5,
        date: '3 weeks ago',
        title: 'Masterclass in cordwaining',
        comment: 'You can immediately tell this was lasted on a traditional wooden last. The balance between heel height and toe roll is perfection.',
        verified: true,
        fit: 'True to Size'
      }
    ]
  },
  {
    id: 'prod-loafer-02',
    name: 'The Milano Horsebit Loafer',
    collection: 'Italian Riviera Serie',
    category: 'loafers',
    gender: 'men',
    price: 6450,
    costPrice: 3550,
    originalPrice: 7500,
    description: 'Supple hand-patinated Italian calfskin finished with an authentic brushed brass horsebit snaffle and ultra-flexible Blake-rapid stitching for effortless elegance.',
    story: 'Inspired by the grand palazzos of Lombardy, this loafer pairs unlined glove-soft sides with a reinforced oak-bark leather arch for effortless summer soirees and boardroom poise.',
    details: {
      leather: 'Antiqued Tuscan Calfskin (Hand-Burnished)',
      construction: 'Blake-Rapid Flexibility Welt',
      sole: 'Beveled Leather Sole with Rubber Inset Island',
      origin: 'Florence, Italy',
      last: 'Sleek Almond Last'
    },
    images: [
      '/src/assets/images/loafer_quarter_view_1790360031084.jpg',
      '/src/assets/images/loafer_side_profile_1790360048340.jpg',
      '/src/assets/images/loafer_top_down_1790360062870.jpg',
      '/src/assets/images/shoe_loafer_cognac_1790359108681.jpg',
    ],
    finishes: [
      { name: 'Antiqued Cognac', hex: '#8a4b28', colorName: 'Cognac' },
      { name: 'Nero Gloss', hex: '#111317', colorName: 'Black' },
      { name: 'Espresso Roast', hex: '#3d251e', colorName: 'Dark Brown' },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    rating: 4.88,
    reviewCount: 38,
    isBestSeller: true,
    isNew: true,
    stockCount: 6,
    tags: ['Horsebit', 'Italian Leather', 'Loafer', 'Summer Formal'],
    threeModelConfig: {
      upperColor: '#7a3e1d',
      soleColor: '#2b1a11',
      roughness: 0.35,
      metalness: 0.2
    },
    reviews: [
      {
        id: 'rev-3',
        author: 'Alexander V.',
        rating: 5,
        date: '1 month ago',
        title: 'The leather aroma and brass buckle are exquisite',
        comment: 'No break-in period required. The hand-burnished patina catches natural sunlight with rich amber gradients.',
        verified: true,
        fit: 'True to Size'
      }
    ]
  },
  {
    id: 'prod-chelsea-03',
    name: 'The Kensington Suede Chelsea',
    collection: 'Highland & Mayfair',
    category: 'boots',
    gender: 'men',
    price: 8200,
    costPrice: 4500,
    originalPrice: 9500,
    description: 'Crafted from waterproof British repello suede with a clean chisel toe, reinforced webbing pull-tabs, and storm-welted Dainite rubber soles.',
    story: 'Engineered for London autumns and alpine escapes, treated with nanotech water repellency without sacrificing the velvety touch of premium calf suede.',
    details: {
      leather: 'Charles F. Stead Repello Suede',
      construction: 'Storm-Welt 360° Weather Sealed',
      sole: 'British Dainite Studded Rubber Sole',
      origin: 'Northamptonshire & Tuscany',
      last: 'Sculpted Chisel Last'
    },
    images: [
      '/src/assets/images/shoe_chelsea_boot_1790359121354.jpg',
      '/src/assets/images/shoe_oxford_nero_1790359094455.jpg',
    ],
    finishes: [
      { name: 'Espresso Suede', hex: '#3a2720', colorName: 'Espresso' },
      { name: 'Snuff Tobacco', hex: '#6d4c32', colorName: 'Snuff' },
      { name: 'Onyx Suede', hex: '#1c1c1f', colorName: 'Black' },
    ],
    sizes: [40, 41, 42, 43, 44, 45, 46],
    rating: 4.92,
    reviewCount: 29,
    isBestSeller: false,
    isNew: true,
    stockCount: 5,
    tags: ['Chelsea', 'Suede', 'Dainite', 'All-Weather'],
    threeModelConfig: {
      upperColor: '#3d2b24',
      soleColor: '#1e1a17',
      roughness: 0.85,
      metalness: 0.05
    },
    reviews: [
      {
        id: 'rev-4',
        author: 'Dr. Evelyn Ward',
        rating: 5,
        date: '2 weeks ago',
        title: 'Impeccable rain resistance and chic lines',
        comment: 'Wore these in heavy Edinburgh drizzle; water beaded right off. The chisel toe elevates them above ordinary round-toe boots.',
        verified: true,
        fit: 'True to Size'
      }
    ]
  },
  {
    id: 'prod-monk-04',
    name: 'The Venezia Double Monkstrap',
    collection: 'Master Heritage Line',
    category: 'formal',
    gender: 'men',
    price: 7200,
    costPrice: 3950,
    originalPrice: 8400,
    description: 'Distinguished double monkstrap with antiqued gold-finished Italian hardware, beveled fiddleback waist, and hand-stained museum calf.',
    story: 'A signature of Italian sprezzatura, combining theatrical confidence with impeccable sartorial rigor. Each brass buckle is cast in Venice and hand-brushed.',
    details: {
      leather: 'Ilcea Museum Calf (Marbled Patina)',
      construction: 'Goodyear Welted with Fiddleback Waist',
      sole: 'Bark-Tanned Leather with Channel Stitching',
      origin: 'Riviera del Brenta, Italy',
      last: 'Elongated Soft-Square Last'
    },
    images: [
      '/src/assets/images/hero_luxury_shoe_1790359076245.jpg',
      '/src/assets/images/shoe_oxford_nero_1790359094455.jpg',
    ],
    finishes: [
      { name: 'Bordeaux Riserva', hex: '#4e1423', colorName: 'Burgundy' },
      { name: 'Nero Polished', hex: '#111317', colorName: 'Black' },
      { name: 'Walnut Burnished', hex: '#5c3924', colorName: 'Walnut' },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    rating: 4.86,
    reviewCount: 22,
    isBestSeller: false,
    isNew: false,
    stockCount: 3,
    tags: ['Double Monk', 'Museum Calf', 'Brass Buckles', 'Formal'],
    threeModelConfig: {
      upperColor: '#43121f',
      soleColor: '#2b1b13',
      roughness: 0.3,
      metalness: 0.2
    },
    reviews: [
      {
        id: 'rev-5',
        author: 'Henri Dupont',
        rating: 5,
        date: '5 days ago',
        title: 'Breathtaking museum marble effect',
        comment: 'The cloud-like depth of the leather dye is museum-grade. The concealed channel stitching under the sole is the hallmark of real luxury.',
        verified: true,
        fit: 'True to Size'
      }
    ]
  },
  {
    id: 'prod-derby-05',
    name: 'The Florentine Split-Toe Derby',
    collection: 'Atelier Bespoke',
    category: 'casual',
    gender: 'men',
    price: 8900,
    costPrice: 4900,
    originalPrice: 9900,
    description: 'Renowned Norwegian-welted split toe featuring hand-sewn apron seam utilizing wild boar bristle needles and durable pebble-grain Horween leather.',
    story: 'Only 3 craftsmen in our Tuscan atelier possess the finger dexterity required to sew the raised pie-crust apron stitch without piercing through the inner lining.',
    details: {
      leather: 'Scotch Grain Italian Calfskin',
      construction: 'Norvegese Welt (Dual Braided Thread)',
      sole: 'Ridgeway Rubber Lug Dress Sole',
      origin: 'Florence, Italy',
      last: 'Anatomical Round-Toe Last'
    },
    images: [
      '/src/assets/images/shoe_loafer_cognac_1790359108681.jpg',
      '/src/assets/images/craftsmanship_atelier_1790359135817.jpg',
    ],
    finishes: [
      { name: 'Bourbon Grain', hex: '#66391d', colorName: 'Bourbon' },
      { name: 'Nero Grain', hex: '#131417', colorName: 'Black' },
    ],
    sizes: [40, 41, 42, 43, 44, 45],
    rating: 4.97,
    reviewCount: 19,
    isBestSeller: false,
    isNew: true,
    stockCount: 2,
    tags: ['Norvegese', 'Split Toe', 'Scotch Grain', 'Atelier'],
    threeModelConfig: {
      upperColor: '#5c331a',
      soleColor: '#1c1c1f',
      roughness: 0.45,
      metalness: 0.1
    },
    reviews: [
      {
        id: 'rev-6',
        author: 'Charles Beaumont',
        rating: 5,
        date: '2 months ago',
        title: 'An heirloom piece for generations',
        comment: 'The braided Norvegese stitching is extraordinary. Heavy, substantial, yet cushions the foot effortlessly during 10-mile city strolls.',
        verified: true,
        fit: 'Runs Slightly Large'
      }
    ]
  },
  {
    id: 'prod-sneaker-06',
    name: 'The Monaco Luxury Minimalist Sneaker',
    collection: 'Contemporary Leisure',
    category: 'casual',
    gender: 'unisex',
    price: 3850,
    costPrice: 2100,
    originalPrice: 4600,
    description: 'Pure Italian nappa leather low-top sneaker featuring calfskin glove lining, natural latex footbed, and hand-stitched Margom rubber cupsole.',
    story: 'Designed to bridge tailored savile-row trousers and weekend casual wear with understated restraint. Finished with discreet gold foil debossed monogramming.',
    details: {
      leather: 'Full-Grain Italian Nappa Leather',
      construction: 'Stitched Margom Cupsole 360°',
      sole: 'Authentic Italian Margom Rubber',
      origin: 'Civitanova Marche, Italy',
      last: 'Contemporary Streamlined Last'
    },
    images: [
      '/src/assets/images/shoe_oxford_nero_1790359094455.jpg',
      '/src/assets/images/hero_luxury_shoe_1790359076245.jpg',
    ],
    finishes: [
      { name: 'Ivory Nappa', hex: '#e8e5dc', colorName: 'Ivory' },
      { name: 'Onyx Monochrome', hex: '#181a1f', colorName: 'Black' },
      { name: 'Olive Suede', hex: '#484a3b', colorName: 'Olive' },
    ],
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    rating: 4.84,
    reviewCount: 51,
    isBestSeller: true,
    isNew: false,
    stockCount: 7,
    tags: ['Sneaker', 'Minimalist', 'Margom', 'Nappa'],
    threeModelConfig: {
      upperColor: '#dad6cb',
      soleColor: '#e0ded6',
      roughness: 0.4,
      metalness: 0.05
    },
    reviews: [
      {
        id: 'rev-7',
        author: 'Claire Delacroix',
        rating: 5,
        date: '3 weeks ago',
        title: 'Silky smooth leather with incredible durability',
        comment: 'Pairs gorgeously with cashmere trousers or relaxed silk skirts. The cushioning is superior to any sneaker in my wardrobe.',
        verified: true,
        fit: 'True to Size'
      }
    ]
  },
  {
    id: 'prod-loafer-07',
    name: 'The Bellagio Penny Loafer',
    collection: 'Italian Riviera Serie',
    category: 'loafers',
    gender: 'men',
    price: 5900,
    costPrice: 3250,
    originalPrice: 6800,
    description: 'Iconic unlined penny loafer in supple navy museum calfskin, offering sock-like comfort from the very first stride with a beveled leather sole.',
    story: 'Handcrafted on Lake Como with an unlined vamp that breathes in warm Mediterranean climates while maintaining tailored architectural structure.',
    details: {
      leather: 'Museum Calfskin (Lake Como Blue)',
      construction: 'Blake Flexibility Construction',
      sole: 'Stacked Leather Heel with Brass Tack Nails',
      origin: 'Como, Italy',
      last: 'Soft Almond Penny Last'
    },
    images: [
      '/src/assets/images/shoe_loafer_cognac_1790359108681.jpg',
      '/src/assets/images/shoe_chelsea_boot_1790359121354.jpg',
    ],
    finishes: [
      { name: 'Midnight Navy', hex: '#1b2333', colorName: 'Navy' },
      { name: 'Cognac Amber', hex: '#8a4b28', colorName: 'Cognac' },
      { name: 'Dark Oak', hex: '#3b2416', colorName: 'Dark Brown' },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    rating: 4.91,
    reviewCount: 34,
    isBestSeller: false,
    isNew: true,
    stockCount: 4,
    tags: ['Penny Loafer', 'Unlined', 'Museum Calf', 'Summer'],
    threeModelConfig: {
      upperColor: '#1b263b',
      soleColor: '#302018',
      roughness: 0.32,
      metalness: 0.18
    },
    reviews: [
      {
        id: 'rev-8',
        author: 'Domenico C.',
        rating: 5,
        date: '1 week ago',
        title: 'The unlined vamp is pure bliss',
        comment: 'Like slipping into a custom glove. The midnight navy has subtle blue and charcoal undertones that shimmer in daylight.',
        verified: true,
        fit: 'True to Size'
      }
    ]
  },
  {
    id: 'prod-boot-08',
    name: 'The St. Moritz Alpine Wingtip Boot',
    collection: 'Highland & Mayfair',
    category: 'boots',
    gender: 'men',
    price: 9400,
    costPrice: 5150,
    originalPrice: 10000,
    description: 'Heavy brogued wingtip boot in grain calfskin with shearling ankle collar, speed-hook lacing, and double storm welt for rugged luxury.',
    story: 'Created for alpine winters in St. Moritz and Engadin valleys. Combining full brogue medallion perforations with genuine shearling warmth.',
    details: {
      leather: 'Antiqued Alpine Grain Calfskin',
      construction: '360° Double Storm Welt with Cork Infill',
      sole: 'Commando Vibram Lug Sole',
      origin: 'Northamptonshire, UK & Milan',
      last: 'Military Service Boot Last'
    },
    images: [
      '/src/assets/images/shoe_chelsea_boot_1790359121354.jpg',
      '/src/assets/images/shoe_oxford_nero_1790359094455.jpg',
    ],
    finishes: [
      { name: 'Mahogany Grain', hex: '#482419', colorName: 'Mahogany' },
      { name: 'Nero Black', hex: '#111317', colorName: 'Black' },
    ],
    sizes: [40, 41, 42, 43, 44, 45, 46],
    rating: 4.94,
    reviewCount: 27,
    isBestSeller: true,
    isNew: false,
    stockCount: 3,
    tags: ['Wingtip', 'Brogue', 'Alpine', 'Storm Welt'],
    threeModelConfig: {
      upperColor: '#421f15',
      soleColor: '#141416',
      roughness: 0.5,
      metalness: 0.1
    },
    reviews: [
      {
        id: 'rev-9',
        author: 'Maximilian Von Bauer',
        rating: 5,
        date: '1 month ago',
        title: 'Indestructible elegance on snow or cobblestone',
        comment: 'The storm welt prevents any moisture penetration. The speed hooks make lacing quick and snug. Remarkable craftsmanship.',
        verified: true,
        fit: 'Runs Slightly Large'
      }
    ]
  }
];

export const INITIAL_USER: import('../types').UserProfile = {
  id: 'guest',
  name: '',
  email: '',
  tier: 'Patron',
  points: 0,
  wishlistIds: [],
  savedAddresses: [],
  orders: []
};
