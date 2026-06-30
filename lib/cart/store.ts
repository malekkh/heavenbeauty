"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  /** Unit price in the cart's country currency. */
  price: number;
  qty: number;
}

interface CartState {
  /** Country the cart's prices/currency belong to. */
  country: string;
  items: CartItem[];
  hasHydrated: boolean;
  addItem: (item: Omit<CartItem, "qty">, country: string, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      country: "",
      items: [],
      hasHydrated: false,

      addItem: (item, country, qty = 1) => {
        const state = get();
        // Cart is single-currency: switching country resets it so subtotals
        // are never a mix of currencies.
        if (state.country && state.country !== country) {
          set({ country, items: [{ ...item, qty }] });
          return;
        }
        const existing = state.items.find((i) => i.productId === item.productId);
        if (existing) {
          set({
            country,
            items: state.items.map((i) =>
              i.productId === item.productId ? { ...i, qty: i.qty + qty } : i
            ),
          });
        } else {
          set({ country, items: [...state.items, { ...item, qty }] });
        }
      },

      removeItem: (productId) =>
        set((s) => ({
          items: s.items.filter((i) => i.productId !== productId),
        })),

      updateQty: (productId, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.productId !== productId)
              : s.items.map((i) =>
                  i.productId === productId ? { ...i, qty } : i
                ),
        })),

      clear: () => set({ items: [] }),

      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "heaven-cart",
      version: 1,
      partialize: (s) => ({ country: s.country, items: s.items }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);

/** Total number of units in the cart. */
export const selectCount = (s: CartState) =>
  s.items.reduce((n, i) => n + i.qty, 0);

/** Subtotal in the cart's country currency. */
export const selectSubtotal = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.price * i.qty, 0);
