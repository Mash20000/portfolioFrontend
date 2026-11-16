import SocialLinks from "./SocialLinks.jsx";
import { useSettings } from "../context/SettingsContext.jsx";

export default function Footer() {
  const { settings } = useSettings();
  return (
    <footer className="mt-10 border-t py-10" style={{ borderColor: "var(--glass-border)" }}>
      <div className="container-page flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="font-display font-semibold">{settings.site_name}</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
        <SocialLinks />
      </div>
    </footer>
  );
}
