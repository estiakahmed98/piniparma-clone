'use client';

import Link from 'next/link';
import type { Product } from '@/lib/products';
import { formatPrice } from '@/lib/products';
import { useStore } from './StoreProvider';
import { Icon } from './Icons';

export function ProductCard({ product }: { product: Product }) {
  const { favorites, toggleFavorite } = useStore();
  const liked = favorites.includes(product.id);
  return <article className="product-card">
    <div className="product-media">
      <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
        
        {product.image ? <img src={product.image} alt={product.name} loading="lazy" /> : <div className="image-unavailable">Image coming soon</div>}
      </Link>
      {product.badge && <span className="product-badge">{product.badge}</span>}
      <button className={`favorite-button ${liked ? 'is-active' : ''}`} aria-label={liked ? 'Remove from saved items' : 'Save to favorites'} aria-pressed={liked} onClick={() => toggleFavorite(product.id)}>
        <Icon name="bookmark" size={18} fill={liked ? 'currentColor' : 'none'}/>
      </button>
      <Link className="quick-view" href={`/products/${product.slug}`}>Discover product</Link>
    </div>
    <div className="product-meta">
      <Link href={`/products/${product.slug}`} className="product-name">{product.name}</Link>
      <div className="product-price">{formatPrice(product.price)}{product.compareAt && <del>{formatPrice(product.compareAt)}</del>}</div>
      <span className="product-color">{product.color} · Aura BOED Collection</span>
    </div>
  </article>;
}
