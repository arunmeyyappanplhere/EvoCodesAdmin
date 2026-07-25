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

const SERVICE_STATUS_COLORS = {
  Active: "#34D399",
  Maintenance: "#FBBF24",
  Disabled: "var(--accent-rose)",
  Legacy: "#6B7280",
};

const INDUSTRY_COLORS = ["#38BDF8", "#818CF8", "#34D399", "#FBBF24", "#F472B6"];

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

export default function Analytics() {
  const [range, setRange] = useState("30D");
  const [growthData, setGrowthData] = useState([]);
  const [serviceStatusData, setServiceStatusData] = useState([]);
  const [industryData, setIndustryData] = useState([]);
  const [topClients, setTopClients] = useState([]);

  useEffect(() => {
    loadAnalyticsData(range);
  }, [range]);

  const loadAnalyticsData = async (selectedRange) => {
    try {
      const [growthRes, servicesRes, industryRes, topClientsRes] = await Promise.all([
        axiosInstance.get("/analytics/growth-trend"),
        axiosInstance.get("/analytics/services-status"),
        axiosInstance.get("/analytics/clients-industry"),
        axiosInstance.get("/analytics/top-clients"),
      ]);

      // Growth trend: { months: [...], clients: [...], employees: [...] }
      const growth = growthRes.data;
      setGrowthData(
        (growth.months ?? []).map((month, i) => ({
          month,
          clients: (growth.clients ?? [])[i] ?? 0,
          employees: (growth.employees ?? [])[i] ?? 0,
        }))
      );

      // Services by status: [{ status, count }, ...]
      const servicesData = servicesRes.data ?? [];
      setServiceStatusData(
        servicesData.map((item) => ({
          name: item.status ?? "Unknown",
          value: item.count ?? 0,
          color: SERVICE_STATUS_COLORS[item.status] || "#6B7280",
        }))
      );

      // Clients by industry: [{ industry, count }, ...]
      const industryRaw = industryRes.data ?? [];
      setIndustryData(
        industryRaw.map((item, i) => ({
          name: item.industry ?? "Other",
          value: item.count ?? 0,
          color: INDUSTRY_COLORS[i % INDUSTRY_COLORS.length],
        }))
      );

      // Top clients: [{ company, industry, activeProjects }, ...]
      const topRaw = topClientsRes.data ?? [];
      setTopClients(
        topRaw.map((item) => ({
          name: item.company ?? "Unknown",
          industry: item.industry ?? "—",
          projects: item.activeProjects ?? 0,
        }))
      );
    } catch (err) {
      console.error("Failed to load analytics data:", err);
    }
  };

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

      {/* Growth trend */}
      <Panel
        title="Growth Trend"
        subtitle="Clients and employees over time"
        right={
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <TrendingUp size={13} />
            +12% this period
          </span>
        }
      >
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
      </Panel>

      {/* Distribution charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Panel title="Services by Status" subtitle="Current state of all service packages">
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
        </Panel>

        <Panel title="Clients by Industry" subtitle="Distribution across sectors served">
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
        </Panel>
      </div>

      {/* Top clients table */}
      <div className="mt-6">
        <Panel title="Top Clients by Active Projects" subtitle="Ranked by current project load">
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
        </Panel>
      </div>
    </div>
  );
}