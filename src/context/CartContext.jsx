import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useToast } from "./ToastContext.jsx";

const CartContext = createContext(null);
const KEY = "cart_v1";

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const toast = useToast();
  const [items, setItems] = useState(load);
  const [open, setOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Persist so the cart survives a refresh. Prices here are for DISPLAY only:
  // the server recalculates every total from the database at checkout.
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  const add = (service) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === service.id);
      if (found) {
        return prev.map((i) =>
          i.id === service.id ? { ...i, quantity: service.allow_quantity ? Math.min(i.quantity + 1, 100) : 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: service.id,
          title: service.title,
          price: Number(service.price_kes),
          is_starting_price: service.is_starting_price,
          allow_quantity: service.allow_quantity,
          quantity_label: service.quantity_label,
          quantity: 1,
        },
      ];
    });
    toast.success(`${service.title} added to your cart`);
  };

  const setQty = (id, quantity) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, Math.min(100, quantity || 1)) } : i))
    );
  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      total: items.reduce((s, i) => s + i.price * i.quantity, 0),
      add,
      setQty,
      remove,
      clear,
      open,
      setOpen,
      checkoutOpen,
      setCheckoutOpen,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, open, checkoutOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);