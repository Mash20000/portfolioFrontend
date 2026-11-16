import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useModalBehavior } from "../hooks/useModalBehavior.js";
import { formatKES } from "../utils/format.js";

// Cart pop-up: a box centred on the page over a blurred background.
// Click outside, press Escape, or go to another page to close it.
export default function CartDrawer() {
  const { items, open, setOpen, setCheckoutOpen, setQty, remove, clear, total } = useCart();
  const close = () => setOpen(false);
  const { pathname } = useLocation();

  useModalBehavior(open, () => setOpen(false));

  // Safety net: always close when the page changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  const proceed = () => {
    setOpen(false); // close the cart...
    setCheckoutOpen(true); // ...and open the checkout box
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cart-modal"
          className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border bg-[var(--bg)] shadow-2xl"
            style={{ borderColor: "var(--glass-border)", maxHeight: "calc(100vh - 2rem)" }}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--glass-border)" }}>
              <h2 className="font-display text-lg font-bold">Your cart</h2>
              <button onClick={close} aria-label="Close cart" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
                <ShoppingBag className="h-10 w-10 opacity-50" />
                <p className="font-semibold">Your cart is empty</p>
                <Link to="/#services" onClick={close} className="btn-primary">
                  Browse services
                </Link>
              </div>
            ) : (
              <>
                <ul className="space-y-3 overflow-y-auto p-5">
                  {items.map((i) => (
                    <li key={i.id} className="glass p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{i.title}</p>
                          <p className="text-xs" style={{ color: "var(--muted)" }}>
                            {i.is_starting_price && "From "}
                            {formatKES(i.price)}
                            {i.allow_quantity && i.quantity_label ? ` / ${i.quantity_label.replace(/s$/, "")}` : ""}
                          </p>
                        </div>
                        <button onClick={() => remove(i.id)} aria-label={`Remove ${i.title}`} className="opacity-70 hover:text-rose-400 hover:opacity-100">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        {i.allow_quantity ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => setQty(i.id, i.quantity - 1)} aria-label="Decrease quantity" className="glass grid h-7 w-7 place-items-center rounded-lg">
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-7 text-center text-sm font-semibold" aria-live="polite">
                              {i.quantity}
                            </span>
                            <button onClick={() => setQty(i.id, i.quantity + 1)} aria-label="Increase quantity" className="glass grid h-7 w-7 place-items-center rounded-lg">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: "var(--muted)" }}>
                            Qty 1
                          </span>
                        )}
                        <span className="text-sm font-semibold">{formatKES(i.price * i.quantity)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="space-y-2 border-t p-5" style={{ borderColor: "var(--glass-border)" }}>
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatKES(total)}</span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Prices are starting estimates. The final amount is confirmed at checkout.
                  </p>
                  <button onClick={proceed} className="btn-primary w-full">
                    Proceed to checkout
                  </button>
                  <button type="button" onClick={clear} className="glass flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium hover:text-rose-400">
                    <Trash2 className="h-4 w-4" /> Clear cart
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}