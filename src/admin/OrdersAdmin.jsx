import { useCallback, useEffect, useState } from "react";
import { Eye, Search } from "lucide-react";
import { adminApi } from "../services/adminApi.js";
import { useToast } from "../context/ToastContext.jsx";
import { EmptyState, ErrorState, Skeleton } from "../components/ui.jsx";
import { Badge, Modal, PageTitle, Pager } from "./ui.jsx";
import { formatDateTime, formatKES, statusLabel } from "../utils/format.js";

const PAYMENT = ["pending", "processing", "paid", "failed", "cancelled"];
const FULFILMENT = ["new", "accepted", "in_progress", "completed", "rejected"];

export default function OrdersAdmin() {
  const toast = useToast();
  const [state, setState] = useState({ items: [], total: 0, loading: true, error: null });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState("");
  const [fulfilment, setFulfilment] = useState("");
  const [selected, setSelected] = useState(null);
  const limit = 15;

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const params = new URLSearchParams({ page, limit });
      if (query) params.set("q", query);
      if (payment) params.set("payment_status", payment);
      if (fulfilment) params.set("fulfilment_status", fulfilment);
      const r = await adminApi.get(`/orders?${params}`);
      setState({ items: r.items, total: r.total, loading: false, error: null });
      setSelected((cur) => (cur ? r.items.find((o) => o.id === cur.id) || cur : cur));
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  }, [page, query, payment, fulfilment]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setTimeout(() => { setQuery(q.trim()); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const setStatus = async (order, fulfilment_status) => {
    try {
      await adminApi.patch(`/orders/${order.id}`, { fulfilment_status });
      toast.success("Fulfilment status updated");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const receipt = (o) => (o.payments || []).find((p) => p.status === "paid")?.mpesa_receipt_number;

  return (
    <div>
      <PageTitle title="Orders">
        <label className="relative">
          <span className="sr-only">Search orders</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
          <input className="field w-56 pl-9" placeholder="Reference, name, email, phone" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <select className="field w-auto" aria-label="Filter by payment status" value={payment} onChange={(e) => { setPayment(e.target.value); setPage(1); }}>
          <option value="">All payments</option>
          {PAYMENT.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
        <select className="field w-auto" aria-label="Filter by fulfilment status" value={fulfilment} onChange={(e) => { setFulfilment(e.target.value); setPage(1); }}>
          <option value="">All fulfilment</option>
          {FULFILMENT.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
      </PageTitle>

      {state.error && <ErrorState message={state.error} onRetry={load} />}
      {state.loading && !state.items.length && <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {!state.loading && !state.error && !state.items.length && <EmptyState title="No orders found" text="Orders appear here once customers check out." />}

      {state.items.length > 0 && (
        <div className="glass overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide" style={{ borderColor: "var(--glass-border)", color: "var(--muted)" }}>
                <th className="p-3">Reference</th><th className="p-3">Customer</th><th className="p-3">Total</th><th className="p-3">Payment</th><th className="p-3">M-Pesa receipt</th><th className="p-3">Fulfilment</th><th className="p-3 text-right">View</th>
              </tr>
            </thead>
            <tbody>
              {state.items.map((o) => (
                <tr key={o.id} className="border-b last:border-0" style={{ borderColor: "var(--glass-border)" }}>
                  <td className="p-3 font-mono text-xs">{o.reference}<div style={{ color: "var(--muted)" }}>{formatDateTime(o.created_at)}</div></td>
                  <td className="p-3">{o.customer_name}<div className="text-xs" style={{ color: "var(--muted)" }}>{o.customer_phone}</div></td>
                  <td className="p-3 font-semibold">{formatKES(o.total_kes)}</td>
                  <td className="p-3"><Badge value={o.payment_status} /></td>
                  <td className="p-3 font-mono text-xs">{receipt(o) || "—"}</td>
                  <td className="p-3">
                    <select className="field !py-1.5" aria-label={`Fulfilment status for ${o.reference}`} value={o.fulfilment_status} onChange={(e) => setStatus(o, e.target.value)}>
                      {FULFILMENT.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                    </select>
                  </td>
                  <td className="p-3 text-right"><button onClick={() => setSelected(o)} aria-label={`View order ${o.reference}`} className="opacity-80 hover:text-accent-teal hover:opacity-100"><Eye className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={page} total={state.total} limit={limit} onChange={setPage} />

      {selected && (
        <Modal title={`Order ${selected.reference}`} onClose={() => setSelected(null)}>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4"><dt>Customer</dt><dd>{selected.customer_name}</dd></div>
            <div className="flex justify-between gap-4"><dt>Email</dt><dd><a className="underline" href={`mailto:${selected.customer_email}`}>{selected.customer_email}</a></dd></div>
            <div className="flex justify-between gap-4"><dt>Phone</dt><dd>{selected.customer_phone}</dd></div>
            <div className="flex justify-between gap-4"><dt>Placed</dt><dd>{formatDateTime(selected.created_at)}</dd></div>
            <div className="flex justify-between gap-4"><dt>Payment</dt><dd><Badge value={selected.payment_status} /></dd></div>
            <div className="flex justify-between gap-4"><dt>Fulfilment</dt><dd><Badge value={selected.fulfilment_status} /></dd></div>
          </dl>
          <h3 className="mt-5 font-display font-bold">Services</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {(selected.order_items || []).map((i, k) => (
              <li key={k} className="flex justify-between gap-3"><span>{i.service_title}{i.quantity > 1 && ` × ${i.quantity}`}</span><span>{formatKES(i.line_total_kes)}</span></li>
            ))}
            <li className="flex justify-between border-t pt-2 font-bold" style={{ borderColor: "var(--glass-border)" }}><span>Total</span><span>{formatKES(selected.total_kes)}</span></li>
          </ul>
          {selected.instructions && (
            <>
              <h3 className="mt-5 font-display font-bold">Customer instructions</h3>
              <p className="mt-2 whitespace-pre-line text-sm" style={{ color: "var(--muted)" }}>{selected.instructions}</p>
            </>
          )}
          <h3 className="mt-5 font-display font-bold">Payment attempts</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {(selected.payments || []).length === 0 && <li style={{ color: "var(--muted)" }}>No payment attempts yet.</li>}
            {(selected.payments || []).map((p, k) => (
              <li key={k} className="glass p-3">
                <div className="flex items-center justify-between"><Badge value={p.status} /><span className="text-xs" style={{ color: "var(--muted)" }}>{formatDateTime(p.created_at)}</span></div>
                {p.mpesa_receipt_number && <p className="mt-1 font-mono text-xs">Receipt: {p.mpesa_receipt_number}</p>}
                {p.checkout_request_id && <p className="mt-1 break-all font-mono text-xs" style={{ color: "var(--muted)" }}>{p.checkout_request_id}</p>}
                {p.result_desc && <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{p.result_desc}</p>}
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </div>
  );
}
