import { Link } from "react-router-dom";
import { Check, Clock, ShoppingCart } from "lucide-react";
import Icon from "../components/Icon.jsx";
import Reveal from "../components/Reveal.jsx";
import { CardSkeletons, EmptyState, ErrorState, SectionHeading } from "../components/ui.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { track } from "../services/analytics.js";
import { formatKES } from "../utils/format.js";

export default function Services() {
  const { data, loading, error, reload } = useFetch("/public/services");
  const cart = useCart();

  return (
    <section id="services" className="container-page section">
      <SectionHeading
        eyebrow="Services"
        title="Services and pricing"
        subtitle="Prices are starting estimates in Kenyan Shillings. For bigger or custom work, request a quotation."
      />
      {loading && <CardSkeletons count={6} height="h-96" />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyState title="Services coming soon" />}
      {data && data.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((s, i) => {
            const inCart = cart.items.some((x) => x.id === s.id);
            return (
              <Reveal key={s.id} delay={(i % 3) * 0.06}>
                <article className="glass flex h-full flex-col p-6 transition hover:-translate-y-1 hover:shadow-glow">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-iridescent text-ink-950">
                    <Icon name={s.icon} className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                    {s.description}
                  </p>
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {(s.features || []).map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-teal" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
                    <Clock className="h-4 w-4" /> {s.delivery_estimate}
                  </p>
                  <div className="mt-auto pt-5">
                    <p className="font-display text-2xl font-extrabold">
                      {s.is_starting_price && <span className="mr-1 text-xs font-medium uppercase tracking-wide opacity-70">From</span>}
                      {formatKES(s.price_kes)}
                      {s.allow_quantity && s.quantity_label && (
                        <span className="ml-1 text-sm font-medium opacity-70">/ {s.quantity_label.replace(/s$/, "")}</span>
                      )}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button className="btn-primary flex-1" onClick={() => cart.add(s)}>
                        <ShoppingCart className="h-4 w-4" />
                        {inCart ? "Add another" : "Add to Cart"}
                      </button>
                      <Link
                        to={`/?service=${encodeURIComponent(s.title)}#contact`}
                        className="btn-ghost"
                        onClick={() => track("service_inquiry", { ref_id: s.id })}
                      >
                        Quote
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      )}
    </section>
  );
}
