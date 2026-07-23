import React, { useEffect, useMemo, useState } from "react";
import * as LucideIcons from "lucide-react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Boxes,
  Tags,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import axiosInstance from "./api/Axiosinstance"; // adjust this path to wherever Axiosinstance.js actually lives

// A curated shortlist shown in the icon picker's dropdown/autocomplete.
// Admins can still type ANY valid lucide-react icon name (PascalCase) and it will work.
const ICON_SUGGESTIONS = [
  "Server", "Cloud", "ShieldCheck", "BarChart3", "Layers", "Database",
  "Code", "Smartphone", "Globe", "Cpu", "Lock", "Zap", "Settings",
  "Palette", "Rocket", "Terminal", "Network", "Boxes", "GitBranch",
  "Workflow", "Bot", "LineChart", "PieChart", "Wrench", "Package",
  "Layout", "MonitorSmartphone", "Webhook", "Braces", "Container",
];

const FALLBACK_ICON = "Server";
const FALLBACK_COLOR = "#22d3ee"; // cyan-400

const emptyServiceForm = {
  serviceName: "",
  serviceHead: "",
  serviceDescription: "",
  serviceIcon: FALLBACK_ICON,
  serviceColor: FALLBACK_COLOR,
  serviceTechStacks: "",
};

// Resolve a lucide-react icon component from a stored string name, e.g. "Cloud".
// Falls back to Server if the name doesn't exist (typo, old data, etc).
function getIconComponent(name) {
  return LucideIcons[name] || LucideIcons[FALLBACK_ICON];
}

// Turn a hex color into an rgba() string so we can build a soft tinted background
// behind whatever color the admin picked, without needing Tailwind to know about it
// ahead of time (dynamic Tailwind class names don't work at build time).
function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(34, 211, 238, ${alpha})`;
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(c)) return `rgba(34, 211, 238, ${alpha})`;
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function slugify(name) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "service"
  );
}

export default function ServicesPage({ isDarkMode = true }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // serviceID being edited, or null when adding
  const [form, setForm] = useState(emptyServiceForm);

  // ---- Load services from the API on mount ----
  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/services");
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      // Backend returns a 400 with "No Services Found" when the collection is empty —
      // treat that as an empty list rather than a real error.
      if (err.response?.status === 400) {
        setServices([]);
      } else {
        setError("Couldn't load services. Please refresh and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const categories = useMemo(() => {
    const heads = new Set(services.map((s) => s.serviceHead).filter(Boolean));
    return ["All", ...Array.from(heads)];
  }, [services]);

  const stats = useMemo(() => {
    const uniqueCategories = new Set(services.map((s) => s.serviceHead).filter(Boolean));
    const uniqueTechStacks = new Set(services.flatMap((s) => s.serviceTechStacks || []));
    return {
      total: services.length,
      categories: uniqueCategories.size,
      techStacks: uniqueTechStacks.size,
    };
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesCategory = categoryFilter === "All" || s.serviceHead === categoryFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.serviceName?.toLowerCase().includes(q) ||
        s.serviceDescription?.toLowerCase().includes(q) ||
        (s.serviceTechStacks || []).some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [services, categoryFilter, search]);

  // ---- Modal helpers ----
  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyServiceForm);
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingId(service.serviceID);
    setForm({
      serviceName: service.serviceName || "",
      serviceHead: service.serviceHead || "",
      serviceDescription: service.serviceDescription || "",
      serviceIcon: service.serviceIcon || FALLBACK_ICON,
      serviceColor: service.serviceColor || FALLBACK_COLOR,
      serviceTechStacks: (service.serviceTechStacks || []).join(", "),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyServiceForm);
  };

  const handleChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // ---- Save (create or update) ----
  const handleSave = async () => {
    if (!form.serviceName.trim() || !form.serviceDescription.trim()) {
      setError("Service name and description are required.");
      return;
    }

    const payload = {
      serviceName: form.serviceName.trim(),
      serviceHead: form.serviceHead.trim(),
      serviceDescription: form.serviceDescription.trim(),
      serviceIcon: (form.serviceIcon || FALLBACK_ICON).trim(),
      serviceColor: (form.serviceColor || FALLBACK_COLOR).trim(),
      serviceTechStacks: form.serviceTechStacks
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    setIsSaving(true);
    setError(null);
    try {
      if (editingId) {
        const res = await axiosInstance.put(`/services/${editingId}`, payload);
        setServices((prev) =>
          prev.map((s) => (s.serviceID === editingId ? res.data : s))
        );
      } else {
        const serviceID = `${slugify(form.serviceName)}-${Date.now().toString(36)}`;
        const res = await axiosInstance.post("/services", { ...payload, serviceID });
        setServices((prev) => [res.data, ...prev]);
      }
      closeModal();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to save the service. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Delete ----
  const handleDelete = async (serviceID) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    setError(null);
    try {
      await axiosInstance.delete(`/services/${serviceID}`);
      setServices((prev) => prev.filter((s) => s.serviceID !== serviceID));
    } catch (err) {
      setError("Failed to delete the service. Please try again.");
    }
  };

  const PreviewIcon = getIconComponent(form.serviceIcon);

  return (
    <div className="space-y-6">
      {/* Top Heading Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className={`text-xl md:text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Services Management
          </h3>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Configure the service catalogue shown on the public site — name, description, tech stack, icon, and color.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-[#72efdd] hover:bg-[#52e3d0] text-[#0b0f17] px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-[#72efdd]/10 whitespace-nowrap"
        >
          <Plus size={16} strokeWidth={2.5} /> Add Service
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} aria-label="Dismiss error">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Summary Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-[#0f1422] border-[#1e2640]" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Services</span>
            <Layers size={16} className="text-cyan-400" />
          </div>
          <p className={`text-2xl font-bold mt-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.total}</p>
        </div>

        <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-[#0f1422] border-[#1e2640]" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium uppercase tracking-wider">Service Heads</span>
            <Tags size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold mt-2 text-amber-400">{stats.categories}</p>
        </div>

        <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-[#0f1422] border-[#1e2640]" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium uppercase tracking-wider">Tech Stacks in Use</span>
            <Boxes size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold mt-2 text-emerald-400">{stats.techStacks}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto max-w-full ${isDarkMode ? "bg-[#0f1422] border-[#1e2640]" : "bg-white border-gray-200"}`}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? "bg-cyan-500/10 text-cyan-400 font-bold"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search services or tech stacks..."
          className={`w-full sm:w-64 px-3 py-2 rounded-lg border bg-transparent ${isDarkMode ? "border-[#1e2640] text-white placeholder:text-gray-600" : "border-gray-300 text-gray-900 placeholder:text-gray-400"}`}
        />
      </div>

      {/* Table Section */}
      <div className={`rounded-xl border overflow-hidden transition-colors w-full ${isDarkMode ? "bg-[#0f1422] border-[#1e2640]" : "bg-white border-gray-200"}`}>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500 text-sm">
            <Loader2 size={18} className="animate-spin" /> Loading services...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-500 text-sm">
            <Boxes size={24} className="opacity-50" />
            <p>No services found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm border-collapse min-w-[800px]">
              <thead>
                <tr className={`border-b text-[10px] uppercase font-bold tracking-wider text-gray-500 ${isDarkMode ? "bg-[#131a2e] border-[#1e2640]" : "bg-gray-50 border-gray-200"}`}>
                  <th className="px-6 py-3.5">Icon</th>
                  <th className="px-6 py-3.5">Service Name</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Tech Stacks</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-sm ${isDarkMode ? "divide-[#1e2640]/50" : "divide-gray-200"}`}>
                {filteredServices.map((service) => {
                  const Icon = getIconComponent(service.serviceIcon);
                  const color = service.serviceColor || FALLBACK_COLOR;
                  return (
                    <tr key={service.serviceID} className={`transition-colors ${isDarkMode ? "hover:bg-[#141b2d]" : "hover:bg-gray-50"}`}>
                      <td className="px-6 py-4">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg"
                          style={{ backgroundColor: hexToRgba(color, 0.15), color }}
                        >
                          <Icon size={18} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{service.serviceName}</p>
                        <p className="text-[10px] uppercase tracking-wide text-gray-500">{service.serviceHead}</p>
                      </td>
                      <td className="max-w-xs px-6 py-4 text-xs text-gray-400">
                        {service.serviceDescription}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {(service.serviceTechStacks || []).map((tech) => (
                            <span
                              key={tech}
                              className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide border ${
                                isDarkMode ? "bg-[#151c30] border-[#222f54] text-gray-300" : "bg-gray-100 border-gray-200 text-gray-700"
                              }`}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-3 text-gray-400">
                          <button onClick={() => openEditModal(service)} className="hover:text-cyan-400 transition-colors" aria-label="Edit service">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(service.serviceID)} className="hover:text-rose-400 transition-colors" aria-label="Delete service">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        <div className={`p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t ${isDarkMode ? "bg-[#131a2e]/60 border-[#1e2640] text-gray-400" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
          <p>
            Showing <span className={`font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}>{filteredServices.length}</span> of{" "}
            <span className={`font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}>{services.length}</span> services
          </p>
          <div className="flex items-center gap-1.5">
            <button className={`p-1.5 rounded-lg border transition-colors ${isDarkMode ? "border-[#222f54] text-gray-400 hover:text-white hover:bg-[#1a233a]" : "border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
              <ChevronLeft size={14} />
            </button>
            <button className="px-2.5 py-1 rounded-lg font-bold bg-cyan-400 text-[#0b0f17]">1</button>
            <button className={`p-1.5 rounded-lg border transition-colors ${isDarkMode ? "border-[#222f54] text-gray-400 hover:text-white hover:bg-[#1a233a]" : "border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Service Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-xl border p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto ${isDarkMode ? "bg-[#0f1422] border-[#1e2640] text-gray-200" : "bg-white border-gray-200 text-gray-800"}`}>
            <h4 className="text-lg font-bold">{editingId ? "Edit Service" : "Add Service"}</h4>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-400 font-medium">Service Name</label>
                <input
                  type="text"
                  value={form.serviceName}
                  onChange={handleChange("serviceName")}
                  className={`w-full p-2.5 rounded-lg border bg-transparent focus:ring-0 ${isDarkMode ? "border-[#1e2640] text-white" : "border-gray-300 text-gray-900"}`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-400 font-medium">Service Head</label>
                <input
                  type="text"
                  value={form.serviceHead}
                  onChange={handleChange("serviceHead")}
                  placeholder="e.g. Backend / Core"
                  className={`w-full p-2.5 rounded-lg border bg-transparent focus:ring-0 ${isDarkMode ? "border-[#1e2640] text-white" : "border-gray-300 text-gray-900"}`}
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-gray-400 font-medium">Description</label>
                <textarea
                  value={form.serviceDescription}
                  onChange={handleChange("serviceDescription")}
                  rows={3}
                  className={`w-full p-2.5 rounded-lg border bg-transparent focus:ring-0 ${isDarkMode ? "border-[#1e2640] text-white" : "border-gray-300 text-gray-900"}`}
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-gray-400 font-medium">Tech Stacks (comma separated)</label>
                <input
                  type="text"
                  value={form.serviceTechStacks}
                  onChange={handleChange("serviceTechStacks")}
                  placeholder="GraphQL, Redis, OAuth2"
                  className={`w-full p-2.5 rounded-lg border bg-transparent focus:ring-0 ${isDarkMode ? "border-[#1e2640] text-white" : "border-gray-300 text-gray-900"}`}
                />
              </div>

              {/* Icon picker: free-text lucide icon name + suggestions + live preview */}
              <div className="space-y-1">
                <label className="text-gray-400 font-medium">Icon (lucide-react name)</label>
                <input
                  list="icon-suggestions"
                  type="text"
                  value={form.serviceIcon}
                  onChange={handleChange("serviceIcon")}
                  placeholder="e.g. Cloud"
                  className={`w-full p-2.5 rounded-lg border bg-transparent focus:ring-0 ${isDarkMode ? "border-[#1e2640] text-white" : "border-gray-300 text-gray-900"}`}
                />
                <datalist id="icon-suggestions">
                  {ICON_SUGGESTIONS.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                <p className="text-[10px] text-gray-500">
                  Any exact <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" className="underline">lucide.dev/icons</a> name works, e.g. "Server", "Cloud".
                </p>
              </div>

              {/* Color picker */}
              <div className="space-y-1">
                <label className="text-gray-400 font-medium">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(form.serviceColor) ? form.serviceColor : FALLBACK_COLOR}
                    onChange={handleChange("serviceColor")}
                    className="h-9 w-10 rounded border border-[#1e2640] bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.serviceColor}
                    onChange={handleChange("serviceColor")}
                    placeholder="#22d3ee"
                    className={`flex-1 p-2.5 rounded-lg border bg-transparent focus:ring-0 ${isDarkMode ? "border-[#1e2640] text-white" : "border-gray-300 text-gray-900"}`}
                  />
                </div>
              </div>

              {/* Live preview of icon + color combo */}
              <div className="col-span-2 flex items-center gap-3 rounded-lg border border-dashed border-[#1e2640] p-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: hexToRgba(form.serviceColor, 0.15), color: form.serviceColor || FALLBACK_COLOR }}
                >
                  <PreviewIcon size={20} />
                </div>
                <span className="text-[11px] text-gray-500">Preview — how this will appear on the site</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={closeModal}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg border border-gray-700 text-xs font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 text-[#0b0f17] text-xs font-bold hover:bg-cyan-300 disabled:opacity-50"
              >
                {isSaving && <Loader2 size={14} className="animate-spin" />}
                {editingId ? "Save Changes" : "Add Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}