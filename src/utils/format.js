export const formatKES = (n) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(Number(n) || 0);

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" }) : "";

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "";

// Kenyan mobile number check, matches the server's rule (07XX, 01XX, +254, 254)
export const isKenyanPhone = (v) => /^(?:\+?254|0)?[71]\d{8}$/.test(String(v).replace(/[\s\-()]/g, ""));

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

export const statusLabel = (s) => String(s || "").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
