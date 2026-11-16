import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Mail, MessageCircle, Send } from "lucide-react";
import Reveal from "../components/Reveal.jsx";
import SocialLinks from "../components/SocialLinks.jsx";
import { SectionHeading, Spinner } from "../components/ui.jsx";
import { useSettings } from "../context/SettingsContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { api } from "../services/api.js";
import { track } from "../services/analytics.js";
import { isEmail } from "../utils/format.js";

const BUDGETS = ["Under KES 5,000", "KES 5,000 – 15,000", "KES 15,000 – 50,000", "Above KES 50,000", "Not sure yet"];

export default function Contact() {
  const { settings, whatsappLink } = useSettings();
  const toast = useToast();
  const location = useLocation();
  const services = useFetch("/public/services");
  const preset = new URLSearchParams(location.search).get("service") || "";

  const [form, setForm] = useState({ name: "", email: "", phone: "", service_interest: preset, budget_range: "", message: "", website: "" });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const startedAt = useMemo(() => Date.now(), []);

  // keep the preselected service in sync when the visitor clicks "Quote" on a service card
  useEffect(() => {
    if (preset) setForm((f) => ({ ...f, service_interest: preset }));
  }, [preset]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name.";
    if (!isEmail(form.email)) e.email = "Enter a valid email address.";
    if (form.message.trim().length < 10) e.message = "Please describe your request (at least 10 characters).";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSending(true);
    try {
      await api.post("/contact", { ...form, started_at: startedAt });
      setDone(true);
      toast.success("Request sent. I will get back to you soon.");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  const Err = ({ k }) => (errors[k] ? <p className="mt-1 text-xs text-rose-400" role="alert">{errors[k]}</p> : null);

  return (
    <section id="contact" className="container-page section">
      <SectionHeading eyebrow="Contact" title="Let's work together" subtitle="Tell me about your project or request a custom quotation." />
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <div className="glass space-y-5 p-6">
            <a href={`mailto:${settings.email}`} className="btn-ghost w-full justify-start">
              <Mail className="h-4 w-4" /> {settings.email}
            </a>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-primary w-full" onClick={() => track("whatsapp_click")}>
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
            {settings.contact_info?.location && (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Based in {settings.contact_info.location}
              </p>
            )}
            <SocialLinks />
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          {done ? (
            <div className="glass p-8 text-center" role="status">
              <p className="font-display text-xl font-bold">Thank you!</p>
              <p className="mt-2" style={{ color: "var(--muted)" }}>Your request has been received. I will reply by email as soon as possible.</p>
              <button className="btn-ghost mt-5" onClick={() => { setDone(false); setForm({ name: "", email: "", phone: "", service_interest: "", budget_range: "", message: "", website: "" }); }}>
                Send another request
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="glass grid gap-4 p-6 sm:grid-cols-2" noValidate>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="c-name">Name *</label>
                <input id="c-name" className="field" value={form.name} onChange={set("name")} autoComplete="name" />
                <Err k="name" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="c-email">Email *</label>
                <input id="c-email" type="email" className="field" value={form.email} onChange={set("email")} autoComplete="email" />
                <Err k="email" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="c-phone">Phone</label>
                <input id="c-phone" type="tel" className="field" value={form.phone} onChange={set("phone")} autoComplete="tel" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="c-service">Service interested in</label>
                <select id="c-service" className="field" value={form.service_interest} onChange={set("service_interest")}>
                  <option value="">Select a service</option>
                  {(services.data || []).map((s) => (
                    <option key={s.id} value={s.title}>{s.title}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium" htmlFor="c-budget">Budget range</label>
                <select id="c-budget" className="field" value={form.budget_range} onChange={set("budget_range")}>
                  <option value="">Select a range</option>
                  {BUDGETS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium" htmlFor="c-msg">Project description *</label>
                <textarea id="c-msg" rows={5} className="field" value={form.message} onChange={set("message")} />
                <Err k="message" />
              </div>
              {/* honeypot: hidden from people, tempting for bots */}
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <label>Website <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} /></label>
              </div>
              <div className="sm:col-span-2">
                <button className="btn-primary w-full sm:w-auto" disabled={sending}>
                  {sending ? <Spinner /> : <Send className="h-4 w-4" />} Submit Request
                </button>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
