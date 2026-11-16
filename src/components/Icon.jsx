import {
  Globe, Cpu, Sheet, Keyboard, LineChart, LayoutDashboard, Wrench, GraduationCap, Code2, Lightbulb,
  Palette, Braces, Atom, Server, Route, Database, Zap, Wind, BarChart3, Workflow, Radar, CircuitBoard,
  Wifi, Monitor, BookOpen, Sparkles,
} from "lucide-react";

// Icons are looked up by the name stored in the database. Importing the few we use keeps the
// bundle small (a wildcard import would defeat tree-shaking). Add new icons here and they become
// available to the admin dashboard's "icon" field.
export const ICONS = {
  Globe, Cpu, Sheet, Keyboard, LineChart, LayoutDashboard, Wrench, GraduationCap, Code2, Lightbulb,
  Palette, Braces, Atom, Server, Route, Database, Zap, Wind, BarChart3, Workflow, Radar, CircuitBoard,
  Wifi, Monitor, BookOpen, Sparkles,
};

export default function Icon({ name, className = "h-5 w-5" }) {
  const Cmp = ICONS[name] || Sparkles;
  return <Cmp className={className} aria-hidden="true" />;
}
