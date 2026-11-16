import CrudManager from "./CrudManager.jsx";
import { Badge } from "./ui.jsx";
import { formatKES } from "../utils/format.js";
import { ICONS } from "../components/Icon.jsx";

const fields = [
  { key: "title", label: "Title", required: true, full: true },
  { key: "description", label: "Description", type: "textarea", full: true },
  { key: "category_id", label: "Category", type: "select" },
  { key: "icon", label: "Icon", type: "select", options: Object.keys(ICONS), help: "Shown on the service card." },
  { key: "price_kes", label: "Price (KES)", type: "number", min: 0, step: 1, required: true },
  { key: "delivery_estimate", label: "Estimated delivery", placeholder: "e.g. 3–5 days" },
  { key: "features", label: "Features included", type: "lines", full: true, rows: 5, help: "One feature per line." },
  { key: "is_starting_price", label: "Show “From” before the price", type: "checkbox", default: true },
  { key: "allow_quantity", label: "Customer can choose a quantity", type: "checkbox" },
  { key: "quantity_label", label: "Quantity label", placeholder: "sessions, batches, hours…" },
  { key: "sort_order", label: "Sort order", type: "number", min: 0 },
  { key: "is_active", label: "Active (visible on the website)", type: "checkbox", default: true },
];

const columns = [
  { label: "Service", render: (r) => <span className="font-medium">{r.title}</span> },
  { label: "Price", render: (r) => formatKES(r.price_kes) },
  { label: "Delivery", key: "delivery_estimate" },
  { label: "Status", render: (r) => <Badge value={r.is_active ? "paid" : "closed"} /> },
];

export default function ServicesAdmin() {
  return (
    <CrudManager
      title="Services"
      resource="services"
      noun="Service"
      fields={fields}
      optionsFrom={{ category_id: "service-categories" }}
      columns={columns}
    />
  );
}
