import { useState } from "react";
import CrudManager from "./CrudManager.jsx";

const TABS = {
  testimonials: {
    label: "Testimonials",
    props: {
      title: "Testimonials",
      resource: "testimonials",
      noun: "Testimonial",
      fields: [
        { key: "author_name", label: "Author name", required: true },
        { key: "author_role", label: "Role / company" },
        { key: "content", label: "Testimonial", type: "textarea", full: true },
        { key: "rating", label: "Rating (1–5)", type: "number", min: 1, max: 5, nullable: true },
        { key: "sort_order", label: "Sort order", type: "number", min: 0 },
        { key: "is_published", label: "Published", type: "checkbox", default: true },
      ],
      columns: [
        { label: "Author", render: (r) => <span className="font-medium">{r.author_name}</span> },
        { label: "Quote", render: (r) => <span className="line-clamp-2">{r.content}</span> },
        { label: "Published", render: (r) => (r.is_published ? "Yes" : "No") },
      ],
    },
  },
  faqs: {
    label: "FAQs",
    props: {
      title: "FAQs",
      resource: "faqs",
      noun: "FAQ",
      fields: [
        { key: "question", label: "Question", required: true, full: true },
        { key: "answer", label: "Answer", type: "textarea", full: true },
        { key: "sort_order", label: "Sort order", type: "number", min: 0 },
        { key: "is_published", label: "Published", type: "checkbox", default: true },
      ],
      columns: [
        { label: "Question", render: (r) => <span className="font-medium">{r.question}</span> },
        { label: "Published", render: (r) => (r.is_published ? "Yes" : "No") },
      ],
    },
  },
  "project-categories": {
    label: "Project categories",
    props: {
      title: "Project categories",
      resource: "project-categories",
      noun: "Category",
      searchable: false,
      fields: [
        { key: "name", label: "Name", required: true },
        { key: "sort_order", label: "Sort order", type: "number", min: 0 },
      ],
      columns: [
        { label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
        { label: "Slug", key: "slug" },
      ],
    },
  },
  "service-categories": {
    label: "Service categories",
    props: {
      title: "Service categories",
      resource: "service-categories",
      noun: "Category",
      searchable: false,
      fields: [
        { key: "name", label: "Name", required: true },
        { key: "sort_order", label: "Sort order", type: "number", min: 0 },
      ],
      columns: [
        { label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
        { label: "Slug", key: "slug" },
      ],
    },
  },
};

export default function ContentAdmin() {
  const [tab, setTab] = useState("testimonials");
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Content type">
        {Object.entries(TABS).map(([key, t]) => (
          <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={`rounded-full px-4 py-1.5 text-sm font-medium ${tab === key ? "bg-iridescent text-ink-950" : "glass"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <CrudManager key={tab} {...TABS[tab].props} />
    </div>
  );
}
