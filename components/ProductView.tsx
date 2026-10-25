'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/lib/products';
import { categoryNames, formatPrice, products } from '@/lib/products';
import { useStore } from './StoreProvider';
import { ProductCard } from './ProductCard';
import { Icon } from './Icons';

export function ProductView({ product }: { product: Product }) {
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error,setError] = useState('');
  const [openDetail,setOpenDetail] = useState('Details & care');
  const { addToCart, favorites, toggleFavorite } = useStore();
  const recommended = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const add = () => {
    if (product.price === null || !product.sizes.length) return;
    if (!size) { setError('Please select a size.'); return; }
    setError(''); addToCart(product.id, size, quantity);
  };
  return <>
    <div className="product-page"><div className="product-gallery">{product.images.length ? product.images.map((image, index) => <div className={index === 0 ? 'product-gallery-primary' : 'product-gallery-secondary'} key={image}><img src={image} loading={index === 0 ? 'eager' : 'lazy'} alt={`${product.name} ? view ${index + 1}`}/></div>) : <div className="image-unavailable">Product images coming soon</div>}</div>
      <div className="product-detail"><div className="breadcrumbs"><Link href="/">Home</Link> / <Link href={`/collections/${product.category}`}>{categoryNames[product.category]}</Link> / {product.name}</div>
        {product.badge && <span className="detail-badge">{product.badge}</span>}
        <h1>{product.name}</h1><p className="detail-price">{formatPrice(product.price)}</p><p className="detail-description">{product.description}</p><p className="detail-color"><b>COLOR:</b> {product.color}</p>
        {!product.sizes.length && <p className="catalog-notice">Size and availability will be confirmed soon.</p>}<div className="detail-size-heading"><b>SELECT SIZE</b><button onClick={() => setError('Size guide coming soon.')}>Size guide</button></div>
        <div className="detail-sizes">{product.sizes.map((option) => <button className={size === option ? 'selected-size' : ''} key={option} onClick={() => { setSize(option); setError(''); }} aria-pressed={size === option}>{option}</button>)}</div>{error && <p className="size-error">{error}</p>}
        <div className="detail-actions"><div className="detail-quantity"><button aria-label="Decrease" onClick={() => setQuantity((q) => Math.max(1,q-1))}><Icon name="minus" size={15}/></button>{quantity}<button aria-label="Increase" onClick={() => setQuantity((q) => Math.min(10,q+1))}><Icon name="plus" size={15}/></button></div><button className="dark-button add-bag" disabled={product.price === null || !product.sizes.length} onClick={add}>{product.price === null ? 'PRICE ON REQUEST' : !product.sizes.length ? 'AVAILABILITY COMING SOON' : `ADD TO BAG - ${formatPrice(product.price * quantity)}`}</button><button className="detail-save" aria-label="Save item" aria-pressed={favorites.includes(product.id)} onClick={() => toggleFavorite(product.id)}><Icon name="bookmark" size={21} fill={favorites.includes(product.id) ? 'currentColor' : 'none'}/></button></div>
        <p className="detail-delivery"><Icon name="truck" size={18}/> Delivery available across Bangladesh. Demo product — no payment is processed.</p>
        <div className="detail-accordions">{[['Details & care', `${product.description} Fabric composition and care instructions are awaiting confirmation.`],['Delivery & returns','Delivery pricing and return terms will be configured when the store is connected to real services.'],['About Aura BOED','A contemporary label for modern wardrobes and timeless design.']].map(([title,description]) => <div key={title}><button onClick={() => setOpenDetail(openDetail === title ? '' : title)}>{title}<Icon name={openDetail === title ? 'minus' : 'plus'} size={18}/></button>{openDetail === title && <p>{description}</p>}</div>)}</div>
      </div>
    </div>
    {recommended.length > 0 && <section className="recommended-section section-gutter"><div className="section-heading"><h2>You may also like</h2><Link className="text-link" href={`/collections/${product.category}`}>VIEW COLLECTION <Icon name="arrow-right" size={17}/></Link></div><div className="home-product-grid">{recommended.map((p) => <ProductCard product={p} key={p.id}/>)}</div></section>}
  </>;
}
