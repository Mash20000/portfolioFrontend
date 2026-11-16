import Reveal from "./Reveal.jsx";

export const Skeleton = ({ className = "h-6 w-full" }) => <div className={`skeleton ${className}`} aria-hidden="true" />;

export function CardSkeletons({ count = 3, height = "h-64" }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`${height} w-full`} />
      ))}
    </div>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="glass mx-auto max-w-md p-8 text-center">
      <p className="font-display text-lg font-semibold">{title}</p>
      {text && (
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          {text}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="glass mx-auto max-w-md p-8 text-center" role="alert">
      <p className="font-display text-lg font-semibold">Something went wrong</p>
      <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
        {message}
      </p>
      {onRetry && (
        <button className="btn-ghost mt-4" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <Reveal className="mx-auto mb-12 max-w-2xl text-center">
      {eyebrow && <p className="text-sm font-semibold uppercase tracking-widest gradient-text">{eyebrow}</p>}
      <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{title}</h2>
      {subtitle && (
        <p className="mt-3" style={{ color: "var(--muted)" }}>
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}

export function Spinner({ className = "h-5 w-5" }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
