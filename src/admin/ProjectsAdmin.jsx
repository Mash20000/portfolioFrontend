import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";
import { adminApi } from "../services/adminApi.js";
import { useToast } from "../context/ToastContext.jsx";
import { EmptyState, ErrorState, Skeleton, Spinner } from "../components/ui.jsx";
import { Badge, Field, Modal, PageTitle, Pager } from "./ui.jsx";
import { toPayload } from "./CrudManager.jsx";
import { formatDate } from "../utils/format.js";

const FIELDS = [
  { key: "title", label: "Project title", required: true, full: true },
  { key: "description", label: "Description", type: "textarea", full: true, rows: 5 },
  { key: "category_id", label: "Category", type: "select" },
  { key: "completed_on", label: "Completion date", type: "date" },
  { key: "technologies", label: "Technologies used", type: "tags", full: true, placeholder: "React, Node.js, Supabase", help: "Comma separated." },
  { key: "github_url", label: "GitHub repository URL", type: "url", placeholder: "https://github.com/…" },
  { key: "live_url", label: "Live demo URL", type: "url", placeholder: "https://…" },
  { key: "is_featured", label: "Featured project", type: "checkbox" },
  { key: "is_active", label: "Active (visible on the website)", type: "checkbox", default: true },
];

const blank = () => Object.fromEntries(FIELDS.map((f) => [f.key, f.default ?? (f.type === "checkbox" ? false : "")]));
const fromRecord = (r) =>
  Object.fromEntries(FIELDS.map((f) => [f.key, f.type === "tags" ? (r[f.key] || []).join(", ") : r[f.key] ?? (f.type === "checkbox" ? false : "")]));

export default function ProjectsAdmin() {
  const toast = useToast();
  const [state, setState] = useState({ items: [], total: 0, loading: true, error: null });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(null); // null | "new" | project record
  const [form, setForm] = useState(blank());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const thumbInput = useRef();
  const shotInput = useRef();
  const limit = 12;

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const params = new URLSearchParams({ page, limit });
      if (query) params.set("q", query);
      const r = await adminApi.get(`/projects?${params}`);
      setState({ items: r.items, total: r.total, loading: false, error: null });
      // keep the open editor in sync (e.g. after adding a screenshot)
      setEditing((cur) => (cur && cur !== "new" ? r.items.find((i) => i.id === cur.id) || cur : cur));
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  }, [page, query]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setTimeout(() => { setQuery(q.trim()); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => {
    adminApi.get("/project-categories?limit=100").then((r) => setCats(r.items.map((c) => ({ value: c.id, label: c.name })))).catch(() => {});
  }, []);

  const openNew = () => { setEditing("new"); setForm(blank()); };
  const openEdit = (p) => { setEditing(p); setForm(fromRecord(p)); };
  const close = () => setEditing(null);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = toPayload(FIELDS, form);
      if (editing === "new") {
        const created = await adminApi.post("/projects", payload);
        toast.success("Project created. You can now add a thumbnail and screenshots.");
        setEditing({ ...created, project_images: [] }); // stay open so images can be added
      } else {
        await adminApi.put(`/projects/${editing.id}`, payload);
        toast.success("Project saved");
      }
      load();
    } catch (err) {
      toast.error(err.details?.length ? err.details.map((d) => `${d.field}: ${d.message}`).join("; ") : err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete “${p.title}” and all its screenshots? This cannot be undone.`)) return;
    try {
      await adminApi.delete(`/projects/${p.id}`);
      toast.success("Project deleted");
      if (editing && editing !== "new" && editing.id === p.id) close();
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggle = async (p, key) => {
    try {
      await adminApi.put(`/projects/${p.id}`, { [key]: !p[key] });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const uploadThumb = async (file) => {
    if (!file || editing === "new") return;
    setUploading(true);
    try {
      const { url } = await adminApi.upload(file, "project-images");
      await adminApi.put(`/projects/${editing.id}`, { thumbnail_url: url });
      toast.success("Thumbnail updated");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      if (thumbInput.current) thumbInput.current.value = "";
    }
  };

  const uploadShots = async (files) => {
    if (!files?.length || editing === "new") return;
    setUploading(true);
    try {
      for (const file of files) {
        const { url, path } = await adminApi.upload(file, "project-images");
        await adminApi.post(`/projects/${editing.id}/images`, { image_url: url, storage_path: path });
      }
      toast.success("Screenshots added");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      if (shotInput.current) shotInput.current.value = "";
    }
  };

  const removeShot = async (img) => {
    try {
      await adminApi.delete(`/project-images/${img.id}`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const isEdit = editing && editing !== "new";
  const shots = isEdit ? [...(editing.project_images || [])].sort((a, b) => a.sort_order - b.sort_order) : [];

  return (
    <div>
      <PageTitle title="Projects">
        <label className="relative">
          <span className="sr-only">Search projects</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
          <input className="field w-56 pl-9" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <button className="btn-primary" onClick={openNew}><Plus className="h-4 w-4" /> Add project</button>
      </PageTitle>

      {state.error && <ErrorState message={state.error} onRetry={load} />}
      {state.loading && !state.items.length && <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>}
      {!state.loading && !state.error && !state.items.length && <EmptyState title="No projects yet" text="Add your first project to show it on the website." />}

      {state.items.length > 0 && (
        <div className="glass overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide" style={{ borderColor: "var(--glass-border)", color: "var(--muted)" }}>
                <th className="p-3">Project</th><th className="p-3">Category</th><th className="p-3">Completed</th><th className="p-3">Featured</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.items.map((p) => (
                <tr key={p.id} className="border-b last:border-0" style={{ borderColor: "var(--glass-border)" }}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-16 shrink-0 overflow-hidden rounded-lg bg-white/10">{p.thumbnail_url && <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />}</div>
                      <span className="font-medium">{p.title}</span>
                    </div>
                  </td>
                  <td className="p-3">{p.project_categories?.name || "—"}</td>
                  <td className="p-3">{formatDate(p.completed_on) || "—"}</td>
                  <td className="p-3">
                    <button onClick={() => toggle(p, "is_featured")} aria-label={p.is_featured ? "Unfeature" : "Feature"} aria-pressed={p.is_featured}>
                      <Star className={`h-5 w-5 ${p.is_featured ? "fill-amber-400 text-amber-400" : "opacity-40"}`} />
                    </button>
                  </td>
                  <td className="p-3"><button onClick={() => toggle(p, "is_active")} aria-label="Toggle visibility"><Badge value={p.is_active ? "paid" : "closed"} /></button></td>
                  <td className="p-3 text-right">
                    <button className="mr-2 opacity-80 hover:text-accent-teal hover:opacity-100" onClick={() => openEdit(p)} aria-label={`Edit ${p.title}`}><Pencil className="h-4 w-4" /></button>
                    <button className="opacity-80 hover:text-rose-400 hover:opacity-100" onClick={() => remove(p)} aria-label={`Delete ${p.title}`}><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={page} total={state.total} limit={limit} onChange={setPage} />

      {editing && (
        <Modal title={isEdit ? `Edit project` : "Add project"} onClose={close} wide>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <Field key={f.key} field={f} value={form[f.key]} options={cats} onChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))} />
            ))}
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button type="button" className="btn-ghost" onClick={close}>Close</button>
              <button className="btn-primary" disabled={saving}>{saving && <Spinner />} {isEdit ? "Save changes" : "Create project"}</button>
            </div>
          </form>

          <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--glass-border)" }}>
            <h3 className="font-display font-bold">Images</h3>
            {!isEdit ? (
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>Create the project first, then upload a thumbnail and screenshots here.</p>
            ) : (
              <div className="mt-3 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-32 overflow-hidden rounded-xl bg-white/10">{editing.thumbnail_url && <img src={editing.thumbnail_url} alt="Thumbnail" className="h-full w-full object-cover" />}</div>
                  <div>
                    <input ref={thumbInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => uploadThumb(e.target.files[0])} />
                    <button type="button" className="btn-ghost" disabled={uploading} onClick={() => thumbInput.current.click()}>{uploading ? <Spinner /> : <ImagePlus className="h-4 w-4" />} {editing.thumbnail_url ? "Replace thumbnail" : "Upload thumbnail"}</button>
                    <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>JPG, PNG, WebP or AVIF, max 5MB.</p>
                  </div>
                </div>
                <div>
                  <input ref={shotInput} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => uploadShots([...e.target.files])} />
                  <button type="button" className="btn-ghost" disabled={uploading} onClick={() => shotInput.current.click()}>{uploading ? <Spinner /> : <ImagePlus className="h-4 w-4" />} Add screenshots</button>
                  {shots.length > 0 && (
                    <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {shots.map((img) => (
                        <li key={img.id} className="relative overflow-hidden rounded-xl">
                          <img src={img.image_url} alt="" loading="lazy" className="aspect-video w-full object-cover" />
                          <button type="button" onClick={() => removeShot(img)} aria-label="Remove screenshot" className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white hover:bg-rose-600"><X className="h-4 w-4" /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
