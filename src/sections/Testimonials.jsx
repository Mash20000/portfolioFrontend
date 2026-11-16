import { Quote, Star } from "lucide-react";
import Reveal from "../components/Reveal.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { SectionHeading } from "../components/ui.jsx";

// Hidden entirely when there are no published testimonials yet.
export default function Testimonials() {
  const { data } = useFetch("/public/testimonials");
  if (!data?.length) return null;
  return (
    <section id="testimonials" className="container-page section">
      <SectionHeading eyebrow="Kind words" title="What clients say" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.map((t, i) => (
          <Reveal key={t.id} delay={(i % 3) * 0.06}>
            <figure className="glass h-full p-6">
              <Quote className="h-6 w-6 text-accent-violet" aria-hidden="true" />
              <blockquote className="mt-3 text-sm leading-relaxed">{t.content}</blockquote>
              {t.rating && (
                <div className="mt-3 flex gap-0.5" role="img" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: t.rating }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              )}
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold">{t.author_name}</span>
                {t.author_role && <span style={{ color: "var(--muted)" }}>, {t.author_role}</span>}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
