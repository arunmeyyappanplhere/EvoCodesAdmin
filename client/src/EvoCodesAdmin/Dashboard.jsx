import React, { useEffect, useState } from "react";
import {
  Users,
  Layers,
  Briefcase,
  BookOpen,
  MessageSquare,
  Building2,
  Star,
  ArrowUpRight,
  UserPlus,
  PlusCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// -----------------------------------------------------------------------
// Dashboard
// Top-level overview pulling counts + recent activity from every entity:
// employees, clients, services, projects, blogs, testimonials, contact
// requests. Wire the fetch calls in loadDashboardData() to your real API
// (e.g. GET /employees, GET /clients, GET /services, ...).
// -----------------------------------------------------------------------

const STATUS_COLORS = {
  ACTIVE: "#34D399",
  "ON LEAVE": "#FBBF24",
  DISABLED: "var(--accent-rose)",
  PENDING: "#38BDF8",
};

const StatCard = ({ icon: Icon, label, value, trend, accent }) => (
  <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium tracking-wider text-gray-400 uppercase">
        {label}
      </span>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}
      >
        <Icon size={16} style={{ color: accent }} />
      </div>
    </div>
    <div className="flex items-end justify-between">
      <span className="text-2xl font-semibold text-white">{value}</span>
      {trend && (
        <span className="text-xs text-emerald-400 flex items-center gap-0.5">
          <ArrowUpRight size={12} />
          {trend}
        </span>
      )}
    </div>
  </div>
);

const ActivityItem = ({ dot, title, subtitle, time }) => (
  <div className="flex items-start gap-3 py-3 border-b border-[var(--border-subtle)] last:border-0">
    <span
      className="mt-1.5 w-2 h-2 rounded-full shrink-0"
      style={{ backgroundColor: dot }}
    />
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-200 truncate">{title}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
    <span className="text-xs text-gray-500 whitespace-nowrap">{time}</span>
  </div>
);

const QuickAction = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-cyan-hover)] rounded-lg px-4 py-2.5 text-sm text-gray-200 transition-colors"
  >
    <Icon size={15} className="text-[var(--accent-cyan)]" />
    {label}
  </button>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    clients: 0,
    services: 0,
    projects: 0,
    blogs: 0,
    testimonials: 0,
    contactRequests: 0,
  });
  const [departmentData, setDepartmentData] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Replace with real endpoints, e.g.:
      // const [employeesRes, clientsRes, servicesRes, blogsRes, contactRes] =
      //   await Promise.all([
      //     fetch("/employees").then((r) => r.json()),
      //     fetch("/clients").then((r) => r.json()),
      //     fetch("/services").then((r) => r.json()),
      //     fetch("/blogs").then((r) => r.json()),
      //     fetch("/contactrequests").then((r) => r.json()),
      //   ]);

      // Placeholder data matching your existing screens until wired up
      setStats({
        employees: 128,
        clients: 124,
        services: 4,
        projects: 42,
        blogs: 16,
        testimonials: 9,
        contactRequests: 5,
      });

      setDepartmentData([
        { name: "Engineering", value: 64, color: "#38BDF8" },
        { name: "Design", value: 18, color: "#34D399" },
        { name: "Marketing", value: 24, color: "#818CF8" },
        { name: "Operations", value: 22, color: "#FBBF24" },
      ]);

      setActivity([
        {
          dot: "#38BDF8",
          title: "New contact request from David Miller",
          subtitle: "Quantum Logistics",
          time: "2h ago",
        },
        {
          dot: "#34D399",
          title: '"Scaling GraphQL at Evo Codes" published',
          subtitle: "Blog · Engineering",
          time: "5h ago",
        },
        {
          dot: "#818CF8",
          title: "VitalStream added as a new client",
          subtitle: "Health Tech",
          time: "1d ago",
        },
        {
          dot: "#FBBF24",
          title: "Marcus Chen set to On Leave",
          subtitle: "Operations",
          time: "2d ago",
        },
      ]);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: Users, label: "Employees", value: stats.employees, accent: "#38BDF8" },
    { icon: Building2, label: "Clients", value: stats.clients, accent: "#34D399" },
    { icon: Layers, label: "Services", value: stats.services, accent: "var(--accent-cyan)" },
    { icon: Briefcase, label: "Active Projects", value: stats.projects, accent: "#818CF8" },
    { icon: BookOpen, label: "Blog Posts", value: stats.blogs, accent: "#FBBF24" },
    { icon: Star, label: "Testimonials", value: stats.testimonials, accent: "#F472B6" },
    { icon: MessageSquare, label: "Contact Requests", value: stats.contactRequests, accent: "var(--accent-rose)" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            A snapshot of Evo Codes across teams, clients, and content.
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <QuickAction icon={UserPlus} label="Add Employee" />
        <QuickAction icon={PlusCircle} label="Add Service" />
        <QuickAction icon={Building2} label="Add Client" />
        <QuickAction icon={BookOpen} label="New Blog Post" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Chart + activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department distribution */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-200 mb-1">
            Department Distribution
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Headcount across all departments
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  color: "#fff",
                }}
                cursor={{ fill: "var(--border-subtle)" }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {departmentData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent activity */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-200 mb-1">
            Recent Activity
          </h2>
          <p className="text-xs text-gray-500 mb-2">
            Latest updates across the console
          </p>
          <div>
            {activity.map((item, i) => (
              <ActivityItem key={i} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}