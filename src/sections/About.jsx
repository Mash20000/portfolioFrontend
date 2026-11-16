import { BarChart3, Code2, Cpu, GraduationCap, Monitor, Sheet, Wrench } from "lucide-react";
import Reveal from "../components/Reveal.jsx";
import { SectionHeading } from "../components/ui.jsx";
import { useSettings } from "../context/SettingsContext.jsx";

const FOCUS = [
  { icon: Code2, label: "Full-stack web development" },
  { icon: BarChart3, label: "Data analysis and visualization" },
  { icon: Cpu, label: "Internet of Things (IoT)" },
  { icon: Cpu, label: "Arduino programming" },
  { icon: Sheet, label: "Excel and spreadsheet automation" },
  { icon: Wrench, label: "Computer troubleshooting and repair" },
  { icon: GraduationCap, label: "Technology education and coding mentorship" },
  { icon: Monitor, label: "Practical problem-solving" },
];

export default function About() {
  const { settings } = useSettings();
  return (
    <section id="about" className="container-page section">
      <SectionHeading eyebrow="About me" title="Technology, problem-solving and teaching" />
      <div className="grid gap-8 lg:grid-cols-2">
        <Reveal>
          <div className="glass h-full p-6 sm:p-8">
            {String(settings.about_bio || "")
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((p, i) => (
                <p key={i} className={`leading-relaxed ${i ? "mt-4" : ""}`} style={{ color: "var(--muted)" }}>
                  {p}
                </p>
              ))}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {FOCUS.map(({ icon: I, label }) => (
              <li key={label} className="glass flex items-center gap-3 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-iridescent text-ink-950">
                  <I className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">{label}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
