/**
 * Artistically. - Configuration & Data Models
 * Clean Code Architecture: Centralized, immutable configuration & design tokens.
 */

export const CFG = {
  shop: 'Artistically.',
  brandFont: "'Avillia', 'Playfair Display', 'Bodoni Moda', serif",
  tagline: 'Handcrafted Pipe Cleaner Blooms · রাজশাহী',
  instagram: 'artis_tically22',       // Target Instagram handle
  instagramUrl: 'https://www.instagram.com/artis_tically22/',
  email: 'sumaiyamrittika22@gmail.com', // Studio email routing
  pricePerCleaner: 2,               // ৳ per pipe cleaner (4 tk per 2 cleaners)
  platformFee: 10,                  // Fixed platform processing fee (৳)
  deliveryFee: 50,                  // Flat delivery fee for Rajshahi (৳)
  defaultCity: 'rajshahi',
  deliveryCityName: 'Rajshahi'
};

export const COL = {
  yellow: '#f7cf2a',
  pink: '#f08fb0',
  red: '#d93a3a',
  blue: '#3d7fd9',
  lavender: '#b894e6',
  white: '#fbfbf8',
  green: '#2f9e4f',
  brown: '#6b3f22',
  orange: '#f28c28',
  black: '#2a2a2e'
};

export const COLNAMES = Object.keys(COL);

export const FL = {
  sunflower: {
    id: 'sunflower',
    name: 'Sunflower',
    banglaName: 'সূর্যমুখী',
    bg: '#fef3c7',
    petals: 12,
    pc: 'yellow',
    cc: 'brown',
    centre: true,
    minPetals: 6,
    maxPetals: 36,
    card: '#fef3c7',
    tag: 'Beginner Friendly',
    description: 'Golden radiance with a textured, cozy spiral center.'
  },
  daisy: {
    id: 'daisy',
    name: 'Daisy',
    banglaName: 'ডেইজি',
    bg: '#e0f2fe',
    petals: 12,
    pc: 'white',
    cc: 'yellow',
    centre: true,
    minPetals: 6,
    maxPetals: 36,
    card: '#e0f2fe',
    tag: 'Beginner Friendly',
    description: 'Crisp white fuzzy loops surrounding a sunny yolk center.'
  },
  tulip: {
    id: 'tulip',
    name: 'Tulip',
    banglaName: 'টিউলিপ',
    bg: '#fce7f3',
    petals: 8,
    pc: 'red',
    cc: 'red',
    centre: false,
    minPetals: 4,
    maxPetals: 20,
    card: '#fce7f3',
    tag: 'Artisan Favorite',
    tulip: true,
    description: 'Elegantly cupped petals layered around an upright stem.'
  },
  lavender_sprig: {
    id: 'lavender_sprig',
    name: 'Lavender Sprig',
    banglaName: 'ল্যাভেন্ডার',
    bg: '#f3e8ff',
    petals: 16,
    pc: 'lavender',
    cc: 'green',
    centre: false,
    minPetals: 8,
    maxPetals: 32,
    card: '#f3e8ff',
    tag: 'Cozy & Slender',
    tulip: true,
    description: 'Delicate stacked clusters of calm purple velvet loops.'
  }
};

export const FULL = [
  { n: 1, name: 'Big & Bold', desc: '1 petal per pipe cleaner', badge: 'Airy & expressive' },
  { n: 2, name: 'Classic', desc: '2 petals per pipe cleaner', badge: 'Standard plush' },
  { n: 3, name: 'Extra Full', desc: '3 petals per pipe cleaner', badge: 'Dense & fuzzy' }
];

export const PARTS = {
  petals: 'Petals',
  centre: 'Center Coil',
  leaves: 'Leaves',
  stem: 'Stem'
};

export const KITS = [
  {
    id: 'sunflower',
    title: 'Sunny Rajshahi Sunflower',
    tag: 'Best Seller',
    flower: 'sunflower',
    petals: 14,
    lpc: 2,
    pc: 'yellow',
    cc: 'brown',
    leaves: 2,
    lc: 'green',
    sc: 'green',
    desc: 'Our signature warm sunflower kit with plush petals and deep cocoa center.'
  },
  {
    id: 'daisy',
    title: 'Cloud White Meadow Daisy',
    tag: 'Classic',
    flower: 'daisy',
    petals: 16,
    lpc: 2,
    pc: 'white',
    cc: 'yellow',
    leaves: 2,
    lc: 'green',
    sc: 'green',
    desc: 'Pure snow-white loops with bright lemon center coil and emerald foliage.'
  },
  {
    id: 'tulip',
    title: 'Crimson Velvet Dutch Tulip',
    tag: 'Special',
    flower: 'tulip',
    petals: 10,
    lpc: 2,
    pc: 'red',
    cc: 'red',
    leaves: 3,
    lc: 'green',
    sc: 'green',
    desc: 'Layered cup sculpture crafted from soft crimson chenille wires.'
  },
  {
    id: 'lavender_sprig',
    title: 'Pastel Lilac Lavender Bunch',
    tag: 'New',
    flower: 'lavender_sprig',
    petals: 18,
    lpc: 2,
    pc: 'lavender',
    cc: 'green',
    leaves: 4,
    lc: 'green',
    sc: 'green',
    desc: 'Calming lavender sprig designed with slender vertical floral coils.'
  }
];

