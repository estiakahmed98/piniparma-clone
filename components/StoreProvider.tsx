'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type CartItem = { productId: string; size: string; quantity: number };
type StoreContextValue = {
  cart: CartItem[];
  favorites: string[];
  cartOpen: boolean;
  setCartOpen: (value: boolean) => void;
  addToCart: (id: string, size: string, quantity?: number) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  removeFromCart: (id: string, size: string) => void;
  toggleFavorite: (id: string) => void;
  cartCount: number;
  cartSubtotal: number;
};

const StoreContext = createContext<StoreContextValue | null>(null);
const CART_STORAGE = 'boed-demo-cart-v1';
const FAVORITES_STORAGE = 'boed-demo-favorites-v1';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE) || '[]');
      const savedFavorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE) || '[]');
      if (Array.isArray(savedCart)) setCart(savedCart.filter((item) => typeof item.productId === 'string' && typeof item.size === 'string' && Number.isInteger(item.quantity) && item.quantity > 0));
      if (Array.isArray(savedFavorites)) setFavorites(savedFavorites.filter((id) => typeof id === 'string'));
    } catch { /* invalid demo storage: start fresh */ }
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) localStorage.setItem(CART_STORAGE, JSON.stringify(cart)); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem(FAVORITES_STORAGE, JSON.stringify(favorites)); }, [favorites, hydrated]);

  const addToCart = (id: string, size: string, quantity = 1) => {
    setCart((current) => {
      const exists = current.find((item) => item.productId === id && item.size === size);
      if (exists) return current.map((item) => item === exists ? { ...item, quantity: item.quantity + quantity } : item);
      return [...current, { productId: id, size, quantity }];
    });
    setCartOpen(true);
  };
  const updateQuantity = (id: string, size: string, quantity: number) => {
    setCart((current) => current.map((item) => item.productId === id && item.size === size ? { ...item, quantity } : item).filter((item) => item.quantity > 0));
  };
  const removeFromCart = (id: string, size: string) => setCart((current) => current.filter((item) => !(item.productId === id && item.size === size)));
  const toggleFavorite = (id: string) => setFavorites((current) => current.includes(id) ? current.filter((saved) => saved !== id) : [...current, id]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartSubtotal = useMemo(() => cart.reduce((sum, item) => {
    const product = productMap[item.productId];
    return sum + (product?.price || 0) * item.quantity;
  }, 0), [cart]);

  return <StoreContext.Provider value={{ cart, favorites, cartOpen, setCartOpen, addToCart, updateQuantity, removeFromCart, toggleFavorite, cartCount, cartSubtotal }}>{children}</StoreContext.Provider>;
}

// Import product data normally; this small lookup avoids storage-side price calculations.
import { products } from '@/lib/products';
const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore requires StoreProvider');
  return store;
}
