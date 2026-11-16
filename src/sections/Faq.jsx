import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Reveal from "../components/Reveal.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { SectionHeading } from "../components/ui.jsx";

export default function Faq() {
  const { data } = useFetch("/public/faqs");
  const [openId, setOpenId] = useState(null);
  if (!data?.length) return null;
  return (
    <section id="faq" className="container-page section">
      <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
      <Reveal className="mx-auto max-w-3xl space-y-3">
        {data.map((f) => {
          const open = openId === f.id;
          return (
            <div key={f.id} className="glass overflow-hidden">
              <h3>
                <button
                  className="flex w-full items-center justify-between gap-4 p-4 text-left font-semibold"
                  aria-expanded={open}
                  aria-controls={`faq-${f.id}`}
                  onClick={() => setOpenId(open ? null : f.id)}
                >
                  {f.question}
                  <ChevronDown className={`h-5 w-5 shrink-0 transition ${open ? "rotate-180" : ""}`} />
                </button>
              </h3>
              {open && (
                <p id={`faq-${f.id}`} className="px-4 pb-4 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {f.answer}
                </p>
              )}
            </div>
          );
        })}
      </Reveal>
    </section>
  );
}
