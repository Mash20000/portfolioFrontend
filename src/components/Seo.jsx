import { Helmet } from "react-helmet-async";

export default function Seo({ title, description, image, path = "", noindex = false }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <meta property="og:type" content="website" />
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image} />}
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
    </Helmet>
  );
}
