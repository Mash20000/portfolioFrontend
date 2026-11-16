import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, FolderKanban, Inbox, Clock, ShoppingBag, Wallet, Wrench } from "lucide-react";
import { ErrorState, Skeleton } from "../components/ui.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { adminApi } from "../services/adminApi.js";
import { formatKES } from "../utils/format.js";
import { PageTitle } from "./ui.jsx";

const Stat = ({ icon: I, label, value }) => (
  <div className="glass p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm" style={{ color: "var(--muted)" }}>{label}</p>
      <I className="h-5 w-5 text-accent-teal" aria-hidden="true" />
    </div>
    <p className="mt-2 font-display text-2xl font-extrabold">{value}</p>
  </div>
);

export default function Dashboard() {
  const { data: d, loading, error, reload } = useFetch("/stats", (p) => adminApi.get(p));

  return (
    <div>
      <PageTitle title="Overview" />
      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>}
      {d && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat icon={FolderKanban} label="Total projects" value={d.projects} />
            <Stat icon={Wrench} label="Total services" value={d.services} />
            <Stat icon={ShoppingBag} label="Total orders" value={d.orders} />
            <Stat icon={Wallet} label="Total revenue (paid)" value={formatKES(d.revenue)} />
            <Stat icon={Clock} label="Pending orders" value={d.pendingOrders} />
            <Stat icon={CheckCircle2} label="Successful payments" value={d.paidPayments} />
            <Stat icon={Inbox} label="New inquiries" value={d.newInquiries} />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
            <section className="glass p-5" aria-label="Revenue over the last 14 days">
              <h2 className="font-display font-bold">Revenue, last 14 days (KES)</h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={d.revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,180,0.25)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "currentColor" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "currentColor" }} axisLine={false} tickLine={false} width={48} />
                    <Tooltip formatter={(v) => formatKES(v)} contentStyle={{ background: "#11142a", border: "none", borderRadius: 12, color: "#fff" }} />
                    <Bar dataKey="total" fill="#8b7cff" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="glass p-5">
              <h2 className="font-display font-bold">Site activity, last 30 days</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between"><dt>Page views</dt><dd className="font-semibold">{d.analytics.page_view}</dd></div>
                <div className="flex justify-between"><dt>Project clicks</dt><dd className="font-semibold">{d.analytics.project_click}</dd></div>
                <div className="flex justify-between"><dt>Service inquiries</dt><dd className="font-semibold">{d.analytics.service_inquiry}</dd></div>
                <div className="flex justify-between"><dt>WhatsApp clicks</dt><dd className="font-semibold">{d.analytics.whatsapp_click}</dd></div>
              </dl>
              <p className="mt-4 text-xs" style={{ color: "var(--muted)" }}>Anonymous counts only: no cookies or IP addresses are stored.</p>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
