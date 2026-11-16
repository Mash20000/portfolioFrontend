import Seo from "../components/Seo.jsx";
import { useSettings } from "../context/SettingsContext.jsx";
import Hero from "../sections/Hero.jsx";
import About from "../sections/About.jsx";
import Skills from "../sections/Skills.jsx";
import Projects from "../sections/Projects.jsx";
import Services from "../sections/Services.jsx";
import Testimonials from "../sections/Testimonials.jsx";
import Faq from "../sections/Faq.jsx";
import Contact from "../sections/Contact.jsx";

export default function Home() {
  const { settings } = useSettings();
  return (
    <>
      <Seo
        title={`${settings.site_name} | ${settings.hero_headline}`}
        description={settings.hero_intro}
        image={settings.profile_image_url || undefined}
        path="/"
      />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Services />
      <Testimonials />
      <Faq />
      <Contact />
    </>
  );
}
