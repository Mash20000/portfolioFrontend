import { useCallback, useEffect, useState } from "react";
import { adminApi } from "../services/adminApi.js";
import { EmptyState, ErrorState, Skeleton } from "../components/ui.jsx";
import { PageTitle, Pager } from "./ui.jsx";
import { formatDateTime } from "../utils/format.js";

export default function ActivityAdmin() {
  const [state, setState] = useState({ items: [], total: 0, loading: true, error: null });
  const [page, setPage] = useState(1);
  const limit = 25;

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const r = await adminApi.get(`/activity?page=${page}&limit=${limit}`);
      setState({ items: r.items, total: r.total, loading: false, error: null });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <PageTitle title="Activity log" />
      {state.error && <ErrorState message={state.error} onRetry={load} />}
      {state.loading && !state.items.length && <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>}
      {!state.loading && !state.error && !state.items.length && <EmptyState title="No activity yet" text="Important content and order changes are recorded here." />}
      {state.items.length > 0 && (
        <div className="glass overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide" style={{ borderColor: "var(--glass-border)", color: "var(--muted)" }}>
                <th className="p-3">When</th><th className="p-3">Action</th><th className="p-3">Item</th><th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {state.items.map((a) => (
                <tr key={a.id} className="border-b last:border-0" style={{ borderColor: "var(--glass-border)" }}>
                  <td className="whitespace-nowrap p-3">{formatDateTime(a.created_at)}</td>
                  <td className="p-3 font-mono text-xs">{a.action}</td>
                  <td className="max-w-[10rem] truncate p-3 text-xs" title={a.entity_id || ""}>{a.entity}{a.entity_id ? ` · ${a.entity_id}` : ""}</td>
                  <td className="max-w-xs truncate p-3 text-xs" style={{ color: "var(--muted)" }} title={a.details ? JSON.stringify(a.details) : ""}>{a.details ? JSON.stringify(a.details) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={page} total={state.total} limit={limit} onChange={setPage} />
    </div>
  );
}
