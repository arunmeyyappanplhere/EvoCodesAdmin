import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Server,
  BarChart3,
  ShieldCheck,
  Cloud,
  Layers,
} from "lucide-react";
import axiosInstance from "./api/axiosInstance";

const FILTERS = ["All Services", "Active", "Maintenance", "Disabled", "Legacy"];

const STATUS_STYLES = {
  Active: "bg-emerald-500/10 text-emerald-400",
  Staging: "bg-amber-500/10 text-amber-400",
  Maintenance: "bg-amber-500/10 text-amber-400",
  Disabled: "bg-rose-500/10 text-rose-400",
  Legacy: "bg-slate-500/10 text-slate-400",
};

const STATUS_OPTIONS = ["Active", "Maintenance", "Disabled", "Legacy"];

// Map a lucide icon name string to the actual component
const ICON_MAP = {
  Server,
  BarChart3,
  ShieldCheck,
  Cloud,
  Layers,
};

const resolveIcon = (iconName) => {
  if (!iconName || typeof iconName !== "string") return Server;
  return ICON_MAP[iconName] || Server;
};

const emptyServiceForm = {
  serviceName: "",
  serviceHead: "",
  serviceDescription: "",
  serviceTechStacks: "",
  serviceIcon: "Server",
  serviceColor: "bg-cyan-500/15 text-cyan-300",
  serviceStatus: STATUS_OPTIONS[0],
};

export default function ServicesPage({ isDarkMode = true }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All Services");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingServiceID, setEditingServiceID] = useState(null);
  const [form, setForm] = useState(emptyServiceForm);
  const [saving, setSaving] = useState(false);

  // Fetch services from backend on mount
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/services");
      setServices(res.data ?? []);
    } catch (err) {
      console.error("Failed to load services:", err);
    } finally {
      setLoading(false);
    }
  };

  const serviceCounts = useMemo(() => {
    return services.reduce(
      (acc, service) => {
        acc.total += 1;
        const status = service.serviceStatus || "Active";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { total: 0, Active: 0, Maintenance: 0, Disabled: 0, Legacy: 0 }
    );
  }, [services]);

  const filteredServices = useMemo(() => {
    if (filter === "All Services") return services;
    return services.filter((s) => (s.serviceStatus || "Active") === filter);
  }, [filter, services]);

  const openCreateModal = () => {
    setEditingServiceID(null);
    setForm(emptyServiceForm);
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingServiceID(service.serviceID);
    setForm({
      serviceName: service.serviceName || "",
      serviceHead: service.serviceHead || "",
      serviceDescription: service.serviceDescription || "",
      serviceTechStacks: (service.serviceTechStacks ?? []).join(", "),
      serviceIcon: service.serviceIcon || "Server",
      serviceColor: service.serviceColor || "bg-cyan-500/15 text-cyan-300",
      serviceStatus: service.serviceStatus || "Active",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingServiceID(null);
    setForm(emptyServiceForm);
  };

  const handleChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.serviceName.trim()) return;
    setSaving(true);

    try {
      const payload = {
        serviceName: form.serviceName.trim(),
        serviceHead: form.serviceHead.trim(),
        serviceDescription: form.serviceDescription.trim(),
        serviceTechStacks: form.serviceTechStacks
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        serviceIcon: form.serviceIcon,
        serviceColor: form.serviceColor,
        serviceStatus: form.serviceStatus,
      };

      if (editingServiceID) {
        // UPDATE existing service
        await axiosInstance.put(`/services/${editingServiceID}`, payload);
      } else {
        // CREATE new service
        await axiosInstance.post("/services", payload);
      }

      closeModal();
      loadServices(); // refresh the list
    } catch (err) {
      console.error("Failed to save service:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to save service. Please try again.";
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceID) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await axiosInstance.delete(`/services/${serviceID}`);
      loadServices(); // refresh the list
    } catch (err) {
      console.error("Failed to delete service:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete service. Please try again.";
      alert(message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Heading Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className={`text-xl md:text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Services Management
          </h3>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Configure and deploy technical service packages for Evo Codes clients. Monitor status, pricing tiers, and key feature deliverables.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-[#72efdd] hover:bg-[#52e3d0] text-[#0b0f17] px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-[#72efdd]/10 whitespace-nowrap"
        >
          <Plus size={16} strokeWidth={2.5} /> Add Service
        </button>
      </div>

      {/* Dynamic Summary Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-[#0f1422] border-[#1e2640]" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Services</span>
            <Layers size={16} className="text-cyan-400" />
          </div>
          <p className={`text-2xl font-bold mt-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{serviceCounts.total}</p>
        </div>

        <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-[#0f1422] border-[#1e2640]" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium uppercase tracking-wider">Active</span>
            <Server size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold mt-2 text-emerald-400">{serviceCounts.Active}</p>
        </div>

        <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-[#0f1422] border-[#1e2640]" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium uppercase tracking-wider">Maintenance</span>
            <BarChart3 size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold mt-2 text-amber-400">{serviceCounts.Maintenance}</p>
        </div>

        <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-[#0f1422] border-[#1e2640]" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium uppercase tracking-wider">Disabled</span>
            <ShieldCheck size={16} className="text-rose-400" />
          </div>
          <p className="text-2xl font-bold mt-2 text-rose-400">{serviceCounts.Disabled}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className={`flex items-center gap-1 p-1 rounded-xl border ${isDarkMode ? "bg-[#0f1422] border-[#1e2640]" : "bg-white border-gray-200"}`}>
          {FILTERS.map((f) => {
            const count = f === "All Services" ? serviceCounts.total : serviceCounts[f] || 0;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                  filter === f
                    ? "bg-cyan-500/10 text-cyan-400 font-bold"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <span>{f}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/10">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          <span>Showing {filteredServices.length} of {services.length} services</span>
        </div>
      </div>

      {/* Table Section */}
      <div className={`rounded-xl border overflow-hidden transition-colors w-full ${isDarkMode ? "bg-[#0f1422] border-[#1e2640]" : "bg-white border-gray-200"}`}>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse min-w-[800px]">
            <thead>
              <tr className={`border-b text-[10px] uppercase font-bold tracking-wider text-gray-500 ${isDarkMode ? "bg-[#131a2e] border-[#1e2640]" : "bg-gray-50 border-gray-200"}`}>
                <th className="px-6 py-3.5">Icon</th>
                <th className="px-6 py-3.5">Service Name</th>
                <th className="px-6 py-3.5">Description</th>
                <th className="px-6 py-3.5">Tech Stacks</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-sm ${isDarkMode ? "divide-[#1e2640]/50" : "divide-gray-200"}`}>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500 text-xs">Loading services...</td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500 text-xs">No services found.</td>
                </tr>
              ) : (
                filteredServices.map((service) => {
                  const Icon = resolveIcon(service.serviceIcon);
                  const iconBg = service.serviceColor || "bg-cyan-500/15 text-cyan-300";
                  const status = service.serviceStatus || "Active";
                  return (
                    <tr key={service.serviceID || service._id} className={`transition-colors ${isDarkMode ? "hover:bg-[#141b2d]" : "hover:bg-gray-50"}`}>
                      <td className="px-6 py-4">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
                          <Icon size={18} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{service.serviceName}</p>
                        <p className="text-[10px] uppercase tracking-wide text-gray-500">{service.serviceHead || "—"}</p>
                      </td>
                      <td className="max-w-xs px-6 py-4 text-xs text-gray-400">
                        {service.serviceDescription || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {(service.serviceTechStacks ?? []).map((feat) => (
                            <span
                              key={feat}
                              className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide border ${
                                isDarkMode ? "bg-[#151c30] border-[#222f54] text-gray-300" : "bg-gray-100 border-gray-200 text-gray-700"
                              }`}
                            >
                              {feat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${STATUS_STYLES[status]}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {status}
                        </span>
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
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className={`p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t ${isDarkMode ? "bg-[#131a2e]/60 border-[#1e2640] text-gray-400" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
          <p>
            Showing <span className={`font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}>1–{filteredServices.length}</span> of{" "}
            <span className={`font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}>{services.length}</span> services
          </p>
        </div>
      </div>

      {/* Service Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-xl border p-6 space-y-4 shadow-2xl ${isDarkMode ? "bg-[#0f1422] border-[#1e2640] text-gray-200" : "bg-white border-gray-200 text-gray-800"}`}>
            <h4 className="text-lg font-bold">{editingServiceID ? "Edit Service" : "Add Service"}</h4>
            
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
                <label className="text-gray-400 font-medium">Category / Head</label>
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
              <div className="space-y-1">
                <label className="text-gray-400 font-medium">Icon</label>
                <input
                  type="text"
                  value={form.serviceIcon}
                  onChange={handleChange("serviceIcon")}
                  placeholder="Server, Cloud, ShieldCheck..."
                  className={`w-full p-2.5 rounded-lg border bg-transparent focus:ring-0 ${isDarkMode ? "border-[#1e2640] text-white" : "border-gray-300 text-gray-900"}`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-400 font-medium">Color Class</label>
                <input
                  type="text"
                  value={form.serviceColor}
                  onChange={handleChange("serviceColor")}
                  placeholder="bg-cyan-500/15 text-cyan-300"
                  className={`w-full p-2.5 rounded-lg border bg-transparent focus:ring-0 ${isDarkMode ? "border-[#1e2640] text-white" : "border-gray-300 text-gray-900"}`}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-gray-400 font-medium">Status</label>
                <select
                  value={form.serviceStatus}
                  onChange={handleChange("serviceStatus")}
                  className={`w-full p-2.5 rounded-lg border focus:ring-0 ${isDarkMode ? "bg-[#0f1422] border-[#1e2640] text-white" : "bg-white border-gray-300 text-gray-900"}`}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border border-gray-700 text-xs font-medium hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-cyan-400 text-[#0b0f17] text-xs font-bold hover:bg-cyan-300 disabled:opacity-50"
              >
                {saving ? "Saving..." : editingServiceID ? "Save Changes" : "Create Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}