import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface CartItem {
  productId: string;
  productName: string;
  variantName: string;
  sku?: string;
  price: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItems: (items: CartItem[]) => void;
  removeItem: (productId: string, variantName: string) => void;
  updateQuantity: (productId: string, variantName: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "maxir-cart";

const loadCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItems = useCallback((newItems: CartItem[]) => {
    setItems((prev) => {
      const next = [...prev];
      for (const item of newItems) {
        const idx = next.findIndex(
          (i) => i.productId === item.productId && i.variantName === item.variantName
        );
        if (idx >= 0) {
          next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
        } else {
          next.push({ ...item });
        }
      }
      return next;
    });
  }, []);

  const removeItem = useCallback((productId: string, variantName: string) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.variantName === variantName)));
  }, []);

  const updateQuantity = useCallback((productId: string, variantName: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.variantName === variantName
          ? { ...i, quantity: Math.max(1, quantity) }
          : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItems, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
