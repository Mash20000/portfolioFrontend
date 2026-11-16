import CrudManager from "./CrudManager.jsx";
import { ICONS } from "../components/Icon.jsx";

const GROUPS = ["Web Development", "Data and Productivity", "IoT and Hardware", "Education and Training"];

const fields = [
  { key: "name", label: "Skill name", required: true },
  { key: "group_name", label: "Group", type: "select", options: GROUPS, blank: false, default: GROUPS[0] },
  { key: "icon", label: "Icon", type: "select", options: Object.keys(ICONS) },
  { key: "proficiency", label: "Proficiency (0–100)", type: "number", min: 0, max: 100, default: 70 },
  { key: "level_label", label: "Level label", placeholder: "Advanced, Proficient…" },
  { key: "sort_order", label: "Sort order", type: "number", min: 0 },
  { key: "is_published", label: "Published", type: "checkbox", default: true },
];

const columns = [
  { label: "Skill", render: (r) => <span className="font-medium">{r.name}</span> },
  { label: "Group", key: "group_name" },
  { label: "Level", render: (r) => `${r.proficiency}% ${r.level_label ? `· ${r.level_label}` : ""}` },
  { label: "Published", render: (r) => (r.is_published ? "Yes" : "No") },
];

export default function SkillsAdmin() {
  return <CrudManager title="Skills" resource="skills" noun="Skill" fields={fields} columns={columns} />;
}
