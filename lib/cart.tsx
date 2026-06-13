"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type CartVariant = { size: string; price: number };

export type CartItem = {
  productId: string;
  name: string;
  nameBg: string;
  brand: string;
  slug: string;
  image: string;
  size: string;
  price: number;
  qty: number;
  variants: CartVariant[];
};

type CartContextType = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (productId: string, size: string) => void;
  setQty: (productId: string, size: string, qty: number) => void;
  setSize: (productId: string, oldSize: string, newSize: string, newPrice: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "pp_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  // Persist
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, loaded]);

  const add: CartContextType["add"] = useCallback((item, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.productId === item.productId && i.size === item.size);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
        return copy;
      }
      return [...prev, { ...item, qty }];
    });
    setOpen(true);
  }, []);

  const remove: CartContextType["remove"] = useCallback((productId, size) => {
    setItems(prev => prev.filter(i => !(i.productId === productId && i.size === size)));
  }, []);

  const setQty: CartContextType["setQty"] = useCallback((productId, size, qty) => {
    setItems(prev =>
      prev
        .map(i => (i.productId === productId && i.size === size ? { ...i, qty } : i))
        .filter(i => i.qty > 0)
    );
  }, []);

  const setSize: CartContextType["setSize"] = useCallback((productId, oldSize, newSize, newPrice) => {
    setItems(prev => {
      // If the new size already exists as a line, merge; else just change this line
      const existing = prev.find(i => i.productId === productId && i.size === newSize);
      const current = prev.find(i => i.productId === productId && i.size === oldSize);
      if (!current) return prev;
      if (existing) {
        return prev
          .map(i => (i.productId === productId && i.size === newSize ? { ...i, qty: i.qty + current.qty } : i))
          .filter(i => !(i.productId === productId && i.size === oldSize));
      }
      return prev.map(i =>
        i.productId === productId && i.size === oldSize ? { ...i, size: newSize, price: newPrice } : i
      );
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = Math.round(items.reduce((s, i) => s + i.price * i.qty, 0) * 100) / 100;

  return (
    <CartContext.Provider value={{ items, count, total, add, remove, setQty, setSize, clear, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
