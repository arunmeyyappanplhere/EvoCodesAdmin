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
import axiosInstance from "./api/axiosInstance";

// -----------------------------------------------------------------------
// Dashboard
// Top-level overview pulling counts from /dashboard/stats and department
// distribution from /dashboard/departments.
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

const QuickAction = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-cyan-hover)] rounded-lg px-4 py-2.5 text-sm text-gray-200 transition-colors"
  >
    <Icon size={15} className="text-[var(--accent-cyan)]" />
    {label}
  </button>
);

export default function Dashboard({ onNavigate }) {
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats and department data in parallel
      const [statsRes, deptRes] = await Promise.all([
        axiosInstance.get("/dashboard/stats"),
        axiosInstance.get("/dashboard/departments"),
      ]);

      const statsData = statsRes.data;
      const deptData = deptRes.data;

      setStats({
        employees: statsData.employees ?? 0,
        clients: statsData.clients ?? 0,
        services: statsData.services ?? 0,
        projects: statsData.activeProjects ?? 0,
        blogs: statsData.blogPosts ?? 0,
        testimonials: statsData.testimonials ?? 0,
        contactRequests: statsData.contactRequests ?? 0,
      });

      // Map department data to chart format
      const departmentColors = ["#38BDF8", "#34D399", "#818CF8", "#FBBF24", "#F472B6", "#A78BFA"];
      const mappedDeptData = (deptData.departments || deptData || []).map((dept, i) => ({
        name: dept.name || dept.department || "Unknown",
        value: dept.count || dept.headcount || dept.value || 0,
        color: departmentColors[i % departmentColors.length],
      }));

      setDepartmentData(mappedDeptData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      // Fallback to empty data on error
      setStats({
        employees: 0,
        clients: 0,
        services: 0,
        projects: 0,
        blogs: 0,
        testimonials: 0,
        contactRequests: 0,
      });
      setDepartmentData([]);
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
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            A snapshot of Evo Codes across teams, clients, and content.
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <QuickAction 
          icon={UserPlus} 
          label="Add Employee" 
          onClick={() => onNavigate && onNavigate('Employees')}
        />
        <QuickAction 
          icon={PlusCircle} 
          label="Add Service" 
          onClick={() => onNavigate && onNavigate('Services')}
        />
        <QuickAction 
          icon={Building2} 
          label="Add Client" 
          onClick={() => onNavigate && onNavigate('Clients')}
        />
        <QuickAction 
          icon={BookOpen} 
          label="New Blog Post" 
          onClick={() => onNavigate && onNavigate('Blogs')}
        />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Department distribution chart */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-200 mb-1">
            Department Distribution
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Headcount across all departments
          </p>
          {departmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
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
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm">
              No department data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}