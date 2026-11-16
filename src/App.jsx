import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import PublicLayout from "./layouts/PublicLayout.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";
import { Spinner } from "./components/ui.jsx";
import { track } from "./services/analytics.js";

// Heavier or rarely visited screens are code-split to keep the first load fast.
const ProjectDetail = lazy(() => import("./pages/ProjectDetail.jsx"));
const OrderStatus = lazy(() => import("./pages/OrderStatus.jsx"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout.jsx"));
const Login = lazy(() => import("./admin/Login.jsx"));
const Dashboard = lazy(() => import("./admin/Dashboard.jsx"));
const ProjectsAdmin = lazy(() => import("./admin/ProjectsAdmin.jsx"));
const ServicesAdmin = lazy(() => import("./admin/ServicesAdmin.jsx"));
const SkillsAdmin = lazy(() => import("./admin/SkillsAdmin.jsx"));
const OrdersAdmin = lazy(() => import("./admin/OrdersAdmin.jsx"));
const InquiriesAdmin = lazy(() => import("./admin/InquiriesAdmin.jsx"));
const ContentAdmin = lazy(() => import("./admin/ContentAdmin.jsx"));
const SettingsAdmin = lazy(() => import("./admin/SettingsAdmin.jsx"));
const ActivityAdmin = lazy(() => import("./admin/ActivityAdmin.jsx"));

const Loading = () => (
  <div className="grid min-h-[60vh] place-items-center"><Spinner className="h-8 w-8" /></div>
);

// Fade each page in on navigation (skipped for reduced motion).
function PageTransition({ children }) {
  const reduce = useReducedMotion();
  if (reduce) return children;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      // wait a tick so lazily rendered sections exist
      const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  // privacy-friendly page view count (public pages only)
  useEffect(() => {
    if (!location.pathname.startsWith("/admin")) track("page_view", { path: location.pathname });
  }, [location.pathname]);

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/projects/:slug" element={<PageTransition><ProjectDetail /></PageTransition>} />
            <Route path="/order/:reference" element={<PageTransition><OrderStatus /></PageTransition>} />
          </Route>

          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<ProjectsAdmin />} />
            <Route path="services" element={<ServicesAdmin />} />
            <Route path="skills" element={<SkillsAdmin />} />
            <Route path="orders" element={<OrdersAdmin />} />
            <Route path="inquiries" element={<InquiriesAdmin />} />
            <Route path="content" element={<ContentAdmin />} />
            <Route path="settings" element={<SettingsAdmin />} />
            <Route path="activity" element={<ActivityAdmin />} />
          </Route>

          <Route element={<PublicLayout />}>
            <Route path="*" element={<NotFound />} />
          </Route>
      </Routes>
    </Suspense>
  );
}