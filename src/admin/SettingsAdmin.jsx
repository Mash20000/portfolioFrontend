import { useEffect, useRef, useState } from "react";
import { ImagePlus, Save } from "lucide-react";
import { adminApi } from "../services/adminApi.js";
import { useToast } from "../context/ToastContext.jsx";
import { ErrorState, Skeleton, Spinner } from "../components/ui.jsx";
import { PageTitle } from "./ui.jsx";

const SOCIALS = ["github", "linkedin", "fiverr", "upwork", "Vercel", "Render"];

export default function SettingsAdmin() {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef();

  useEffect(() => {
    adminApi
      .get("/settings")
      .then((s) =>
        setForm({
          site_name: s.site_name ?? "",
          hero_headline: s.hero_headline ?? "",
          hero_intro: s.hero_intro ?? "",
          about_bio: s.about_bio ?? "",
          email: s.email ?? "",
          whatsapp: s.whatsapp ?? "",
          profile_image_url: s.profile_image_url ?? null,
          social_links: { github: "", linkedin: "", fiverr: "", upwork: "", ...(s.social_links || {}) },
          contact_info: { location: "", availability: "", ...(s.contact_info || {}) },
        })
      )
      .catch((e) => setError(e.message));
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setNested = (group, k) => (e) => setForm((f) => ({ ...f, [group]: { ...f[group], [k]: e.target.value } }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.put("/settings", form);
      toast.success("Settings saved. The public website now shows the changes.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await adminApi.upload(file, "profile-images");
      setForm((f) => ({ ...f, profile_image_url: url }));
      await adminApi.put("/settings", { profile_image_url: url });
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  if (error) return <ErrorState message={error} />;
  if (!form) return <div className="space-y-3"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-64 w-full" /></div>;

  const L = ({ id, children }) => <label htmlFor={id} className="mb-1 block text-sm font-medium">{children}</label>;

  return (
    <form onSubmit={save} className="max-w-3xl space-y-6">
      <PageTitle title="Website settings">
        <button className="btn-primary" disabled={saving}>{saving ? <Spinner /> : <Save className="h-4 w-4" />} Save changes</button>
      </PageTitle>

      <section className="glass space-y-4 p-6">
        <h2 className="font-display font-bold">Profile</h2>
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 overflow-hidden rounded-2xl bg-white/10">{form.profile_image_url && <img src={form.profile_image_url} alt="Profile" className="h-full w-full object-cover" />}</div>
          <div>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => uploadImage(e.target.files[0])} />
            <button type="button" className="btn-ghost" disabled={uploading} onClick={() => fileInput.current.click()}>{uploading ? <Spinner /> : <ImagePlus className="h-4 w-4" />} Upload profile picture</button>
            <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>JPG, PNG, WebP or AVIF, max 5MB. Saved immediately.</p>
          </div>
        </div>
        <div><L id="s-name">Name</L><input id="s-name" className="field" value={form.site_name} onChange={set("site_name")} /></div>
        <div><L id="s-head">Hero headline</L><input id="s-head" className="field" value={form.hero_headline} onChange={set("hero_headline")} /></div>
        <div><L id="s-intro">Hero introduction</L><textarea id="s-intro" rows={4} className="field" value={form.hero_intro} onChange={set("hero_intro")} /></div>
        <div><L id="s-bio">Biography / About section</L><textarea id="s-bio" rows={8} className="field" value={form.about_bio} onChange={set("about_bio")} /><p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>Leave a blank line between paragraphs.</p></div>
      </section>

      <section className="glass grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="font-display font-bold sm:col-span-2">Contact information</h2>
        <div><L id="s-email">Email</L><input id="s-email" type="email" className="field" value={form.email} onChange={set("email")} /></div>
        <div><L id="s-wa">WhatsApp number</L><input id="s-wa" className="field" value={form.whatsapp} onChange={set("whatsapp")} placeholder="254798890529" /><p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>International format, digits only (254… for Kenya).</p></div>
        <div><L id="s-loc">Location</L><input id="s-loc" className="field" value={form.contact_info.location} onChange={setNested("contact_info", "location")} /></div>
        <div><L id="s-avail">Availability message</L><input id="s-avail" className="field" value={form.contact_info.availability} onChange={setNested("contact_info", "availability")} /></div>
      </section>

      <section className="glass grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="font-display font-bold sm:col-span-2">Social links</h2>
        <p className="text-xs sm:col-span-2" style={{ color: "var(--muted)" }}>Leave a link blank to show its icon as “coming soon”. Links must start with https://</p>
        {SOCIALS.map((k) => (
          <div key={k}><L id={`s-${k}`}><span className="capitalize">{k}</span> URL</L><input id={`s-${k}`} type="url" className="field" value={form.social_links[k]} onChange={setNested("social_links", k)} placeholder={`https://…`} /></div>
        ))}
      </section>
    </form>
  );
}
