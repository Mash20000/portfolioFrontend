import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import Seo from "../components/Seo.jsx";
import { ErrorState, Skeleton } from "../components/ui.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { formatDate } from "../utils/format.js";

export default function ProjectDetail() {
  const { slug } = useParams();
  const { data: p, loading, error, reload } = useFetch(`/public/projects/${encodeURIComponent(slug)}`);
  const [active, setActive] = useState(0);

  if (loading)
    return (
      <div className="container-page space-y-4 pb-20 pt-32">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-96 w-full" />
      </div>
    );

  if (error)
    return (
      <div className="container-page pb-20 pt-32">
        <ErrorState message={error === "Project not found" ? "This project does not exist or is no longer public." : error} onRetry={reload} />
        <p className="mt-6 text-center">
          <Link to="/#projects" className="btn-ghost">Back to projects</Link>
        </p>
      </div>
    );

  const shots = [p.thumbnail_url && { id: "thumb", image_url: p.thumbnail_url }, ...(p.project_images || [])].filter(Boolean);
  const current = shots[active] || shots[0];

  return (
    <article className="container-page pb-20 pt-28">
      <Seo title={`${p.title} | Project`} description={p.description.slice(0, 160)} image={p.thumbnail_url || undefined} path={`/projects/${p.slug}`} />
      <Link to="/#projects" className="mb-6 inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100">
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="glass aspect-video overflow-hidden">
            {current ? (
              <img src={current.image_url} alt={current.caption || `${p.title} screenshot`} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center opacity-50">No images yet</div>
            )}
          </div>
          {shots.length > 1 && (
            <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {shots.map((s, i) => (
                <li key={s.id}>
                  <button onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`} aria-current={i === active} className={`h-16 w-28 overflow-hidden rounded-lg border-2 ${i === active ? "border-accent-violet" : "border-transparent opacity-70"}`}>
                    <img src={s.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass h-fit p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-teal">{p.project_categories?.name}</p>
          <h1 className="mt-1 font-display text-3xl font-bold">{p.title}</h1>
          {p.completed_on && (
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              Completed {formatDate(p.completed_on)}
            </p>
          )}
          <p className="mt-4 whitespace-pre-line leading-relaxed" style={{ color: "var(--muted)" }}>
            {p.description}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {(p.technologies || []).map((t) => (
              <li key={t} className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: "var(--glass-border)" }}>
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            {p.live_url && (
              <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <ExternalLink className="h-4 w-4" /> View Live Project
              </a>
            )}
            {p.github_url && (
              <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                <Github className="h-4 w-4" /> View Source Code
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
