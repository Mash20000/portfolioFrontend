// Lightweight animated gradient: three blurred blobs moved with transform only (GPU-friendly).
// No WebGL/Three.js: it keeps the page fast on phones. Motion stops under prefers-reduced-motion.
export default function Background() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[var(--bg)]" />
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <div className="blob blob-c hidden sm:block" />
      <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:28px_28px]" />
    </div>
  );
}
