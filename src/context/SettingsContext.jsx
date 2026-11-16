import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api.js";

const DEFAULTS = {
  site_name: "John Macharia Makumi",
  hero_headline: "Developer | Data Analyst | IoT Enthusiast | Educator",
  hero_intro:
    "I build modern digital experiences, intelligent systems and practical technology solutions. From websites and data dashboards to IoT projects and technology education, I turn ideas into useful solutions.",
  about_bio: "",
  email: "Johnmakumi29@mail.com",
  whatsapp: "254798890529",
  profile_image_url: null,
  social_links: { github: "https://github.com/Mash20000", linkedin: "", fiverr: "", upwork: "" },
  contact_info: { location: "Kenya", availability: "Open to new projects" },
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .get("/public/settings")
      .then((s) => setSettings({ ...DEFAULTS, ...s }))
      .catch(() => {}) // fall back to defaults if the API is unreachable
      .finally(() => setLoaded(true));
  }, []);

  const whatsappLink = (text = "Hello John, I found your website and I'd like to ask about your services.") =>
    `https://wa.me/${String(settings.whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

  return <SettingsContext.Provider value={{ settings, loaded, whatsappLink }}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
