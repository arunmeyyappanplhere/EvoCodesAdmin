import React, { useEffect, useState } from "react";
import { TrendingUp, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import axiosInstance from "./api/axiosInstance";

// -----------------------------------------------------------------------
// Analytics
// Trend + distribution views pulled from:
//   GET /analytics/growth-trend      -> analyticsController.getGrowthTrend
//   GET /analytics/services-status   -> analyticsController.getServicesByStatus
//   GET /analytics/clients-industry  -> analyticsController.getClientsByIndustry
//   GET /analytics/top-clients       -> analyticsController.getTopClientsByProjects
// -----------------------------------------------------------------------

const SERVICE_STATUS_COLORS = {
  Active: "#34D399",
  Maintenance: "#FBBF24",
  Disabled: "var(--accent-rose)",
  Legacy: "#6B7280",
};

const INDUSTRY_COLORS = ["#38BDF8", "#818CF8", "#34D399", "#FBBF24", "#F472B6", "#22D3EE", "#FB923C"];

const RANGES = ["7D", "30D", "90D", "12M"];

const Panel = ({ title, subtitle, children, right }) => (
  <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-200">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
    {children}
  </div>
);

const Legend2 = ({ items }) => (
  <div className="flex flex-wrap gap-4 mt-4">
    {items.map((item) => (
      <div key={item.label} className="flex items-center gap-2 text-xs text-gray-400">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        {item.label}
        <span className="text-gray-500">({item.value})</span>
      </div>
    ))}
  </div>
);

const EmptyState = ({ label }) => (
  <div className="flex items-center justify-center h-[220px] text-gray-500 text-sm">
    {label}
  </div>
);

export default function Analytics() {
  const [range, setRange] = useState("30D");
  const [growthData, setGrowthData] = useState([]);
  const [growthTrendPct, setGrowthTrendPct] = useState(null);
  const [serviceStatusData, setServiceStatusData] = useState([]);
  const [industryData, setIndustryData] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalyticsData(range);
    // Note: the current /analytics/growth-trend endpoint always returns the
    // last 6 months and doesn't accept a range filter yet. The range
    // selector is wired up and will re-fetch when the backend supports a
    // `?range=` query param — see the note in the response for how to add it.
  }, [range]);

  const loadAnalyticsData = async (selectedRange) => {
    try {
      setLoading(true);
      setError(null);

      const [growthRes, statusRes, industryRes, topClientsRes] = await Promise.all([
        axiosInstance.get("/analytics/growth-trend", { params: { range: selectedRange } }),
        axiosInstance.get("/analytics/services-status"),
        axiosInstance.get("/analytics/clients-industry"),
        axiosInstance.get("/analytics/top-clients"),
      ]);

      // --- Growth trend: { months: [...], clients: [...], employees: [...] } ---
      const growth = growthRes.data || {};
      const months = growth.months || [];
      const clientsSeries = growth.clients || [];
      const employeesSeries = growth.employees || [];
      const mappedGrowth = months.map((month, i) => ({
        month,
        clients: clientsSeries[i] ?? 0,
        employees: employeesSeries[i] ?? 0,
      }));
      setGrowthData(mappedGrowth);

      // Derive a simple "% change this period" from first vs last clients count
      if (mappedGrowth.length >= 2) {
        const first = mappedGrowth[0].clients;
        const last = mappedGrowth[mappedGrowth.length - 1].clients;
        if (first > 0) {
          setGrowthTrendPct(Math.round(((last - first) / first) * 100));
        } else {
          setGrowthTrendPct(null);
        }
      } else {
        setGrowthTrendPct(null);
      }

      // --- Services by status: [{ status, count }] ---
      const statusList = statusRes.data || [];
      setServiceStatusData(
        statusList.map((item) => ({
          name: item.status,
          value: item.count,
          color: SERVICE_STATUS_COLORS[item.status] || "#6B7280",
        }))
      );

      // --- Clients by industry: [{ industry, count }] ---
      const industryList = industryRes.data || [];
      setIndustryData(
        industryList.map((item, i) => ({
          name: item.industry || "Unspecified",
          value: item.count,
          color: INDUSTRY_COLORS[i % INDUSTRY_COLORS.length],
        }))
      );

      // --- Top clients: [{ company, industry, activeProjects }] ---
      const topClientsList = topClientsRes.data || [];
      setTopClients(
        topClientsList.map((item) => ({
          name: item.company,
          industry: item.industry,
          projects: item.activeProjects,
        }))
      );
    } catch (err) {
      console.error("Failed to load analytics data:", err);
      setError("Couldn't load analytics data. Please try again.");
      setGrowthData([]);
      setGrowthTrendPct(null);
      setServiceStatusData([]);
      setIndustryData([]);
      setTopClients([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] p-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-[#4cc9f0] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-gray-400 mt-1">
            Growth, distribution, and performance trends across Evo Codes.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                range === r
                  ? "bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)] hover:text-[var(--accent-cyan-hover)]"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 text-sm text-[var(--accent-rose)] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Growth trend */}
      <Panel
        title="Growth Trend"
        subtitle="Clients and employees over time"
        right={
          growthTrendPct !== null && (
            <span
              className={`flex items-center gap-1 text-xs ${
                growthTrendPct >= 0 ? "text-emerald-400" : "text-[var(--accent-rose)]"
              }`}
            >
              <TrendingUp size={13} />
              {growthTrendPct >= 0 ? "+" : ""}
              {growthTrendPct}% this period
            </span>
          )
        }
      >
        {growthData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="month" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  color: "#fff",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: "#9CA3AF" }} />
              <Line
                type="monotone"
                dataKey="clients"
                stroke="var(--accent-cyan)"
                strokeWidth={2}
                dot={false}
                name="Clients"
              />
              <Line
                type="monotone"
                dataKey="employees"
                stroke="#818CF8"
                strokeWidth={2}
                dot={false}
                name="Employees"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState label="No growth data available" />
        )}
      </Panel>

      {/* Distribution charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Panel title="Services by Status" subtitle="Current state of all service packages">
          {serviceStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={serviceStatusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {serviceStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 8,
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Legend2 items={serviceStatusData.map((d) => ({ label: d.name, value: d.value, color: d.color }))} />
            </>
          ) : (
            <EmptyState label="No service status data available" />
          )}
        </Panel>

        <Panel title="Clients by Industry" subtitle="Distribution across sectors served">
          {industryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={industryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {industryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 8,
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Legend2 items={industryData.map((d) => ({ label: d.name, value: d.value, color: d.color }))} />
            </>
          ) : (
            <EmptyState label="No industry data available" />
          )}
        </Panel>
      </div>

      {/* Top clients table */}
      <div className="mt-6">
        <Panel title="Top Clients by Active Projects" subtitle="Ranked by current project load">
          {topClients.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-[var(--border-subtle)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-[var(--bg-main)]">
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Industry</th>
                    <th className="px-4 py-3 font-medium text-right">Active Projects</th>
                  </tr>
                </thead>
                <tbody>
                  {topClients.map((client, i) => (
                    <tr key={client.name} className={i !== topClients.length - 1 ? "border-b border-[var(--border-subtle)]" : ""}>
                      <td className="px-4 py-3 text-gray-200 font-medium">{client.name}</td>
                      <td className="px-4 py-3 text-gray-400">{client.industry}</td>
                      <td className="px-4 py-3 text-right text-gray-200">{client.projects}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState label="No client data available" />
          )}
        </Panel>
      </div>
    </div>
  );
}