export type Collection = 'suits' | 'jackets' | 'shirts' | 'trousers' | 'knitwear' | 'shoes' | 'accessories';
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Collection;
  price: number;
  compareAt?: number;
  color: 'Beige' | 'Grey' | 'Navy' | 'Brown' | 'Black' | 'Blue' | 'Cream' | 'Olive';
  sizes: string[];
  season: 'Spring / Summer' | 'Autumn / Winter' | 'All Season';
  image: string;
  description: string;
  featured?: boolean;
  badge?: string;
};

// DEMO DATA ONLY. Change products/images here: /public/images/<filename>.
export const products: Product[] = [
  { id: 'BOED-101', slug: 'sand-beige-tailored-suit', name: 'Sand beige tailored two-piece suit', category: 'suits', price: 24500, color: 'Beige', sizes: ['38','40','42','44','46'], season: 'Spring / Summer', image: '/images/suit-beige.svg', featured: true, badge: 'NEW', description: 'A clean modern silhouette with balanced structure, crafted for confident everyday elegance.' },
  { id: 'BOED-102', slug: 'charcoal-pinstripe-suit', name: 'Charcoal pinstripe business suit', category: 'suits', price: 28500, color: 'Grey', sizes: ['38','40','42','44'], season: 'All Season', image: '/images/suit-grey.svg', featured: true, description: 'Sharp lines, subtle texture and effortless versatility for your working wardrobe.' },
  { id: 'BOED-103', slug: 'midnight-navy-two-piece-suit', name: 'Midnight navy two-piece suit', category: 'suits', price: 26900, color: 'Navy', sizes: ['38','40','42','44','46'], season: 'All Season', image: '/images/suit-navy.svg', featured: true, description: 'A timeless navy suit with refined details and a polished modern fit.' },
  { id: 'BOED-104', slug: 'warm-brown-double-breasted-suit', name: 'Warm brown double-breasted suit', category: 'suits', price: 32500, color: 'Brown', sizes: ['40','42','44','46'], season: 'Autumn / Winter', image: '/images/suit-brown.svg', featured: true, badge: 'BEST SELLER', description: 'Contemporary double-breasted tailoring in a rich, versatile brown.' },
  { id: 'BOED-105', slug: 'black-formal-evening-suit', name: 'Black formal evening suit', category: 'suits', price: 35900, color: 'Black', sizes: ['38','40','42','44','46'], season: 'All Season', image: '/images/suit-black.svg', description: 'A formal staple made for timeless celebrations and remarkable evenings.' },
  { id: 'BOED-106', slug: 'stone-summer-linen-suit', name: 'Stone summer linen-blend suit', category: 'suits', price: 24900, color: 'Cream', sizes: ['38','40','42','44'], season: 'Spring / Summer', image: '/images/suit-cream.svg', description: 'Breathable comfort and a softly structured feel for warm days.' },
  { id: 'BOED-107', slug: 'deep-olive-relaxed-suit', name: 'Deep olive relaxed tailoring suit', category: 'suits', price: 27900, color: 'Olive', sizes: ['40','42','44'], season: 'Autumn / Winter', image: '/images/suit-olive.svg', description: 'A distinctive shade with understated elegance and easy movement.' },
  { id: 'BOED-108', slug: 'steel-blue-modern-fit-suit', name: 'Steel blue modern-fit suit', category: 'suits', price: 28900, color: 'Blue', sizes: ['38','40','42','44','46'], season: 'All Season', image: '/images/suit-blue.svg', description: 'Designed to move effortlessly between business and occasion wear.' },
  { id: 'BOED-109', slug: 'heritage-grey-check-suit', name: 'Heritage grey check two-piece suit', category: 'suits', price: 31900, color: 'Grey', sizes: ['40','42','44','46'], season: 'Autumn / Winter', image: '/images/suit-grey.svg', description: 'Heritage-inspired tailoring finished with a smart subtle check.' },
  { id: 'BOED-110', slug: 'navy-occasion-suit', name: 'Navy occasion three-piece suit', category: 'suits', price: 38900, color: 'Navy', sizes: ['38','40','42','44'], season: 'All Season', image: '/images/suit-navy.svg', badge: 'LIMITED', description: 'A versatile three-piece approach to special-occasion dressing.' },
  { id: 'BOED-111', slug: 'beige-unstructured-jacket', name: 'Beige unstructured summer jacket', category: 'jackets', price: 14500, color: 'Beige', sizes: ['38','40','42','44'], season: 'Spring / Summer', image: '/images/suit-beige.svg', featured: true, description: 'Lightweight layers for refined casual outfits.' },
  { id: 'BOED-112', slug: 'dark-blue-denim-shirt', name: 'Dark blue premium cotton shirt', category: 'shirts', price: 4200, color: 'Blue', sizes: ['S','M','L','XL'], season: 'All Season', image: '/images/shirt-blue.svg', featured: true, description: 'Soft breathable cotton with everyday comfort in mind.' },
  { id: 'BOED-113', slug: 'cream-cotton-trousers', name: 'Off-white tailored cotton trousers', category: 'trousers', price: 5900, color: 'Cream', sizes: ['30','32','34','36','38'], season: 'All Season', image: '/images/trousers-cream.svg', featured: true, description: 'Relaxed elegance, versatile styling and a comfortable tailored cut.' },
  { id: 'BOED-114', slug: 'brown-leather-loafers', name: 'Dark brown leather tassel loafers', category: 'shoes', price: 9900, color: 'Brown', sizes: ['39','40','41','42','43','44'], season: 'All Season', image: '/images/shoes-brown.svg', featured: true, description: 'Beautifully considered footwear with enduring style.' },
  { id: 'BOED-115', slug: 'ivory-knit-polo', name: 'Ivory fine-knit polo sweater', category: 'knitwear', price: 6900, color: 'Cream', sizes: ['S','M','L','XL'], season: 'Autumn / Winter', image: '/images/knit-cream.svg', description: 'Exceptionally soft knitwear in a clean classic silhouette.' },
  { id: 'BOED-116', slug: 'midnight-silk-tie', name: 'Midnight blue textured occasion tie', category: 'accessories', price: 2200, color: 'Navy', sizes: ['One size'], season: 'All Season', image: '/images/tie-navy.svg', description: 'A finishing touch for dressier moments.' }
];

export const subcollections = [
  { label: 'Business Suits', tag: 'All Season' },
  { label: 'Classic Tailoring', tag: 'All' },
  { label: 'Premium Fabrics', tag: 'All' },
  { label: 'Striped Suits', tag: 'Grey' },
  { label: 'Eveningwear', tag: 'Black' },
  { label: 'Beige Suits', tag: 'Beige' },
  { label: 'Blue Suits', tag: 'Navy' },
  { label: 'Wedding Suits', tag: 'Cream' },
  { label: 'Grey Suits', tag: 'Grey' },
  { label: 'Summer Suits', tag: 'Spring / Summer' },
  { label: 'Linen Suits', tag: 'Spring / Summer' }
];

export const categoryNames: Record<Collection, string> = {
  suits: 'Suits', jackets: 'Jackets', shirts: 'Shirts', trousers: 'Trousers',
  knitwear: 'Knitwear', shoes: 'Shoes', accessories: 'Accessories'
};

export const categoryDescription: Record<Collection, string> = {
  suits: 'Modern tailoring designed to reflect your individuality. Discover refined silhouettes for every occasion.',
  jackets: 'Effortless layers, thoughtful details and impeccable balance.',
  shirts: 'Essential shirts for confident, considered dressing.',
  trousers: 'Relaxed elegance, made for every day.',
  knitwear: 'Modern comfort in soft textures and classic tones.',
  shoes: 'Finishing touches for a well-appointed wardrobe.',
  accessories: 'Small details. Lasting impressions.'
};

export function formatPrice(n: number) {
  return `৳${n.toLocaleString('en-BD')}`;
}

export function productBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}
