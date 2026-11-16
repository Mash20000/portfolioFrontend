const API_URL = import.meta.env.VITE_API_URL || "/api";

// Privacy-conscious: sends only an event type, a path and an optional project/service id.
// No cookies, no identifiers, and Do Not Track is respected.
export function track(event_type, { path, ref_id } = {}) {
  try {
    if (navigator.doNotTrack === "1") return;
    fetch(`${API_URL}/public/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type, path: path ?? window.location.pathname, ref_id }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* analytics must never break the app */
  }
}