import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { Activity, BarChart3, FolderKanban, Inbox, LogOut, MessageSquareQuote, Settings, ShoppingBag, Sparkles, Wrench } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { Spinner } from "../components/ui.jsx";
import Seo from "../components/Seo.jsx";

const NAV = [
  { to: "/admin", label: "Overview", icon: BarChart3, end: true },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/services", label: "Services", icon: Wrench },
  { to: "/admin/skills", label: "Skills", icon: Sparkles },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { to: "/admin/content", label: "Content", icon: MessageSquareQuote },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/activity", label: "Activity", icon: Activity },
];

export default function AdminLayout() {
  const { status, user, logout } = useAuth();
  const location = useLocation();

  if (status === "loading") return <div className="grid min-h-screen place-items-center"><Spinner className="h-8 w-8" /></div>;
  if (status === "forbidden")
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div className="glass max-w-md p-8">
          <h1 className="font-display text-xl font-bold">No admin access</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>This account is signed in but is not an administrator.</p>
          <button className="btn-ghost mt-4" onClick={logout}>Sign out</button>
        </div>
      </div>
    );
  if (status !== "admin") return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;

  return (
    <div className="min-h-screen lg:flex">
      <Seo title="Admin" noindex />
      <aside className="border-b lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r" style={{ borderColor: "var(--glass-border)" }}>
        <div className="flex items-center justify-between p-4 lg:block">
          <p className="font-display font-bold">Admin</p>
          <p className="hidden truncate text-xs lg:block" style={{ color: "var(--muted)" }}>{user?.email}</p>
          <button onClick={logout} className="btn-ghost !px-3 !py-1.5 lg:hidden" aria-label="Sign out"><LogOut className="h-4 w-4" /></button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible" aria-label="Admin">
          {NAV.map(({ to, label, icon: I, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? "bg-iridescent text-ink-950" : "hover:bg-white/10"}`}
            >
              <I className="h-4 w-4" /> {label}
            </NavLink>
          ))}
          <NavLink to="/" className="mt-2 hidden rounded-xl px-3 py-2 text-sm opacity-70 hover:opacity-100 lg:block">View website →</NavLink>
          <button onClick={logout} className="hidden items-center gap-2 rounded-xl px-3 py-2 text-left text-sm opacity-70 hover:opacity-100 lg:flex"><LogOut className="h-4 w-4" /> Sign out</button>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-8"><Outlet /></main>
    </div>
  );
}
