
'use client';

import { useState, useEffect } from 'react';

interface CartStore {
  cartCount: number;
  setCartCount: (count: number) => void;
  incrementCartCount: () => void;
  decrementCartCount: () => void;
}

// Create a simple store
let globalCartCount = 0;
const listeners: Set<(count: number) => void> = new Set();

export const cartStore: CartStore = {
  get cartCount() {
    return globalCartCount;
  },
  setCartCount(count: number) {
    if (globalCartCount !== count) {
      globalCartCount = count;
      listeners.forEach(listener => listener(count));
    }
  },
  incrementCartCount() {
    globalCartCount += 1;
    listeners.forEach(listener => listener(globalCartCount));
  },
  decrementCartCount() {
    globalCartCount = Math.max(0, globalCartCount - 1);
    listeners.forEach(listener => listener(globalCartCount));
  },
};

export function useCartStore(): number {
  const [count, setCount] = useState(globalCartCount);

  useEffect(() => {
    const listener = (newCount: number) => setCount(newCount);
    listeners.add(listener);
    
    // Cleanup
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return count;
}