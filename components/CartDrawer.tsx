'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { products, formatPrice } from '@/lib/products';
import { Icon } from './Icons';
import { useStore } from './StoreProvider';

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateQuantity, removeFromCart, cartSubtotal } = useStore();
  useEffect(() => {
    if (!cartOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setCartOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [cartOpen, setCartOpen]);
  return <>
    {cartOpen && <button type="button" aria-label="Close bag" className="drawer-backdrop" onClick={() => setCartOpen(false)} />}
    <aside className={`side-drawer ${cartOpen ? 'drawer-active' : ''}`} role="dialog" aria-modal="true" aria-label="Shopping bag" aria-hidden={!cartOpen}>
      <div className="drawer-head"><h2>Your bag ({cart.reduce((count, item) => count + item.quantity, 0)})</h2><button aria-label="Close bag" onClick={() => setCartOpen(false)}><Icon name="close" size={23}/></button></div>
      {cart.length === 0 ? <div className="empty-bag"><Icon name="bag" size={36}/><h3>Your bag is empty</h3><p>Discover the pieces that speak to your style.</p><Link href="/collections/suits" onClick={() => setCartOpen(false)} className="dark-button">EXPLORE THE COLLECTION</Link></div> : <>
        <div className="drawer-items">
          {cart.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) return null;
            return <div className="drawer-item" key={`${item.productId}-${item.size}`}>
              <Link href={`/products/${product.slug}`} onClick={() => setCartOpen(false)}><img src={product.image} alt={product.name}/></Link>
              <div className="drawer-item-info"><Link href={`/products/${product.slug}`} onClick={() => setCartOpen(false)}>{product.name}</Link><span>Size: {item.size} · {product.color}</span><span>{formatPrice(product.price)}</span>
                <div className="qty-controls"><button aria-label="Decrease quantity" onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}><Icon name="minus" size={14}/></button><strong>{item.quantity}</strong><button aria-label="Increase quantity" onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}><Icon name="plus" size={14}/></button></div>
                <button className="remove-item" onClick={() => removeFromCart(item.productId, item.size)}>Remove</button>
              </div>
            </div>;
          })}
        </div>
        <div className="drawer-footer"><div><span>SUBTOTAL</span><strong>{formatPrice(cartSubtotal)}</strong></div><p>Shipping calculated at checkout. This is a showcase demo.</p><button className="dark-button" onClick={() => alert('Demo only — checkout is not connected to a payment gateway or database.')}>CHECKOUT — DEMO ONLY</button><button className="secondary-button" onClick={() => setCartOpen(false)}>Continue shopping</button></div>
      </>}
    </aside>
  </>;
}
