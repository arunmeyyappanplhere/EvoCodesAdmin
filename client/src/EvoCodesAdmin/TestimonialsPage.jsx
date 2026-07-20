import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Star,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MessageSquareQuote,
  ThumbsUp,
  Clock,
} from "lucide-react";
import Modal, { Field, inputClass, selectClass } from "./Modal";

const STATUS_OPTIONS = ["Published", "Pending Review", "Archived"];
const STATUS_STYLES = {
  Published: "bg-emerald-500/10 text-emerald-400",
  "Pending Review": "bg-amber-500/10 text-amber-400",
  Archived: "bg-slate-500/10 text-slate-400",
};
const FILTERS = ["All", ...STATUS_OPTIONS];

const TESTIMONIALS = [
  {
    id: 1,
    client: "Sarah Jenkins",
    company: "NexGen Systems",
    initials: "SJ",
    color: "bg-cyan-500/20 text-cyan-300",
    project: "Cloud Migration Platform",
    rating: 5,
    review:
      "Evo Codes rebuilt our infrastructure pipeline from the ground up. Deployment times dropped from hours to minutes, and their team was responsive at every stage.",
    date: "Jul 02, 2026",
    status: "Published",
  },
  {
    id: 2,
    client: "Marcus Zhao",
    company: "Vertex Finance",
    initials: "MZ",
    color: "bg-violet-500/20 text-violet-300",
    project: "Fraud Detection API",
    rating: 4,
    review:
      "Solid engineering and clear communication throughout. A couple of milestones slipped, but the end result exceeded what we scoped for.",
    date: "Jun 18, 2026",
    status: "Published",
  },
  {
    id: 3,
    client: "Dr. Elena Kostic",
    company: "VitalStream",
    initials: "EK",
    color: "bg-emerald-500/20 text-emerald-300",
    project: "Patient Data Dashboard",
    rating: 5,
    review:
      "The team understood the compliance requirements immediately and built a dashboard our clinicians actually enjoy using. Excellent handoff docs too.",
    date: "Jun 05, 2026",
    status: "Pending Review",
  },
  {
    id: 4,
    client: "David Miller",
    company: "Quantum Logistics",
    initials: "DM",
    color: "bg-amber-500/20 text-amber-300",
    project: "Fleet Tracking System",
    rating: 3,
    review:
      "Good technical work overall. Onboarding took longer than expected and we had to chase status updates a few times mid-project.",
    date: "May 21, 2026",
    status: "Archived",
  },
];

const SUMMARY_CARDS = (testimonials) => {
  const total = testimonials.length;
  const avgRating = total
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / total).toFixed(1)
    : "0.0";
  const published = testimonials.filter((t) => t.status === "Published").length;
  const pending = testimonials.filter((t) => t.status === "Pending Review").length;

  return [
    {
      label: "Total Testimonials",
      value: String(total),
      icon: MessageSquareQuote,
      tone: "text-cyan-400",
    },
    {
      label: "Average Rating",
      value: `${avgRating} / 5`,
      icon: Star,
      tone: "text-amber-400",
    },
    {
      label: "Published",
      value: String(published),
      icon: ThumbsUp,
      tone: "text-emerald-400",
    },
    {
      label: "Pending Review",
      value: String(pending),
      icon: Clock,
      tone: "text-amber-400",
    },
  ];
};

const emptyForm = {
  client: "",
  company: "",
  project: "",
  rating: 5,
  review: "",
  date: "",
  status: STATUS_OPTIONS[0],
};

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          className={n <= value ? "fill-amber-400 text-amber-400" : "text-slate-700"}
        />
      ))}
    </div>
  );
}

export default function TestimonialsPage({ isDarkMode }) {
  const [testimonials, setTestimonials] = useState(TESTIMONIALS);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    let rows = testimonials;
    if (filter !== "All") rows = rows.filter((t) => t.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (t) =>
          t.client.toLowerCase().includes(q) ||
          t.company.toLowerCase().includes(q) ||
          t.project.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [testimonials, filter, query]);

  const openEditModal = (item) => {
    setEditingId(item.id);
    setForm({
      client: item.client,
      company: item.company,
      project: item.project,
      rating: item.rating,
      review: item.review,
      date: item.date,
      status: item.status,
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = () => {
    setTestimonials((prev) =>
      prev.map((t) =>
        t.id === editingId
          ? {
              ...t,
              ...form,
              rating: Number(form.rating),
              initials: form.client
                .split(" ")
                .map((n) => n[0])
                .filter(Boolean)
                .slice(0, 2)
                .join("")
                .toUpperCase(),
            }
          : t
      )
    );
    closeEditModal();
  };

  const confirmDelete = () => {
    setTestimonials((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const cards = SUMMARY_CARDS(testimonials);

  return (
    <div className="p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end justify-between">
        <div>
          <h3 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Client Testimonials
          </h3>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Review, edit, and moderate client feedback on delivered projects.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-cyan-400">
          <Plus size={16} strokeWidth={2.5} />
          Add Testimonial
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {card.label}
                </p>
                <Icon size={15} className={card.tone} />
              </div>
              <p className={`mt-2 text-2xl font-bold ${card.tone}`}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                filter === f
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-slate-400 hover:text-slate-200",
              ].join(" ")}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search client, company, or project..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800/60 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-6 py-3.5 font-medium">Client</th>
              <th className="px-6 py-3.5 font-medium">Project</th>
              <th className="px-6 py-3.5 font-medium">Rating</th>
              <th className="px-6 py-3.5 font-medium">Review</th>
              <th className="px-6 py-3.5 font-medium">Date</th>
              <th className="px-6 py-3.5 font-medium">Status</th>
              <th className="px-6 py-3.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${item.color}`}
                    >
                      {item.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100">{item.client}</p>
                      <p className="text-xs text-slate-500">{item.company}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-300">{item.project}</td>
                <td className="px-6 py-4">
                  <StarRating value={item.rating} />
                </td>
                <td className="max-w-xs px-6 py-4">
                  <p className="line-clamp-2 text-slate-400">{item.review}</p>
                </td>
                <td className="px-6 py-4 text-slate-400">{item.date}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[item.status]}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3 text-slate-400">
                    <button
                      onClick={() => openEditModal(item)}
                      className="hover:text-cyan-400"
                      aria-label="Edit testimonial"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="hover:text-rose-400"
                      aria-label="Delete testimonial"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                  No testimonials match your search or filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-3.5">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-300">{filtered.length}</span> of{" "}
            <span className="font-medium text-slate-300">{testimonials.length}</span>{" "}
            testimonials
          </p>
          <div className="flex items-center gap-1">
            <button className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800">
              <ChevronLeft size={16} />
            </button>
            <button className="h-7 w-7 rounded-md bg-cyan-500 text-sm font-medium text-slate-950">
              1
            </button>
            <button className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <Modal
        open={editModalOpen}
        onClose={closeEditModal}
        title="Edit Testimonial"
        subtitle={`${form.client}${form.company ? " · " + form.company : ""}`}
        footer={
          <>
            <button
              onClick={closeEditModal}
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
          <Field label="Client Name">
            <input
              type="text"
              value={form.client}
              onChange={handleChange("client")}
              className={inputClass}
            />
          </Field>
          <Field label="Company">
            <input
              type="text"
              value={form.company}
              onChange={handleChange("company")}
              className={inputClass}
            />
          </Field>
          <div className="col-span-2">
            <Field label="Project">
              <input
                type="text"
                value={form.project}
                onChange={handleChange("project")}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Rating">
            <select
              value={form.rating}
              onChange={handleChange("rating")}
              className={selectClass}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <input
              type="text"
              value={form.date}
              onChange={handleChange("date")}
              placeholder="Jul 02, 2026"
              className={inputClass}
            />
          </Field>
          <div className="col-span-2">
            <Field label="Review">
              <textarea
                value={form.review}
                onChange={handleChange("review")}
                rows={4}
                className={inputClass}
              />
            </Field>
          </div>
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

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Testimonial"
        subtitle="This action cannot be undone."
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400"
            >
              Delete
            </button>
          </>
        }
      >
        {deleteTarget && (
          <p className="text-sm text-slate-300">
            Are you sure you want to delete the testimonial from{" "}
            <span className="font-semibold text-slate-100">{deleteTarget.client}</span>{" "}
            ({deleteTarget.company}) about{" "}
            <span className="font-semibold text-slate-100">{deleteTarget.project}</span>?
          </p>
        )}
      </Modal>
    </div>
  );
}