import { useCallback, useEffect, useState } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { adminApi } from "../services/adminApi.js";
import { useToast } from "../context/ToastContext.jsx";
import { EmptyState, ErrorState, Skeleton } from "../components/ui.jsx";
import { Badge, PageTitle, Pager } from "./ui.jsx";
import { formatDateTime, statusLabel } from "../utils/format.js";

const STATUSES = ["new", "read", "replied", "closed", "spam"];

export default function InquiriesAdmin() {
  const toast = useToast();
  const [state, setState] = useState({ items: [], total: 0, loading: true, error: null });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [openId, setOpenId] = useState(null);
  const limit = 15;

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.set("status", status);
      const r = await adminApi.get(`/inquiries?${params}`);
      setState({ items: r.items, total: r.total, loading: false, error: null });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const patch = async (id, body, msg) => {
    try {
      await adminApi.patch(`/inquiries/${id}`, body);
      if (msg) toast.success(msg);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const remove = async (i) => {
    if (!window.confirm(`Delete the inquiry from ${i.name}? This cannot be undone.`)) return;
    try {
      await adminApi.delete(`/inquiries/${i.id}`);
      toast.success("Inquiry deleted");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const toggleOpen = (i) => {
    setOpenId(openId === i.id ? null : i.id);
    if (!i.is_read) patch(i.id, { is_read: true });
  };

  return (
    <div>
      <PageTitle title="Customer inquiries">
        <select className="field w-auto" aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
      </PageTitle>

      {state.error && <ErrorState message={state.error} onRetry={load} />}
      {state.loading && !state.items.length && <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>}
      {!state.loading && !state.error && !state.items.length && <EmptyState title="No inquiries" text="Contact form submissions will appear here." />}

      <ul className="space-y-3">
        {state.items.map((i) => (
          <li key={i.id} className="glass p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <button className="flex flex-1 items-start gap-3 text-left" onClick={() => toggleOpen(i)} aria-expanded={openId === i.id}>
                {i.is_read ? <MailOpen className="mt-1 h-5 w-5 shrink-0 opacity-60" /> : <Mail className="mt-1 h-5 w-5 shrink-0 text-accent-teal" />}
                <span>
                  <span className={`block ${i.is_read ? "" : "font-bold"}`}>{i.name} <span className="font-normal" style={{ color: "var(--muted)" }}>· {i.email}</span></span>
                  <span className="block text-xs" style={{ color: "var(--muted)" }}>{formatDateTime(i.created_at)}{i.service_interest && ` · ${i.service_interest}`}{i.budget_range && ` · ${i.budget_range}`}</span>
                </span>
              </button>
              <div className="flex items-center gap-2">
                <Badge value={i.status} />
                <select className="field !w-auto !py-1.5" aria-label={`Status for inquiry from ${i.name}`} value={i.status} onChange={(e) => patch(i.id, { status: e.target.value }, "Status updated")}>
                  {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                </select>
                <button onClick={() => remove(i)} aria-label={`Delete inquiry from ${i.name}`} className="opacity-70 hover:text-rose-400 hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            {openId === i.id && (
              <div className="mt-4 border-t pt-4 text-sm" style={{ borderColor: "var(--glass-border)" }}>
                <p className="whitespace-pre-line">{i.message}</p>
                <p className="mt-3 flex flex-wrap gap-4" style={{ color: "var(--muted)" }}>
                  <a className="underline" href={`mailto:${i.email}?subject=${encodeURIComponent("Re: your inquiry")}`}>Reply by email</a>
                  {i.phone && <a className="underline" href={`https://wa.me/${String(i.phone).replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">WhatsApp {i.phone}</a>}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
      <Pager page={page} total={state.total} limit={limit} onChange={setPage} />
    </div>
  );
}
