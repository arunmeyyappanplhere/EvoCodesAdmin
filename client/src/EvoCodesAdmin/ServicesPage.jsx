import React, { useMemo, useState } from "react";
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

const FILTERS = ["All Services", "Active", "Maintenance", "Disabled", "Legacy"];

const INITIAL_SERVICES = [
  {
    id: 1,
    name: "API Architecture",
    category: "Backend / Core",
    description: "High-concurrency GraphQL & REST gateway design.",
    icon: Server,
    iconBg: "bg-cyan-500/15 text-cyan-300",
    features: ["GraphQL", "Redis", "OAuth2"],
    price: "$4,500",
    priceNote: "Starting from",
    status: "Active",
  },
  {
    id: 2,
    name: "Data Visualization",
    category: "Frontend / UX",
    description: "Real-time d3.js powered dashboards and reporting.",
    icon: BarChart3,
    iconBg: "bg-amber-500/15 text-amber-300",
    features: ["WebGL", "Canvas"],
    price: "$3,200",
    priceNote: "Flat fee",
    status: "Maintenance",
  },
  {
    id: 3,
    name: "Identity Management",
    category: "Security",
    description: "Enterprise-grade auth, SSO, and access control.",
    icon: ShieldCheck,
    iconBg: "bg-rose-500/15 text-rose-300",
    features: ["SAML", "Biometric"],
    price: "$8,900",
    priceNote: "Yearly license",
    status: "Disabled",
  },
  {
    id: 4,
    name: "Hybrid Cloud CI/CD",
    category: "Infrastructure",
    description: "Automated multi-cloud deployment pipelines.",
    icon: Cloud,
    iconBg: "bg-sky-500/15 text-sky-300",
    features: ["Docker", "K8S", "Terraform"],
    price: "$12,000",
    priceNote: "Enterprise",
    status: "Active",
  },
];

const STATUS_STYLES = {
  Active: "bg-emerald-500/10 text-emerald-400",
  Staging: "bg-amber-500/10 text-amber-400",
  Maintenance: "bg-amber-500/10 text-amber-400",
  Disabled: "bg-rose-500/10 text-rose-400",
  Legacy: "bg-slate-500/10 text-slate-400",
};

const STATUS_OPTIONS = ["Active", "Maintenance", "Disabled", "Legacy"];

const emptyServiceForm = {
  name: "",
  category: "",
  description: "",
  features: "",
  price: "",
  priceNote: "",
  status: STATUS_OPTIONS[0],
};

export default function ServicesPage({ isDarkMode = true }) {
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [filter, setFilter] = useState("All Services");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyServiceForm);

  const serviceCounts = useMemo(() => {
    return services.reduce(
      (acc, service) => {
        acc.total += 1;
        acc[service.status] = (acc[service.status] || 0) + 1;
        return acc;
      },
      { total: 0, Active: 0, Maintenance: 0, Disabled: 0, Legacy: 0 }
    );
  }, [services]);

  const filteredServices = useMemo(() => {
    if (filter === "All Services") return services;
    return services.filter((s) => s.status === filter);
  }, [filter, services]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyServiceForm);
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      category: service.category,
      description: service.description,
      features: service.features.join(", "),
      price: service.price,
      priceNote: service.priceNote,
      status: service.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyServiceForm);
  };

  const handleChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = () => {
    if (editingId) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                ...s,
                ...form,
                features: form.features
                  .split(",")
                  .map((f) => f.trim())
                  .filter(Boolean),
              }
            : s
        )
      );
    } else {
      const newService = {
        ...form,
        id: Date.now(),
        icon: Server,
        iconBg: "bg-cyan-500/15 text-cyan-300",
        features: form.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
      };
      setServices((prev) => [newService, ...prev]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this service?")) {
      setServices((prev) => prev.filter((s) => s.id !== id));
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
          <span>Sort by: Newest</span>
          <span>Showing 1-{filteredServices.length} of {services.length} services</span>
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
                <th className="px-6 py-3.5">Features</th>
                <th className="px-6 py-3.5">Pricing</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-sm ${isDarkMode ? "divide-[#1e2640]/50" : "divide-gray-200"}`}>
              {filteredServices.map((service) => {
                const Icon = service.icon || Server;
                return (
                  <tr key={service.id} className={`transition-colors ${isDarkMode ? "hover:bg-[#141b2d]" : "hover:bg-gray-50"}`}>
                    <td className="px-6 py-4">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${service.iconBg || "bg-cyan-500/15 text-cyan-300"}`}>
                        <Icon size={18} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{service.name}</p>
                      <p className="text-[10px] uppercase tracking-wide text-gray-500">{service.category}</p>
                    </td>
                    <td className="max-w-xs px-6 py-4 text-xs text-gray-400">
                      {service.description}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {service.features.map((feat) => (
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
                      <p className="font-semibold text-cyan-400 text-xs">{service.price}</p>
                      <p className="text-[10px] text-gray-500">{service.priceNote}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${STATUS_STYLES[service.status]}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {service.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3 text-gray-400">
                        <button onClick={() => openEditModal(service)} className="hover:text-cyan-400 transition-colors" aria-label="Edit service">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(service.id)} className="hover:text-rose-400 transition-colors" aria-label="Delete service">
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

        {/* Table Footer - Standardized Layout (Left: Info, Right: Controls) */}
        <div className={`p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t ${isDarkMode ? "bg-[#131a2e]/60 border-[#1e2640] text-gray-400" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
          <p>
            Showing <span className={`font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}>1–{filteredServices.length}</span> of{" "}
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
          <div className={`w-full max-w-lg rounded-xl border p-6 space-y-4 shadow-2xl ${isDarkMode ? "bg-[#0f1422] border-[#1e2640] text-gray-200" : "bg-white border-gray-200 text-gray-800"}`}>
            <h4 className="text-lg font-bold">{editingId ? "Edit Service" : "Add Service"}</h4>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-400 font-medium">Service Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={handleChange("name")}
                  className={`w-full p-2.5 rounded-lg border bg-transparent focus:ring-0 ${isDarkMode ? "border-[#1e2640] text-white" : "border-gray-300 text-gray-900"}`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-400 font-medium">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={handleChange("category")}
                  placeholder="e.g. Backend / Core"
                  className={`w-full p-2.5 rounded-lg border bg-transparent focus:ring-0 ${isDarkMode ? "border-[#1e2640] text-white" : "border-gray-300 text-gray-900"}`}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-gray-400 font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={handleChange("description")}
                  rows={3}
                  className={`w-full p-2.5 rounded-lg border bg-transparent focus:ring-0 ${isDarkMode ? "border-[#1e2640] text-white" : "border-gray-300 text-gray-900"}`}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-gray-400 font-medium">Features (comma separated)</label>
                <input
                  type="text"
                  value={form.features}
                  onChange={handleChange("features")}
                  placeholder="GraphQL, Redis, OAuth2"
                  className={`w-full p-2.5 rounded-lg border bg-transparent focus:ring-0 ${isDarkMode ? "border-[#1e2640] text-white" : "border-gray-300 text-gray-900"}`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-400 font-medium">Price</label>
                <input
                  type="text"
                  value={form.price}
                  onChange={handleChange("price")}
                  placeholder="$4,500"
                  className={`w-full p-2.5 rounded-lg border bg-transparent focus:ring-0 ${isDarkMode ? "border-[#1e2640] text-white" : "border-gray-300 text-gray-900"}`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-400 font-medium">Price Note</label>
                <input
                  type="text"
                  value={form.priceNote}
                  onChange={handleChange("priceNote")}
                  placeholder="Starting from"
                  className={`w-full p-2.5 rounded-lg border bg-transparent focus:ring-0 ${isDarkMode ? "border-[#1e2640] text-white" : "border-gray-300 text-gray-900"}`}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-gray-400 font-medium">Status</label>
                <select
                  value={form.status}
                  onChange={handleChange("status")}
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
                className="px-4 py-2 rounded-lg bg-cyan-400 text-[#0b0f17] text-xs font-bold hover:bg-cyan-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}