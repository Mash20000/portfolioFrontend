import Icon from "../components/Icon.jsx";
import Reveal from "../components/Reveal.jsx";
import { CardSkeletons, EmptyState, ErrorState, SectionHeading } from "../components/ui.jsx";
import { useFetch } from "../hooks/useFetch.js";

const GROUPS = ["Web Development", "Data and Productivity", "IoT and Hardware", "Education and Training"];

export default function Skills() {
  const { data, loading, error, reload } = useFetch("/public/skills");

  return (
    <section id="skills" className="container-page section">
      <SectionHeading eyebrow="Skills" title="Skills and technologies" subtitle="The tools and disciplines I work with every day." />
      {loading && <CardSkeletons count={4} height="h-56" />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyState title="Skills coming soon" />}
      {data && data.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {GROUPS.map((group, gi) => {
            const skills = data.filter((s) => s.group_name === group);
            if (!skills.length) return null;
            return (
              <Reveal key={group} delay={gi * 0.05}>
                <div className="glass h-full p-6">
                  <h3 className="font-display text-lg font-bold">{group}</h3>
                  <ul className="mt-4 space-y-4">
                    {skills.map((s) => (
                      <li key={s.id}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 font-medium">
                            <Icon name={s.icon} className="h-4 w-4 text-accent-teal" />
                            {s.name}
                          </span>
                          <span style={{ color: "var(--muted)" }}>{s.level_label}</span>
                        </div>
                        <div
                          className="h-1.5 overflow-hidden rounded-full bg-white/10"
                          role="progressbar"
                          aria-valuenow={s.proficiency}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${s.name} proficiency`}
                        >
                          <div className="h-full rounded-full bg-iridescent" style={{ width: `${s.proficiency}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </section>
  );
}
