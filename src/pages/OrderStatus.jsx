import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import Seo from "../components/Seo.jsx";
import { ErrorState, Skeleton, Spinner } from "../components/ui.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { api } from "../services/api.js";
import { formatKES, statusLabel } from "../utils/format.js";

const OPEN = ["pending", "processing"];

export default function OrderStatus() {
  const { reference } = useParams();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [phone, setPhone] = useState("");
  const timer = useRef();

  const load = useCallback(async () => {
    try {
      setOrder(await api.get(`/orders/${encodeURIComponent(reference)}/status`));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, [reference]);

  useEffect(() => {
    load();
  }, [load]);

  // Poll while the payment is still open. Stops automatically once it is final.
  useEffect(() => {
    if (order && OPEN.includes(order.payment_status)) {
      timer.current = setTimeout(load, 4000);
    }
    return () => clearTimeout(timer.current);
  }, [order, load]);

  const [cancelling, setCancelling] = useState(false);
  const cancel = async () => {
    setCancelling(true);
    try {
      await api.post(`/orders/${encodeURIComponent(reference)}/cancel`, {});
      toast.success("Payment cancelled.");
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const retry = async (e) => {
    e.preventDefault();
    setRetrying(true);
    try {
      const res = await api.post(`/orders/${encodeURIComponent(reference)}/pay`, phone ? { phone } : {});
      toast.success(res.message);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRetrying(false);
    }
  };

  if (error) return <div className="container-page pb-20 pt-36"><ErrorState message={error} onRetry={load} /></div>;
  if (!order) return <div className="container-page pb-20 pt-36"><Skeleton className="mx-auto h-64 max-w-xl" /></div>;

  const s = order.payment_status;
  const view =
    s === "paid"
      ? { Icon: CheckCircle2, color: "text-emerald-400", title: "Payment received", text: "Thank you! Your order is confirmed and I will be in touch shortly." }
      : s === "pending"
      ? { Icon: Clock, color: "text-amber-400", title: "Sending the M-Pesa request…", text: "This usually takes a few seconds. Please keep this page open." }
      : OPEN.includes(s)
      ? { Icon: Clock, color: "text-amber-400", title: "Waiting for M-Pesa", text: `Enter your M-Pesa PIN on the prompt sent to ${order.phone}. This page updates automatically.` }
      : s === "cancelled"
      ? { Icon: XCircle, color: "text-rose-400", title: "Payment cancelled", text: "The M-Pesa prompt was cancelled. You have not been charged." }
      : { Icon: XCircle, color: "text-rose-400", title: "Payment failed", text: order.failure_reason || "The payment did not go through. You have not been charged." };

  return (
    <div className="container-page pb-20 pt-32">
      <Seo title={`Order ${order.reference}`} noindex />
      <div className="glass mx-auto max-w-xl p-8">
        <div className="text-center" role="status" aria-live="polite">
          <view.Icon className={`mx-auto h-14 w-14 ${view.color}`} />
          <h1 className="mt-3 font-display text-2xl font-bold">{view.title}</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>{view.text}</p>
          {OPEN.includes(s) && <Spinner className="mt-4 h-6 w-6" />}
          {OPEN.includes(s) && (
            <div className="mt-4">
              <button type="button" onClick={cancel} disabled={cancelling} className="glass rounded-xl px-5 py-2 text-sm font-medium hover:text-rose-400 disabled:opacity-50">
                {cancelling ? "Cancelling…" : "Cancel payment"}
              </button>
              <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>Already entered your PIN? Please wait instead of cancelling.</p>
            </div>
          )}
        </div>

        <dl className="mt-6 space-y-2 border-t pt-6 text-sm" style={{ borderColor: "var(--glass-border)" }}>
          <div className="flex justify-between"><dt>Order reference</dt><dd className="font-mono font-semibold">{order.reference}</dd></div>
          <div className="flex justify-between"><dt>Payment</dt><dd>{statusLabel(s)}</dd></div>
          <div className="flex justify-between"><dt>Fulfilment</dt><dd>{statusLabel(order.fulfilment_status)}</dd></div>
          {order.mpesa_receipt && <div className="flex justify-between"><dt>M-Pesa receipt</dt><dd className="font-mono">{order.mpesa_receipt}</dd></div>}
        </dl>

        <ul className="mt-4 space-y-2 text-sm">
          {order.items.map((i, k) => (
            <li key={k} className="flex justify-between gap-3">
              <span>{i.service_title}{i.quantity > 1 && ` × ${i.quantity}`}</span>
              <span>{formatKES(i.line_total_kes)}</span>
            </li>
          ))}
          <li className="flex justify-between border-t pt-2 text-base font-bold" style={{ borderColor: "var(--glass-border)" }}>
            <span>Total</span><span>{formatKES(order.total_kes)}</span>
          </li>
        </ul>

        {(s === "failed" || s === "cancelled") && (
          <form onSubmit={retry} className="mt-6 space-y-3">
            <label className="block text-sm font-medium" htmlFor="retry-phone">M-Pesa number (leave blank to use {order.phone})</label>
            <input id="retry-phone" className="field" type="tel" placeholder="0712 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button className="btn-primary w-full" disabled={retrying}>{retrying ? <Spinner /> : null} Try payment again</button>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link to="/" className="underline opacity-80 hover:opacity-100">Back to the website</Link>
        </p>
      </div>
    </div>
  );
}