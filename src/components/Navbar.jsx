import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, ShoppingCart, Sun, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useSettings } from "../context/SettingsContext.jsx";

const LINKS = [
  { to: "/#about", label: "About" },
  { to: "/#skills", label: "Skills" },
  { to: "/#projects", label: "Projects" },
  { to: "/#services", label: "Services" },
  { to: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { count, setOpen: openCart } = useCart();
  const { settings } = useSettings();
  const initials = settings.site_name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="container-page mt-3" aria-label="Main">
        <div className="glass flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              aria-label="Home"
              className="grid h-8 w-8 place-items-center rounded-lg bg-iridescent font-display text-sm font-bold text-ink-950"
              onClick={() => setOpen(false)}
            >
              {initials}
            </Link>
            <div className="flex flex-col leading-none">
              <Link to="/" className="hidden font-display font-bold sm:inline" onClick={() => setOpen(false)}>
                {settings.site_name}
              </Link>
              {/* Deliberately tiny and faint so visitors rarely notice it; becomes clear on hover/focus. */}
              <Link
                to="/admin/login"
                aria-label="Admin login"
                className="text-[9px] font-medium uppercase tracking-widest opacity-30 transition hover:opacity-100 focus-visible:opacity-100 sm:mt-0.5"
                onClick={() => setOpen(false)}
              >
                Admin
              </Link>
            </div>
          </div>

          <ul className="hidden items-center gap-6 text-sm font-medium md:flex">
            {LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="opacity-80 transition hover:opacity-100">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button onClick={toggle} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button onClick={() => openCart(true)} className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" aria-label={`Open cart, ${count} items`}>
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent-rose px-1 text-[11px] font-bold text-ink-950">
                  {count}
                </span>
              )}
            </button>
            <button onClick={() => setOpen((o) => !o)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10 md:hidden" aria-label="Toggle menu" aria-expanded={open}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass mt-2 flex flex-col p-2 md:hidden"
            >
              {LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} onClick={() => setOpen(false)} className="block rounded-lg px-4 py-3 font-medium hover:bg-white/10">
                    {l.label}
                  </Link>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}