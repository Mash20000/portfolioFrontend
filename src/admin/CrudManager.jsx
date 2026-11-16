import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { adminApi } from "../services/adminApi.js";
import { useToast } from "../context/ToastContext.jsx";
import { EmptyState, ErrorState, Skeleton, Spinner } from "../components/ui.jsx";
import { Badge, Field, Modal, PageTitle, Pager } from "./ui.jsx";

// Convert a stored record into form state, and form state back into an API payload.
const toForm = (fields, rec) =>
  Object.fromEntries(
    fields.map((f) => {
      let v = rec?.[f.key] ?? f.default ?? (f.type === "checkbox" ? false : "");
      if (f.type === "lines" && Array.isArray(v)) v = v.join("\n");
      if (f.type === "tags" && Array.isArray(v)) v = v.join(", ");
      return [f.key, v];
    })
  );

export const toPayload = (fields, form) =>
  Object.fromEntries(
    fields.map((f) => {
      let v = form[f.key];
      if (f.type === "lines") v = String(v).split("\n").map((s) => s.trim()).filter(Boolean);
      else if (f.type === "tags") v = String(v).split(",").map((s) => s.trim()).filter(Boolean);
      else if (f.type === "number") v = v === "" ? (f.nullable ? null : 0) : Number(v);
      return [f.key, v];
    })
  );

/**
 * Generic list + create/edit/delete screen for a content table.
 * resource: admin API resource name | columns: [{label, render(row)}] | fields: form fields
 */
export default function CrudManager({ title, resource, noun, columns, fields, searchable = true, optionsFrom = {}, children }) {
  const toast = useToast();
  const [state, setState] = useState({ items: [], total: 0, loading: true, error: null });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | record
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState({});
  const limit = 20;

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const params = new URLSearchParams({ page, limit });
      if (query) params.set("q", query);
      const res = await adminApi.get(`/${resource}?${params}`);
      setState({ items: res.items, total: res.total, loading: false, error: null });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  }, [resource, page, query]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => { setQuery(q.trim()); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [q]);

  // dropdown options that come from other tables (e.g. categories)
  useEffect(() => {
    Object.entries(optionsFrom).forEach(([key, res]) => {
      adminApi.get(`/${res}?limit=100`).then((r) => setOptions((o) => ({ ...o, [key]: r.items.map((i) => ({ value: i.id, label: i.name })) }))).catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = (rec) => { setEditing(rec); setForm(toForm(fields, rec === "new" ? null : rec)); };
  const close = () => setEditing(null);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = toPayload(fields, form);
      if (editing === "new") await adminApi.post(`/${resource}`, payload);
      else await adminApi.put(`/${resource}/${editing.id}`, payload);
      toast.success(`${noun} saved`);
      close();
      load();
    } catch (err) {
      toast.error(err.details?.length ? err.details.map((d) => `${d.field}: ${d.message}`).join("; ") : err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (rec) => {
    if (!window.confirm(`Delete this ${noun.toLowerCase()}? This cannot be undone.`)) return;
    try {
      await adminApi.delete(`/${resource}/${rec.id}`);
      toast.success(`${noun} deleted`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageTitle title={title}>
        {searchable && (
          <label className="relative">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
            <input className="field w-56 pl-9" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
        )}
        <button className="btn-primary" onClick={() => open("new")}><Plus className="h-4 w-4" /> Add {noun.toLowerCase()}</button>
      </PageTitle>

      {state.error && <ErrorState message={state.error} onRetry={load} />}
      {state.loading && !state.items.length && <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {!state.loading && !state.error && !state.items.length && <EmptyState title={`No ${noun.toLowerCase()}s yet`} text={query ? "Nothing matches your search." : `Add your first ${noun.toLowerCase()}.`} />}

      {state.items.length > 0 && (
        <div className="glass overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide" style={{ borderColor: "var(--glass-border)", color: "var(--muted)" }}>
                {columns.map((c) => <th key={c.label} className="p-3">{c.label}</th>)}
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.items.map((row) => (
                <tr key={row.id} className="border-b last:border-0" style={{ borderColor: "var(--glass-border)" }}>
                  {columns.map((c) => (
                    <td key={c.label} className="p-3 align-top">
                      {c.badge ? <Badge value={c.badge(row)} /> : c.render ? c.render(row) : String(row[c.key] ?? "")}
                    </td>
                  ))}
                  <td className="p-3 text-right">
                    <button className="mr-2 opacity-80 hover:text-accent-teal hover:opacity-100" onClick={() => open(row)} aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                    <button className="opacity-80 hover:text-rose-400 hover:opacity-100" onClick={() => remove(row)} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={page} total={state.total} limit={limit} onChange={setPage} />
      {children}

      {editing && (
        <Modal title={`${editing === "new" ? "Add" : "Edit"} ${noun.toLowerCase()}`} onClose={close}>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <Field key={f.key} field={f} value={form[f.key]} options={options[f.key]} onChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))} />
            ))}
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button type="button" className="btn-ghost" onClick={close}>Cancel</button>
              <button className="btn-primary" disabled={saving}>{saving && <Spinner />} Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
