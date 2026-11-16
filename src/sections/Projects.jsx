import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ExternalLink, Github, Search, Star } from "lucide-react";
import Reveal from "../components/Reveal.jsx";
import { CardSkeletons, EmptyState, ErrorState, SectionHeading } from "../components/ui.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { track } from "../services/analytics.js";
import { formatDate } from "../utils/format.js";

export function ProjectCard({ p }) {
  return (
    <article className="glass group flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-glow">
      <Link to={`/projects/${p.slug}`} onClick={() => track("project_click", { ref_id: p.id })} className="block">
        <div className="relative aspect-video overflow-hidden bg-white/5">
          {p.thumbnail_url ? (
            <img src={p.thumbnail_url} alt={`${p.title} thumbnail`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="grid h-full place-items-center text-sm opacity-50">No preview</div>
          )}
          {p.is_featured && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-iridescent px-2.5 py-1 text-xs font-bold text-ink-950">
              <Star className="h-3 w-3" /> Featured
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-teal">{p.project_categories?.name || "Project"}</p>
        <h3 className="mt-1 font-display text-lg font-bold">
          <Link to={`/projects/${p.slug}`} onClick={() => track("project_click", { ref_id: p.id })}>
            {p.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm" style={{ color: "var(--muted)" }}>
          {p.description}
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {(p.technologies || []).slice(0, 5).map((t) => (
            <li key={t} className="rounded-full border px-2.5 py-0.5 text-xs" style={{ borderColor: "var(--glass-border)" }}>
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between pt-4 text-sm">
          <span style={{ color: "var(--muted)" }}>{formatDate(p.completed_on)}</span>
          <span className="flex gap-3">
            {p.live_url && (
              <a href={p.live_url} target="_blank" rel="noopener noreferrer" aria-label={`Live demo of ${p.title}`} className="hover:text-accent-teal">
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            {p.github_url && (
              <a href={p.github_url} target="_blank" rel="noopener noreferrer" aria-label={`Source code of ${p.title}`} className="hover:text-accent-teal">
                <Github className="h-4 w-4" />
              </a>
            )}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const [category, setCategory] = useState("");
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const limit = 6;

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(input.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [input]);

  const cats = useFetch("/public/project-categories");
  const featured = useFetch("/public/projects?featured=true&limit=3");
  const params = new URLSearchParams({ page, limit });
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  const list = useFetch(`/public/projects?${params}`);
  const pages = list.data ? Math.max(1, Math.ceil(list.data.total / limit)) : 1;
  const filtering = Boolean(category || q);

  return (
    <section id="projects" className="container-page section">
      <SectionHeading eyebrow="Portfolio" title="Projects" subtitle="A selection of things I have built. Filter by category or search by name." />

      {!filtering && featured.data?.items?.length > 0 && (
        <div className="mb-14">
          <h3 className="mb-5 font-display text-xl font-bold">Featured</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.data.items.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.05}>
                <ProjectCard p={p} />
              </Reveal>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {[{ slug: "", name: "All" }, ...(cats.data || [])].map((c) => (
            <button
              key={c.slug}
              onClick={() => {
                setCategory(c.slug);
                setPage(1);
              }}
              aria-pressed={category === c.slug}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${category === c.slug ? "bg-iridescent text-ink-950" : "glass hover:brightness-125"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <label className="relative block md:w-72">
          <span className="sr-only">Search projects</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
          <input className="field pl-9" placeholder="Search projects…" value={input} onChange={(e) => setInput(e.target.value)} />
        </label>
      </div>

      {list.loading && <CardSkeletons count={3} height="h-80" />}
      {list.error && <ErrorState message={list.error} onRetry={list.reload} />}
      {list.data && list.data.items.length === 0 && (
        <EmptyState
          title={filtering ? "No projects match your search" : "Projects coming soon"}
          text={filtering ? "Try a different category or keyword." : "New work is on the way."}
          action={filtering && <button className="btn-ghost" onClick={() => { setCategory(""); setInput(""); }}>Clear filters</button>}
        />
      )}
      {list.data && list.data.items.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.data.items.map((p) => (
              <ProjectCard key={p.id} p={p} />
            ))}
          </div>
          {pages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-4" aria-label="Project pages">
              <button className="btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm">
                Page {page} of {pages}
              </span>
              <button className="btn-ghost" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} aria-label="Next page">
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
