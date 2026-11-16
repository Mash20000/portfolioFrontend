import { Github, Linkedin, MessageCircle } from "lucide-react";
import { useSettings } from "../context/SettingsContext.jsx";
import { track } from "../services/analytics.js";

// Lucide has no Fiverr/Upwork marks, so these are simple lettered badges.
const Badge = ({ text }) => (
  <span className="text-[11px] font-extrabold leading-none tracking-tight" aria-hidden="true">
    {text}
  </span>
);

const ITEMS = [
  { key: "github", label: "GitHub", icon: <Github className="h-5 w-5" /> },
  { key: "linkedin", label: "LinkedIn", icon: <Linkedin className="h-5 w-5" /> },
  { key: "fiverr", label: "Fiverr", icon: <Badge text="Fi" /> },
  { key: "upwork", label: "Upwork", icon: <Badge text="Up" /> },
];

const base =
  "glass grid h-11 w-11 place-items-center rounded-full transition hover:-translate-y-0.5 hover:shadow-glow";

export default function SocialLinks({ className = "" }) {
  const { settings, whatsappLink } = useSettings();
  const links = settings.social_links || {};

  return (
    <ul className={`flex flex-wrap items-center gap-3 ${className}`}>
      {ITEMS.map(({ key, label, icon }) => {
        const url = links[key];
        // No URL yet (LinkedIn/Fiverr/Upwork): show the icon, but as a non-link and clearly marked.
        return (
          <li key={key}>
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className={base}>
                {icon}
              </a>
            ) : (
              <span aria-label={`${label} (link coming soon)`} title={`${label}: coming soon`} className={`${base} cursor-default opacity-60 hover:translate-y-0 hover:shadow-none`}>
                {icon}
              </span>
            )}
          </li>
        );
      })}
      <li>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          title="WhatsApp"
          className={base}
          onClick={() => track("whatsapp_click")}
        >
          <MessageCircle className="h-5 w-5" />
        </a>
      </li>
    </ul>
  );
}
