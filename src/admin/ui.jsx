import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl border bg-[var(--bg)] p-6 shadow-2xl ${wide ? "max-w-3xl" : "max-w-xl"}`} style={{ borderColor: "var(--glass-border)" }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// One form control. value/onChange are controlled by the parent.
export function Field({ field, value, onChange, options = [] }) {
  const id = `f-${field.key}`;
  const label = (
    <label htmlFor={id} className="mb-1 block text-sm font-medium">
      {field.label}
      {field.required && " *"}
    </label>
  );
  const help = field.help && <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{field.help}</p>;

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" className="h-4 w-4 accent-violet-500" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        {field.label}
      </label>
    );
  }
  if (field.type === "textarea" || field.type === "lines") {
    return (
      <div className={field.full ? "sm:col-span-2" : ""}>
        {label}
        <textarea id={id} rows={field.rows || 4} className="field" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />
        {help}
      </div>
    );
  }
  if (field.type === "select") {
    const opts = field.options || options;
    return (
      <div>
        {label}
        <select id={id} className="field" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          {field.blank !== false && <option value="">{field.blank || "None"}</option>}
          {opts.map((o) => {
            const v = typeof o === "string" ? o : o.value;
            const l = typeof o === "string" ? o : o.label;
            return <option key={v} value={v}>{l}</option>;
          })}
        </select>
        {help}
      </div>
    );
  }
  return (
    <div className={field.full ? "sm:col-span-2" : ""}>
      {label}
      <input
        id={id}
        className="field"
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "url" ? "url" : "text"}
        step={field.step}
        min={field.min}
        max={field.max}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
      />
      {help}
    </div>
  );
}

export function Pager({ page, total, limit, onChange }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-end gap-3 text-sm">
      <span>Page {page} of {pages} ({total} total)</span>
      <button className="btn-ghost !px-3 !py-1.5" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
      <button className="btn-ghost !px-3 !py-1.5" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
    </div>
  );
}

const TONES = {
  paid: "bg-emerald-500/20 text-emerald-400", completed: "bg-emerald-500/20 text-emerald-400", replied: "bg-emerald-500/20 text-emerald-400",
  pending: "bg-amber-500/20 text-amber-400", processing: "bg-amber-500/20 text-amber-400", in_progress: "bg-amber-500/20 text-amber-400", new: "bg-sky-500/20 text-sky-400", accepted: "bg-sky-500/20 text-sky-400",
  failed: "bg-rose-500/20 text-rose-400", cancelled: "bg-rose-500/20 text-rose-400", rejected: "bg-rose-500/20 text-rose-400", spam: "bg-rose-500/20 text-rose-400",
  read: "bg-slate-500/20 text-slate-300", closed: "bg-slate-500/20 text-slate-300",
};
export const Badge = ({ value }) => (
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${TONES[value] || "bg-slate-500/20"}`}>{String(value).replace(/_/g, " ")}</span>
);

export const PageTitle = ({ title, children }) => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
    <h1 className="font-display text-2xl font-bold">{title}</h1>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);
