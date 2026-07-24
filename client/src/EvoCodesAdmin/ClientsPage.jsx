'use client';

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Download,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import axiosInstance from "./api/Axiosinstance"; // adjust to wherever Axiosinstance.js actually lives

import AlertModal from "./AlertModal";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">{footer}</div>}
      </div>
    </div>
  );
}

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
const INDUSTRY_OPTIONS = ["Cloud Infrastructure", "Fintech", "Health Tech", "Logistics", "E-commerce", "Other"];

const emptyClientForm = {
  companyName: "",
  companyDomain: "",
  primaryContactName: "",
  primaryContactEmail: "",
  industry: INDUSTRY_OPTIONS[0],
  activeProjects: 0,
  clientStatus: STATUS_OPTIONS[0],
};

// Deterministic color pick based on company name so it doesn't change on every re-render
const colorFor = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return COLOR_OPTIONS[Math.abs(hash) % COLOR_OPTIONS.length];
};

const initialsFor = (str = "", fallback = "NA") =>
  str
    ? str.split(" ").filter(Boolean).map((w) => w[0]).join("").substring(0, 2).toUpperCase()
    : fallback;

export default function ClientsPage({ isDarkMode = true }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // clientID
  const [form, setForm] = useState(emptyClientForm);
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: 'OK',
    showCancel: false
  });

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/clients");
      setClients(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response?.status === 400) {
        setClients([]);
      } else {
        setError("Couldn't load clients. Please refresh and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    if (filter === "All") return clients;
    if (filter === "Active") return clients.filter((c) => c.clientStatus === "Active");
    return clients.filter((c) => c.clientStatus === "Archived");
  }, [filter, clients]);

  const stats = useMemo(() => {
    const totalActiveProjects = clients.reduce((sum, c) => sum + (Number(c.activeProjects) || 0), 0);
    const activeCount = clients.filter((c) => c.clientStatus === "Active").length;
    const industries = new Set(clients.map((c) => c.industry).filter(Boolean));
    return {
      total: clients.length,
      active: activeCount,
      totalActiveProjects,
      industries: industries.size,
    };
  }, [clients]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyClientForm);
    setModalOpen(true);
  };

  const openEditModal = (client) => {
    setEditingId(client.clientID);
    setForm({
      companyName: client.companyName || "",
      companyDomain: client.companyDomain || "",
      primaryContactName: client.primaryContactName || "",
      primaryContactEmail: client.primaryContactEmail || "",
      industry: client.industry || INDUSTRY_OPTIONS[0],
      activeProjects: client.activeProjects || 0,
      clientStatus: client.clientStatus || STATUS_OPTIONS[0],
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyClientForm);
  };

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.companyName.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      const payload = { ...form, activeProjects: Number(form.activeProjects) || 0 };
      if (editingId) {
        const res = await axiosInstance.put(`/clients/${editingId}`, payload);
        setClients((prev) => prev.map((c) => (c.clientID === editingId ? res.data : c)));
      } else {
        const res = await axiosInstance.post("/clients", payload);
        setClients((prev) => [res.data, ...prev]);
      }
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to save client.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (clientID) => {
    setAlertConfig({
      isOpen: true,
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this client?',
      type: 'warning',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: async () => {
        setError(null);
        try {
          await axiosInstance.delete(`/clients/${clientID}`);
          setClients((prev) => prev.filter((c) => c.clientID !== clientID));
        } catch {
          setError("Failed to delete the client.");
        }
      }
    });
  };

  const handleExportCSV = () => {
    if (!filteredClients || filteredClients.length === 0) {
      setAlertConfig({
        isOpen: true,
        title: 'Export Failed',
        message: 'No client records found to export.',
        type: 'warning',
        confirmText: 'OK'
      });
      return;
    }
    const headers = ["Company", "Domain", "Primary Contact", "Contact Email", "Industry", "Active Projects", "Status"];
    const rows = filteredClients.map((c) => [
      `"${(c.companyName || "").replace(/"/g, '""')}"`,
      `"${(c.companyDomain || "").replace(/"/g, '""')}"`,
      `"${(c.primaryContactName || "").replace(/"/g, '""')}"`,
      `"${(c.primaryContactEmail || "").replace(/"/g, '""')}"`,
      `"${(c.industry || "").replace(/"/g, '""')}"`,
      c.activeProjects || 0,
      `"${(c.clientStatus || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `clients_${filter.toLowerCase()}_export.csv`);
      document.body.appendChild(link);
      link.click();
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
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-1">
            Admin <span className="mx-1 text-slate-600">/</span>
            <span className="text-cyan-400">Client Directory</span>
          </p>
          <h3 className={`text-xl md:text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Client Directory</h3>
          <p className="text-xs md:text-sm text-gray-400 mt-1">Manage corporate relationships and active infrastructure projects.</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-400">
          <Plus size={16} strokeWidth={2.5} /> Add Client
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
          <div className="flex items-center gap-2"><AlertCircle size={14} /><span>{error}</span></div>
          <button onClick={() => setError(null)} aria-label="Dismiss"><X size={14} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Clients", value: stats.total },
          { label: "Active Clients", value: stats.active },
          { label: "Active Projects", value: stats.totalActiveProjects },
          { label: "Industries", value: stats.industries },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
        <div className="flex items-center gap-1">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={["rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors", filter === f ? "bg-cyan-500/10 text-cyan-400" : "text-slate-400 hover:text-slate-200"].join(" ")}>
              {f}
            </button>
          ))}
        </div>
        <button type="button" onClick={handleExportCSV} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 active:scale-95 transition-all">
          <Download size={14} /> Export CSV
        </button>
      </div>

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
            {loading ? (
              <tr><td colSpan="6" className="py-10 text-center text-slate-500 text-sm">
                <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading clients...</span>
              </td></tr>
            ) : filteredClients.length === 0 ? (
              <tr><td colSpan="6" className="py-10 text-center text-slate-500 text-sm">No clients found.</td></tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.clientID} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${colorFor(client.companyName)}`}>
                        {initialsFor(client.companyName, "CL")}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100">{client.companyName}</p>
                        <p className="text-xs text-slate-500">{client.companyDomain}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-200">{client.primaryContactName}</p>
                    <p className="text-xs text-slate-500">{client.primaryContactEmail}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-md bg-slate-800 px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-300">{client.industry}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-100">{String(client.activeProjects ?? 0).padStart(2, "0")}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[client.clientStatus] || STATUS_STYLES.Archived}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {client.clientStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 text-slate-400">
                      <button onClick={() => openEditModal(client)} className="hover:text-cyan-400" aria-label="Edit"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(client.clientID)} className="hover:text-rose-400" aria-label="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-3.5">
          <p className="text-xs text-slate-500">
            Showing <span className="font-medium text-slate-300">{filteredClients.length}</span> of{" "}
            <span className="font-medium text-slate-300">{clients.length}</span> clients
          </p>
          <div className="flex items-center gap-1">
            <button className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800"><ChevronLeft size={16} /></button>
            <button className="h-7 w-7 rounded-md text-xs font-medium bg-cyan-500 text-slate-950">1</button>
            <button className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? "Edit Client" : "Add Client"}
        subtitle={editingId ? form.companyName : "Enter client details below"}
        footer={
          <>
            <button onClick={closeModal} disabled={isSaving} className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50">Cancel</button>
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50">
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              {editingId ? "Save Changes" : "Create Client"}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Company Name">
            <input type="text" value={form.companyName} onChange={handleChange("companyName")} className={inputClass} />
          </Field>
          <Field label="Domain">
            <input type="text" value={form.companyDomain} onChange={handleChange("companyDomain")} className={inputClass} />
          </Field>
          <Field label="Primary Contact">
            <input type="text" value={form.primaryContactName} onChange={handleChange("primaryContactName")} className={inputClass} />
          </Field>
          <Field label="Contact Email">
            <input type="email" value={form.primaryContactEmail} onChange={handleChange("primaryContactEmail")} className={inputClass} />
          </Field>
          <Field label="Industry">
            <select value={form.industry} onChange={handleChange("industry")} className={selectClass}>
              {INDUSTRY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </Field>
          <Field label="Active Projects">
            <input type="number" min="0" value={form.activeProjects} onChange={handleChange("activeProjects")} className={inputClass} />
          </Field>
          <div className="col-span-2">
            <Field label="Status">
              <select value={form.clientStatus} onChange={handleChange("clientStatus")} className={selectClass}>
                {STATUS_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </Field>
          </div>
        </div>
      </Modal>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        showCancel={alertConfig.showCancel}
        onConfirm={alertConfig.onConfirm}
      />
    </div>
  );
}
