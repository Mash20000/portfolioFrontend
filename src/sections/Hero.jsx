import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, User } from "lucide-react";
import SocialLinks from "../components/SocialLinks.jsx";
import { useSettings } from "../context/SettingsContext.jsx";

export default function Hero() {
  const { settings } = useSettings();
  const reduce = useReducedMotion();
  const fade = (delay) =>
    reduce ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay } };

  return (
    <section id="home" className="container-page grid items-center gap-8 pb-12 pt-28 lg:min-h-screen lg:gap-12 lg:pb-16 lg:pt-32 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <motion.p {...fade(0)} className="glass inline-flex items-center gap-2 px-4 py-1.5 text-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
          {settings.contact_info?.availability || "Open to new projects"}
        </motion.p>

        <motion.h1 {...fade(0.08)} className="mt-6 font-display text-4xl font-extrabold leading-tight sm:text-6xl">
          {settings.site_name.split(" ").slice(0, -1).join(" ")}{" "}
          <span className="gradient-text">{settings.site_name.split(" ").slice(-1)}</span>
        </motion.h1>

        <motion.p {...fade(0.16)} className="mt-4 font-display text-lg font-semibold sm:text-xl">
          {settings.hero_headline}
        </motion.p>

        <motion.p {...fade(0.24)} className="mt-5 max-w-xl text-base leading-relaxed" style={{ color: "var(--muted)" }}>
          {settings.hero_intro}
        </motion.p>

        <motion.div {...fade(0.32)} className="mt-8 flex flex-wrap gap-3">
          <Link to="/#projects" className="btn-primary">
            View My Projects <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/#services" className="btn-ghost">
            Explore My Services
          </Link>
          <Link to="/#contact" className="btn-ghost">
            Contact Me
          </Link>
        </motion.div>

        <motion.div {...fade(0.4)} className="mt-8">
          <SocialLinks />
        </motion.div>
      </div>

      <motion.div {...fade(0.2)} className="mx-auto w-full max-w-[14rem] px-2 sm:max-w-xs lg:max-w-sm">
        <div className="relative">
          <div className="absolute -inset-1 rounded-[2rem] bg-iridescent opacity-40 blur-xl" aria-hidden="true" />
          <div className="glass relative aspect-square overflow-hidden rounded-[2rem]">
            {settings.profile_image_url ? (
              <img src={settings.profile_image_url} alt={settings.site_name} className="h-full w-full object-cover" fetchpriority="high" />
            ) : (
              <div className="grid h-full w-full place-items-center" role="img" aria-label="Profile photo placeholder">
                <User className="h-24 w-24 opacity-30" />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}