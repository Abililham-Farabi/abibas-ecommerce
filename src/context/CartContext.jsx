import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const KEY = 'abibas_cart_v1';

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* abaikan */
    }
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addItem(product, size, qty = 1) {
        const key = `${product.productId}__${size}`;
        setItems((prev) => {
          const found = prev.find((i) => i.key === key);
          if (found) {
            return prev.map((i) =>
              i.key === key ? { ...i, qty: i.qty + qty } : i,
            );
          }
          return [
            ...prev,
            {
              key,
              productId: product.productId,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              category: product.category,
              size,
              qty,
            },
          ];
        });
      },
      setQty(key, qty) {
        setItems((prev) =>
          qty <= 0
            ? prev.filter((i) => i.key !== key)
            : prev.map((i) => (i.key === key ? { ...i, qty } : i)),
        );
      },
      removeItem(key) {
        setItems((prev) => prev.filter((i) => i.key !== key));
      },
      clear() {
        setItems([]);
      },
      count: items.reduce((a, i) => a + i.qty, 0),
      subtotal: items.reduce((a, i) => a + i.qty * Number(i.price), 0),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart harus di dalam CartProvider');
  return ctx;
}
