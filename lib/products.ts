export type Collection = 'suits' | 'jackets' | 'shirts' | 'trousers' | 'knitwear' | 'shoes' | 'accessories';
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Collection;
  price: number | null;
  compareAt?: number;
  color: string;
  sizes: string[];
  season: string;
  images: string[];
  sourceCategory: string;
  needsReview: boolean;
  image: string;
  description: string;
  featured?: boolean;
  badge?: string;
};

import catalog from '@/public/boed_static_public/products.json';

function collectionFor(category: string): Collection {
  if (/Shoes/.test(category)) return 'shoes';
  if (/Trousers|Swimwear/.test(category)) return 'trousers';
  if (/Knitwear|Homewear/.test(category)) return 'knitwear';
  if (/Shirts/.test(category)) return 'shirts';
  if (/Jackets|Outerwear|Waistcoats/.test(category)) return 'jackets';
  if (/Suits|Tuxedos/.test(category)) return 'suits';
  return 'accessories';
}
const localMedia = (path: string) => path ? `/boed_static_public${path}` : '';
export const products: Product[] = catalog.products.filter((item) => Boolean(item.image?.trim()) && item.images.some((image) => image.trim())).map((item, index) => ({
  id: item.id, slug: item.slug, name: item.name,
  category: collectionFor(item.category), sourceCategory: item.category,
  price: item.price, color: item.name.match(/\b(Beige|Grey|Navy|Brown|Black|Blue|Cream|Olive|White|Green|Burgundy|Almond)\b/i)?.[0] || 'Not specified',
  sizes: item.sizes, season: 'Not specified', image: localMedia(item.image || ''),
  images: item.images.map(localMedia), needsReview: item.needsReview,
  description: item.description || '', featured: index < 8,
}));
export function collectionImage(category: Collection) {
  return products.find(p => p.category === category && p.image)?.image || '';
}

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

export function formatPrice(n: number | null) {
  return n === null ? 'Price on request' : `BDT ${n.toLocaleString('en-BD')}`;
}

export function productBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}
