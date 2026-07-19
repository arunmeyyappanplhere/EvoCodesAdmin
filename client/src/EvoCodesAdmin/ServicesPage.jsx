import React, { useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Server,
  BarChart3,
  ShieldCheck,
  Cloud,
  ArrowUpRight,
} from "lucide-react";
import Sidebar from "../EvoCodesAdmin/Sidebar";
import { TopBar, PageHeading } from "../EvoCodesAdmin/PageHeader";
import Modal, { Field, inputClass, selectClass } from "../EvoCodesAdmin/Modal";

const FILTERS = ["All Services", "Active", "Maintenance", "Legacy"];

const SERVICES = [
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

const SUMMARY_CARDS = [
  {
    label: "Revenue Impact",
    value: "+14.2%",
    icon: TrendingUp,
    tone: "text-emerald-400",
    note: "Services adoption increasing across Cloud and API verticals.",
  },
  {
    label: "Active Assets",
    value: "18",
    unit: "Deployed",
    icon: Server,
    tone: "text-cyan-400",
    note: "6 new services currently in the staging/review pipeline.",
  },
  {
    label: "System Health",
    value: "99.9%",
    unit: "Optimum",
    icon: ShieldCheck,
    tone: "text-emerald-400",
    note: "Global edge network functioning within nominal latency bounds.",
  },
];

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

export default function ServicesPage() {
  const [services, setServices] = useState(SERVICES);
  const [filter, setFilter] = useState("All Services");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyServiceForm);

  const filteredServices = useMemo(() => {
    if (filter === "All Services") return services;
    return services.filter((s) => s.status === filter);
  }, [filter, services]);

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
    closeModal();
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar active="services" />

      <main className="flex-1">
        <TopBar />
        <PageHeading
          breadcrumb={["Admin", "Services"]}
          title="Services Management"
          subtitle="Configure and deploy technical service packages for Evo Codes clients. Monitor status, pricing tiers, and key feature deliverables."
          action={
            <button className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400">
              <Plus size={16} strokeWidth={2.5} />
              Add Service
            </button>
          }
        />

        {/* Filters */}
        <div className="mx-8 mt-6 flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={[
                  "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
                  filter === f
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-slate-400 hover:text-slate-200",
                ].join(" ")}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">Sort by: Newest</span>
            <span className="text-sm text-slate-500">
              Showing 1-{filteredServices.length} of 24 services
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="mx-8 my-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3.5 font-medium">Icon</th>
                <th className="px-6 py-3.5 font-medium">Service Name</th>
                <th className="px-6 py-3.5 font-medium">Description</th>
                <th className="px-6 py-3.5 font-medium">Features</th>
                <th className="px-6 py-3.5 font-medium">Pricing</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
                <th className="px-6 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredServices.map((service) => {
                const Icon = service.icon;
                return (
                  <tr key={service.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${service.iconBg}`}
                      >
                        <Icon size={18} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-100">{service.name}</p>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {service.category}
                      </p>
                    </td>
                    <td className="max-w-xs px-6 py-4 text-slate-400">
                      {service.description}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {service.features.map((feat) => (
                          <span
                            key={feat}
                            className="rounded-md bg-slate-800 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-300"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-cyan-400">{service.price}</p>
                      <p className="text-xs text-slate-500">{service.priceNote}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[service.status]}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {service.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        <button
                          onClick={() => openEditModal(service)}
                          className="hover:text-cyan-400"
                          aria-label="Edit service"
                        >
                          <Pencil size={16} />
                        </button>
                        <button className="hover:text-rose-400" aria-label="Delete service">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-slate-800 px-6 py-3.5">
            <div className="flex items-center gap-1">
              <button className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800">
                <ChevronLeft size={16} />
              </button>
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  className={[
                    "h-7 w-7 rounded-md text-sm font-medium",
                    p === 1
                      ? "bg-cyan-500 text-slate-950"
                      : "text-slate-400 hover:bg-slate-800",
                  ].join(" ")}
                >
                  {p}
                </button>
              ))}
              <button className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800">
                <ChevronRight size={16} />
              </button>
            </div>
            <p className="text-sm text-slate-500">
              Jump to page <span className="font-medium text-slate-300">1</span>
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mx-8 mb-8 grid grid-cols-3 gap-4">
          {SUMMARY_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    {card.label}
                  </p>
                  <Icon size={16} className={card.tone} />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className={`text-2xl font-bold ${card.tone}`}>{card.value}</p>
                  {card.unit && (
                    <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                      {card.label === "Revenue Impact" && (
                        <ArrowUpRight size={12} className={card.tone} />
                      )}
                      {card.unit}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{card.note}</p>
              </div>
            );
          })}
        </div>
      </main>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Edit Service"
        subtitle={form.name}
        footer={
          <>
            <button
              onClick={closeModal}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Save Changes
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Service Name">
            <input
              type="text"
              value={form.name}
              onChange={handleChange("name")}
              className={inputClass}
            />
          </Field>
          <Field label="Category">
            <input
              type="text"
              value={form.category}
              onChange={handleChange("category")}
              placeholder="e.g. Backend / Core"
              className={inputClass}
            />
          </Field>
          <div className="col-span-2">
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={handleChange("description")}
                rows={3}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Features (comma separated)">
              <input
                type="text"
                value={form.features}
                onChange={handleChange("features")}
                placeholder="GraphQL, Redis, OAuth2"
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Price">
            <input
              type="text"
              value={form.price}
              onChange={handleChange("price")}
              placeholder="$4,500"
              className={inputClass}
            />
          </Field>
          <Field label="Price Note">
            <input
              type="text"
              value={form.priceNote}
              onChange={handleChange("priceNote")}
              placeholder="Starting from"
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