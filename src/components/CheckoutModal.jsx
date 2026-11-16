import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Smartphone, X } from "lucide-react";
import { Spinner } from "./ui.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useModalBehavior } from "../hooks/useModalBehavior.js";
import { api } from "../services/api.js";
import { formatKES, isEmail, isKenyanPhone } from "../utils/format.js";

const EMPTY = { customer_name: "", customer_email: "", customer_phone: "", instructions: "", website: "" };

// Checkout pop-up: a box centred on the page over a blurred background.
export default function CheckoutModal() {
  const cart = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { checkoutOpen: open, setCheckoutOpen } = cart;

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [paying, setPaying] = useState(false);

  const close = () => {
    if (!paying) setCheckoutOpen(false);
  };
  useModalBehavior(open, close);

  // Close when the page changes (e.g. browser back button).
  useEffect(() => {
    setCheckoutOpen(false);
  }, [pathname, setCheckoutOpen]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (form.customer_name.trim().length < 2) e.customer_name = "Enter your full name.";
    if (!isEmail(form.customer_email)) e.customer_email = "Enter a valid email address.";
    if (!isKenyanPhone(form.customer_phone)) e.customer_phone = "Enter a Safaricom number, e.g. 0712 345 678.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setPaying(true);
    try {
      const res = await api.post("/orders", {
        ...form,
        items: cart.items.map((i) => ({ service_id: i.id, quantity: i.quantity })),
      });
      setCheckoutOpen(false);
      cart.clear();
      setForm(EMPTY);
      if (res.payment_status === "failed") toast.error(res.message);
      else toast.success("Order created. Sending the M-Pesa request…");
      navigate(`/order/${res.reference}`);
    } catch (e) {
      toast.error(e.message);
      if (e.details?.length) setErrors(Object.fromEntries(e.details.map((d) => [d.field, d.message])));
    } finally {
      setPaying(false);
    }
  };

  const Err = ({ k }) => (errors[k] ? <p className="mt-1 text-xs text-rose-400" role="alert">{errors[k]}</p> : null);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="checkout-modal"
          className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/40 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Checkout"
            className="my-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border bg-[var(--bg)] shadow-2xl"
            style={{ borderColor: "var(--glass-border)", maxHeight: "calc(100vh - 2rem)" }}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--glass-border)" }}>
              <h2 className="font-display text-lg font-bold">Checkout</h2>
              <button onClick={close} aria-label="Close checkout" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>

            {!cart.items.length ? (
              <div className="p-10 text-center">
                <p className="font-semibold">Your cart is empty</p>
                <Link to="/#services" onClick={close} className="btn-primary mt-4">
                  Browse services
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 overflow-y-auto p-5 md:grid-cols-[1.3fr_1fr]">
                <form onSubmit={submit} className="space-y-4" noValidate>
                  <div>
                    <label className="mb-1 block text-sm font-medium" htmlFor="k-name">Full name *</label>
                    <input id="k-name" className="field" value={form.customer_name} onChange={set("customer_name")} autoComplete="name" />
                    <Err k="customer_name" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium" htmlFor="k-email">Email *</label>
                    <input id="k-email" type="email" className="field" value={form.customer_email} onChange={set("customer_email")} autoComplete="email" />
                    <Err k="customer_email" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium" htmlFor="k-phone">M-Pesa phone number *</label>
                    <input id="k-phone" type="tel" inputMode="tel" className="field" placeholder="0712 345 678" value={form.customer_phone} onChange={set("customer_phone")} autoComplete="tel" />
                    <Err k="customer_phone" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium" htmlFor="k-notes">Additional instructions or project requirements</label>
                    <textarea id="k-notes" rows={3} className="field" value={form.instructions} onChange={set("instructions")} />
                  </div>
                  <div className="absolute -left-[9999px]" aria-hidden="true">
                    <label>Website <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} /></label>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={close} disabled={paying} className="glass rounded-xl px-5 py-2 text-sm font-medium disabled:opacity-50">
                      Cancel
                    </button>
                    <button className="btn-primary flex-1" disabled={paying}>
                      {paying ? <Spinner /> : <Smartphone className="h-4 w-4" />} Pay with M-Pesa
                    </button>
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    You will receive an M-Pesa prompt on your phone. Your order is confirmed only after M-Pesa confirms the payment.
                  </p>
                </form>

                <aside className="glass h-fit p-5" aria-label="Order summary">
                  <h3 className="font-display font-bold">Order summary</h3>
                  <ul className="mt-3 space-y-3 text-sm">
                    {cart.items.map((i) => (
                      <li key={i.id} className="flex justify-between gap-3">
                        <span>{i.title}{i.quantity > 1 && ` × ${i.quantity}`}</span>
                        <span className="font-semibold">{formatKES(i.price * i.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold" style={{ borderColor: "var(--glass-border)" }}>
                    <span>Total</span>
                    <span>{formatKES(cart.total)}</span>
                  </div>
                  <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>The final amount is recalculated securely by the server.</p>
                </aside>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}