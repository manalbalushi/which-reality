"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CartItem, CartLineProduct, GiftStyle, Personalization } from "./types";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addProduct: (productId: string, quantity: number, unitPrice: number) => void;
  addGiftBuild: (build: {
    recipient: string;
    occasion: string;
    budget: number;
    style: GiftStyle;
    packagingId: string;
    products: CartLineProduct[];
    personalization: Personalization;
    unitPrice: number;
  }) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "nora-cart";

function genId() {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // Deferred to after mount so the client's first render matches the server (no localStorage during SSR).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addProduct: CartContextValue["addProduct"] = (productId, quantity, unitPrice) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.kind === "product" && i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        { id: genId(), kind: "product", productId, quantity, unitPrice },
      ];
    });
  };

  const addGiftBuild: CartContextValue["addGiftBuild"] = (build) => {
    setItems((prev) => [
      ...prev,
      { id: genId(), kind: "gift-build", quantity: 1, ...build },
    ]);
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clear = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [items]
  );
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const value: CartContextValue = {
    items,
    count,
    subtotal,
    addProduct,
    addGiftBuild,
    updateQuantity,
    removeItem,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
