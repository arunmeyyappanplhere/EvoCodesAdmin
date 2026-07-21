'use client';

import React, { useMemo, useState } from "react";
import {
  Plus,
  Download,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Minus,
  X,
} from "lucide-react";

// Local Sub-components for Form Fields and Modal
const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500";

const selectClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500";

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function Modal({ open, onClose, title, subtitle, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

const STATS = [
  { label: "Total Clients", value: "124", delta: "+12%", trend: "up" },
  { label: "Active Projects", value: "42", delta: "Stable", trend: "flat" },
  { label: "Revenue Growth", value: "32.5k", delta: "+8%", trend: "up" },
  { label: "Retention Rate", value: "98.2%", delta: "High", trend: "up" },
];

const CLIENTS = [
  {
    id: 1,
    company: "NexGen Systems",
    domain: "nexgen-systems.io",
    initials: "NG",
    color: "bg-cyan-500/20 text-cyan-300",
    contact: "Sarah Jenkins",
    contactEmail: "s.jenkins@nexgen.io",
    industry: "Cloud Infrastructure",
    activeProjects: 4,
    team: ["SJ", "MC", "+2"],
    status: "Active",
  },
  {
    id: 2,
    company: "Vertex Finance",
    domain: "vertex-fin.com",
    initials: "VF",
    color: "bg-violet-500/20 text-violet-300",
    contact: "Marcus Zhao",
    contactEmail: "m.zhao@vertex.com",
    industry: "Fintech",
    activeProjects: 2,
    team: ["MZ"],
    status: "Active",
  },
  {
    id: 3,
    company: "VitalStream",
    domain: "vitalstream.med",
    initials: "VS",
    color: "bg-emerald-500/20 text-emerald-300",
    contact: "Dr. Elena Kostic",
    contactEmail: "e.kostic@vitalstream.med",
    industry: "Health Tech",
    activeProjects: 7,
    team: ["EK", "AT", "+4"],
    status: "Pending Review",
  },
  {
    id: 4,
    company: "Quantum Logistics",
    domain: "quantum-logistics.net",
    initials: "QL",
    color: "bg-amber-500/20 text-amber-300",
    contact: "David Miller",
    contactEmail: "d.miller@quantum.net",
    industry: "Logistics",
    activeProjects: 1,
    team: ["DM"],
    status: "On Hold",
  },
];

const STATUS_STYLES = {
  Active: "bg-emerald-500/10 text-emerald-400",
  "Pending Review": "bg-amber-500/10 text-amber-400",
  "On Hold": "bg-rose-500/10 text-rose-400",
  Archived: "bg-slate-500/10 text-slate-400",
};

const COLOR_OPTIONS = [
  "bg-cyan-500/20 text-cyan-300",
  "bg-violet-500/20 text-violet-300",
  "bg-emerald-500/20 text-emerald-300",
  "bg-amber-500/20 text-amber-300",
  "bg-rose-500/20 text-rose-300",
];

const FILTERS = ["All", "Active", "Archived"];
const STATUS_OPTIONS = ["Active", "Pending Review", "On Hold", "Archived"];
const INDUSTRY_OPTIONS = [
  "Cloud Infrastructure",
  "Fintech",
  "Health Tech",
  "Logistics",
  "E-commerce",
  "Other",
];

const emptyClientForm = {
  company: "",
  domain: "",
  contact: "",
  contactEmail: "",
  industry: INDUSTRY_OPTIONS[0],
  activeProjects: 0,
  status: STATUS_OPTIONS[0],
};

export default function ClientsPage({ isDarkMode = true }) {
  const [clients, setClients] = useState(CLIENTS);
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyClientForm);

  const filteredClients = useMemo(() => {
    if (filter === "All") return clients;
    if (filter === "Active")
      return clients.filter((c) => c.status === "Active");
    return clients.filter((c) => c.status === "Archived");
  }, [filter, clients]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyClientForm);
    setModalOpen(true);
  };

  const openEditModal = (client) => {
    setEditingId(client.id);
    setForm({
      company: client.company,
      domain: client.domain,
      contact: client.contact,
      contactEmail: client.contactEmail,
      industry: client.industry,
      activeProjects: client.activeProjects,
      status: client.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyClientForm);
  };

  const handleChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = () => {
    if (!form.company.trim()) return;

    const initials = form.company
      ? form.company
          .split(" ")
          .filter(Boolean)
          .map((word) => word[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : "CL";

    const contactInitials = form.contact
      ? form.contact
          .split(" ")
          .filter(Boolean)
          .map((word) => word[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : "NA";

    if (editingId !== null) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                ...form,
                initials,
                activeProjects: Number(form.activeProjects) || 0,
              }
            : c
        )
      );
    } else {
      const newClient = {
        id: Date.now(),
        ...form,
        initials,
        color: COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)],
        activeProjects: Number(form.activeProjects) || 0,
        team: [contactInitials],
      };
      setClients((prev) => [newClient, ...prev]);
    }

    closeModal();
  };

  const handleDelete = (id) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  // Automated CSV Export Handler
  const handleExportCSV = () => {
    if (!filteredClients || filteredClients.length === 0) {
      alert("No client records found to export.");
      return;
    }

    // CSV Headers
    const headers = [
      "Company",
      "Domain",
      "Primary Contact",
      "Contact Email",
      "Industry",
      "Active Projects",
      "Status",
    ];

    // Escape double quotes and format row data
    const rows = filteredClients.map((c) => [
      `"${(c.company || "").replace(/"/g, '""')}"`,
      `"${(c.domain || "").replace(/"/g, '""')}"`,
      `"${(c.contact || "").replace(/"/g, '""')}"`,
      `"${(c.contactEmail || "").replace(/"/g, '""')}"`,
      `"${(c.industry || "").replace(/"/g, '""')}"`,
      c.activeProjects || 0,
      `"${(c.status || "").replace(/"/g, '""')}"`,
    ]);

    // Build standard CSV string with utf-8 BOM to preserve special characters in Excel
    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", `clients_${filter.toLowerCase()}_export.csv`);
      document.body.appendChild(link);
      
      // Trigger click event
      link.click();

      // Clean up DOM references
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 200);
    } catch (err) {
      console.error("CSV Export failed:", err);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-1">
            Admin <span className="mx-1 text-slate-600">/</span>
            <span className="text-cyan-400">Client Directory</span>
          </p>
          <h3
            className={`text-xl md:text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Client Directory
          </h3>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Manage corporate relationships and active infrastructure projects.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {stat.label}
            </p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <span
                className={[
                  "flex items-center gap-1 text-xs font-semibold",
                  stat.trend === "up" ? "text-emerald-400" : "text-slate-400",
                ].join(" ")}
              >
                {stat.trend === "up" ? (
                  <TrendingUp size={12} />
                ) : (
                  <Minus size={12} />
                )}
                {stat.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
        <div className="flex items-center gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors",
                filter === f
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-slate-400 hover:text-slate-200",
              ].join(" ")}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer active:scale-95 transition-all"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-6 py-3.5 font-medium">Company</th>
              <th className="px-6 py-3.5 font-medium">Primary Contact</th>
              <th className="px-6 py-3.5 font-medium">Industry</th>
              <th className="px-6 py-3.5 font-medium">Active Projects</th>
              <th className="px-6 py-3.5 font-medium">Status</th>
              <th className="px-6 py-3.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-800/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${client.color}`}
                    >
                      {client.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100">
                        {client.company}
                      </p>
                      <p className="text-xs text-slate-500">{client.domain}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-200">{client.contact}</p>
                  <p className="text-xs text-slate-500">
                    {client.contactEmail}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-md bg-slate-800 px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-300">
                    {client.industry}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100">
                      {String(client.activeProjects).padStart(2, "0")}
                    </span>
                    <div className="flex -space-x-2">
                      {client.team.map((t, i) => (
                        <span
                          key={i}
                          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-700 text-[10px] font-semibold text-slate-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      STATUS_STYLES[client.status]
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {client.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3 text-slate-400">
                    <button
                      onClick={() => openEditModal(client)}
                      className="hover:text-cyan-400"
                      aria-label="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="hover:text-rose-400"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-3.5">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-300">
              1 to {filteredClients.length}
            </span>{" "}
            of <span className="font-medium text-slate-300">124</span> clients
          </p>
          <div className="flex items-center gap-1">
            <button className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800">
              <ChevronLeft size={16} />
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={[
                  "h-7 w-7 rounded-md text-xs font-medium",
                  p === 1
                    ? "bg-cyan-500 text-slate-950"
                    : "text-slate-400 hover:bg-slate-800",
                ].join(" ")}
              >
                {p}
              </button>
            ))}
            <span className="px-1 text-slate-600">…</span>
            <button className="h-7 w-7 rounded-md text-xs font-medium text-slate-400 hover:bg-slate-800">
              31
            </button>
            <button className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId !== null ? "Edit Client" : "Add Client"}
        subtitle={editingId !== null ? form.company : "Enter client details below"}
        footer={
          <>
            <button
              onClick={closeModal}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
            >
              {editingId !== null ? "Save Changes" : "Create Client"}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Company Name">
            <input
              type="text"
              value={form.company}
              onChange={handleChange("company")}
              className={inputClass}
            />
          </Field>
          <Field label="Domain">
            <input
              type="text"
              value={form.domain}
              onChange={handleChange("domain")}
              className={inputClass}
            />
          </Field>
          <Field label="Primary Contact">
            <input
              type="text"
              value={form.contact}
              onChange={handleChange("contact")}
              className={inputClass}
            />
          </Field>
          <Field label="Contact Email">
            <input
              type="email"
              value={form.contactEmail}
              onChange={handleChange("contactEmail")}
              className={inputClass}
            />
          </Field>
          <Field label="Industry">
            <select
              value={form.industry}
              onChange={handleChange("industry")}
              className={selectClass}
            >
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Active Projects">
            <input
              type="number"
              min="0"
              value={form.activeProjects}
              onChange={handleChange("activeProjects")}
              className={inputClass}
            />
          </Field>
          <div className="col-span-2">
            <Field label="Status">
              <select
                value={form.status}
                onChange={handleChange("status")}
                className={selectClass}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}