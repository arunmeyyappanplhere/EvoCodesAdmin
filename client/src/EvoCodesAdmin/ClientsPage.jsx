import React, { useMemo, useState } from "react";
import {
  Plus,
  SlidersHorizontal,
  Download,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Minus,
} from "lucide-react";
import Sidebar from "../EvoCodesAdmin/Sidebar";
import { TopBar, PageHeading } from "../EvoCodesAdmin/PageHeader";
import Modal, { Field, inputClass, selectClass } from "../EvoCodesAdmin/Modal";

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

export default function ClientsPage() {
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
    setClients((prev) =>
      prev.map((c) =>
        c.id === editingId
          ? { ...c, ...form, activeProjects: Number(form.activeProjects) || 0 }
          : c,
      ),
    );
    closeModal();
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar active="clients" />

      <main className="flex-1">
        <TopBar />
        <PageHeading
          breadcrumb={["Admin", "Client Directory"]}
          title="Client Directory"
          subtitle="Manage corporate relationships and active infrastructure projects."
          action={
            <button className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400">
              <Plus size={16} strokeWidth={2.5} />
              Add Client
            </button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 px-8 pt-6">
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
        <div className="mx-8 mt-6 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <div className="flex items-center gap-1">
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
            <span className="ml-2 text-sm text-slate-500">Industry: All</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800">
              <SlidersHorizontal size={14} />
              Advanced Filters
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800">
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mx-8 my-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
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
                        <p className="text-xs text-slate-500">
                          {client.domain}
                        </p>
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
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[client.status]}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3 text-slate-400">
                      <button
                        className="hover:text-cyan-400"
                        aria-label="View client"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openEditModal(client)}
                        className="hover:text-cyan-400"
                        aria-label="Edit client"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="hover:text-rose-400"
                        aria-label="Delete client"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-slate-800 px-6 py-3.5">
            <p className="text-sm text-slate-500">
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
                    "h-7 w-7 rounded-md text-sm font-medium",
                    p === 1
                      ? "bg-cyan-500 text-slate-950"
                      : "text-slate-400 hover:bg-slate-800",
                  ].join(" ")}
                >
                  {p}
                </button>
              ))}
              <span className="px-1 text-slate-600">…</span>
              <button className="h-7 w-7 rounded-md text-sm font-medium text-slate-400 hover:bg-slate-800">
                31
              </button>
              <button className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Edit Client"
        subtitle={form.company}
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
