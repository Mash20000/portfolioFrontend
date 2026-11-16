import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[80vh] place-items-center pt-24 text-center">
      <Seo title="Page not found" noindex />
      <div>
        <p className="font-display text-8xl font-extrabold gradient-text">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold">This page does not exist</h1>
        <p className="mt-2" style={{ color: "var(--muted)" }}>
          The link may be broken or the page may have moved.
        </p>
        <Link to="/" className="btn-primary mt-6">Back to home</Link>
      </div>
    </div>
  );
}
