import React, { useEffect, useMemo, useState } from "react";
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
import axiosInstance from "./api/axiosInstance";
import Modal, { Field, inputClass, selectClass } from "./Modal";

const STATUS_OPTIONS = ["Published", "Pending Review", "Archived"];
const STATUS_STYLES = {
  Published: "bg-emerald-500/10 text-emerald-400",
  "Pending Review": "bg-amber-500/10 text-amber-400",
  Archived: "bg-slate-500/10 text-slate-400",
};
const FILTERS = ["All", ...STATUS_OPTIONS];

const COLOR_PALETTES = [
  "bg-cyan-500/20 text-cyan-300",
  "bg-violet-500/20 text-violet-300",
  "bg-emerald-500/20 text-emerald-300",
  "bg-amber-500/20 text-amber-300",
  "bg-rose-500/20 text-rose-300",
];

const emptyForm = {
  clientName: "",
  companyName: "",
  projectName: "",
  rating: 5,
  review: "",
  reviewDate: "",
  testimonialStatus: STATUS_OPTIONS[0],
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

export default function TestimonialsPage({ isDarkMode = true }) {
  const [testimonials, setTestimonials] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [testimonialsRes, statsRes] = await Promise.all([
        axiosInstance.get("/testimonials"),
        axiosInstance.get("/testimonials/stats"),
      ]);
      setTestimonials(testimonialsRes.data ?? []);
      setStatsData(statsRes.data ?? null);
    } catch (err) {
      console.error("Failed to load testimonials:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let rows = testimonials;
    if (filter !== "All")
      rows = rows.filter((t) => t.testimonialStatus === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (t) =>
          (t.testimonialName || "").toLowerCase().includes(q) ||
          (t.testimonialCompany || "").toLowerCase().includes(q) ||
          (t.testimonialProject || "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [testimonials, filter, query]);

  // Compute summary cards from stats API or fallback to local data
  const cards = useMemo(() => {
    if (statsData) {
      return [
        {
          label: "Total Testimonials",
          value: String(statsData.total ?? testimonials.length),
          icon: MessageSquareQuote,
          tone: "text-cyan-400",
        },
        {
          label: "Average Rating",
          value: `${(statsData.averageRating ?? 0).toFixed(1)} / 5`,
          icon: Star,
          tone: "text-amber-400",
        },
        {
          label: "Published",
          value: String(statsData.published ?? testimonials.filter((t) => t.testimonialStatus === "Published").length),
          icon: ThumbsUp,
          tone: "text-emerald-400",
        },
        {
          label: "Pending Review",
          value: String(statsData.pending ?? testimonials.filter((t) => t.testimonialStatus === "Pending Review").length),
          icon: Clock,
          tone: "text-amber-400",
        },
      ];
    }

    const total = testimonials.length;
    const avgRating = total
      ? (testimonials.reduce((sum, t) => sum + (t.testimonialRating || 0), 0) / total).toFixed(1)
      : "0.0";
    const published = testimonials.filter((t) => t.testimonialStatus === "Published").length;
    const pending = testimonials.filter((t) => t.testimonialStatus === "Pending Review").length;

    return [
      { label: "Total Testimonials", value: String(total), icon: MessageSquareQuote, tone: "text-cyan-400" },
      { label: "Average Rating", value: `${avgRating} / 5`, icon: Star, tone: "text-amber-400" },
      { label: "Published", value: String(published), icon: ThumbsUp, tone: "text-emerald-400" },
      { label: "Pending Review", value: String(pending), icon: Clock, tone: "text-amber-400" },
    ];
  }, [statsData, testimonials]);

  const openCreateModal = () => {
    setEditingTestimonialId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingTestimonialId(item.testimonialId);
    setForm({
      clientName: item.testimonialName || "",
      companyName: item.testimonialCompany || "",
      projectName: item.testimonialProject || "",
      rating: item.testimonialRating || 5,
      review: item.testimonialQuote || "",
      reviewDate: item.reviewDate ? item.reviewDate.split("T")[0] : "",
      testimonialStatus: item.testimonialStatus || STATUS_OPTIONS[0],
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTestimonialId(null);
    setForm(emptyForm);
  };

  const handleChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const formatDateDisplay = (rawDate) => {
    if (!rawDate) {
      return new Date().toISOString().split("T")[0];
    }
    const parsed = new Date(rawDate);
    if (isNaN(parsed.getTime())) return rawDate;
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handleSave = async () => {
    if (!form.clientName.trim() || !form.review.trim()) return;
    setSaving(true);

    try {
      const payload = {
        testimonialName: form.clientName.trim(),
        testimonialRole: form.companyName.trim(),
        testimonialCompany: form.companyName.trim(),
        testimonialProject: form.projectName.trim(),
        testimonialQuote: form.review.trim(),
        testimonialRating: Number(form.rating),
        testimonialStatus: form.testimonialStatus,
        reviewDate: form.reviewDate || new Date().toISOString().split("T")[0],
      };

      if (editingTestimonialId) {
        await axiosInstance.put(`/testimonials/${editingTestimonialId}`, payload);
      } else {
        await axiosInstance.post("/testimonials", payload);
      }

      closeModal();
      loadData();
    } catch (err) {
      console.error("Failed to save testimonial:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to save testimonial. Please try again.";
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/testimonials/${deleteTarget.testimonialId}`);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      console.error("Failed to delete testimonial:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete testimonial.";
      alert(message);
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (name) =>
    (name || "")
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CL";

  return (
    <div className="p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end justify-between">
        <div>
          <h3 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Client Testimonials
          </h3>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Review, edit, and moderate client feedback on delivered projects.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-cyan-400 cursor-pointer"
        >
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
              className={`rounded-xl border p-4 ${
                isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-gray-200 bg-white shadow-sm'
              }`}
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
      <div className={`flex flex-col sm:flex-row gap-4 items-center justify-between rounded-xl border p-3 ${
        isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-gray-200 bg-white shadow-sm'
      }`}>
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer",
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
            className={`w-full rounded-lg border py-2 pl-9 pr-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
              isDarkMode
                ? 'border-slate-700 bg-slate-800/60 text-slate-200 placeholder:text-slate-500'
                : 'border-gray-300 bg-white text-gray-800 placeholder:text-gray-400'
            }`}
          />
        </div>
      </div>

      {/* Table */}
      <div className={`overflow-x-auto rounded-xl border ${
        isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-gray-200 bg-white shadow-sm'
      }`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className={`border-b text-xs uppercase tracking-wider ${
              isDarkMode ? 'border-slate-800 text-slate-500' : 'border-gray-200 text-gray-500'
            }`}>
              <th className="px-6 py-3.5 font-medium">Client</th>
              <th className="px-6 py-3.5 font-medium">Project</th>
              <th className="px-6 py-3.5 font-medium">Rating</th>
              <th className="px-6 py-3.5 font-medium">Review</th>
              <th className="px-6 py-3.5 font-medium">Date</th>
              <th className="px-6 py-3.5 font-medium">Status</th>
              <th className="px-6 py-3.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/70' : 'divide-gray-100'}`}>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                  Loading testimonials...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                  No testimonials match your search or filter.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const initials = getInitials(item.testimonialName);
                const colorIdx = (filtered.indexOf(item) + (item.testimonialRating || 0)) % COLOR_PALETTES.length;
                const color = COLOR_PALETTES[colorIdx] || COLOR_PALETTES[0];
                const displayDate = item.reviewDate
                  ? new Date(item.reviewDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })
                  : "—";
                return (
                  <tr key={item.testimonialId || item._id} className={isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${color}`}
                        >
                          {initials}
                        </div>
                        <div>
                          <p className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>{item.testimonialName}</p>
                          <p className="text-xs text-slate-500">{item.testimonialCompany}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{item.testimonialProject}</td>
                    <td className="px-6 py-4">
                      <StarRating value={item.testimonialRating || 0} />
                    </td>
                    <td className="max-w-xs px-6 py-4">
                      <p className="line-clamp-2 text-slate-400">{item.testimonialQuote}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">{displayDate}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[item.testimonialStatus] || STATUS_STYLES["Pending Review"]}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {item.testimonialStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        <button
                          onClick={() => openEditModal(item)}
                          className="hover:text-cyan-400 cursor-pointer transition-colors"
                          aria-label="Edit testimonial"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="hover:text-rose-400 cursor-pointer transition-colors"
                          aria-label="Delete testimonial"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className={`flex items-center justify-between border-t px-6 py-3.5 ${
          isDarkMode ? 'border-slate-800' : 'border-gray-200'
        }`}>
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-900'}`}>{filtered.length}</span> of{" "}
            <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-900'}`}>{testimonials.length}</span>{" "}
            testimonials
          </p>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingTestimonialId !== null ? "Edit Testimonial" : "Add Testimonial"}
        subtitle={
          editingTestimonialId !== null
            ? `${form.clientName}${form.companyName ? " · " + form.companyName : ""}`
            : "Create a new client review"
        }
        footer={
          <>
            <button
              onClick={closeModal}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving..." : editingTestimonialId !== null ? "Save Changes" : "Create Testimonial"}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Client Name">
            <input
              type="text"
              value={form.clientName}
              onChange={handleChange("clientName")}
              placeholder="e.g. Sarah Jenkins"
              className={inputClass}
            />
          </Field>
          <Field label="Company">
            <input
              type="text"
              value={form.companyName}
              onChange={handleChange("companyName")}
              placeholder="e.g. NexGen Systems"
              className={inputClass}
            />
          </Field>
          <div className="col-span-2">
            <Field label="Project">
              <input
                type="text"
                value={form.projectName}
                onChange={handleChange("projectName")}
                placeholder="e.g. Cloud Migration Platform"
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
              type="date"
              value={form.reviewDate}
              onChange={handleChange("reviewDate")}
              className={inputClass}
            />
          </Field>
          <div className="col-span-2">
            <Field label="Review">
              <textarea
                value={form.review}
                onChange={handleChange("review")}
                placeholder="Write client review..."
                rows={4}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Status">
              <select
                value={form.testimonialStatus}
                onChange={handleChange("testimonialStatus")}
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

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Testimonial"
        subtitle="This action cannot be undone."
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400 cursor-pointer disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </>
        }
      >
        {deleteTarget && (
          <p className="text-sm text-slate-300">
            Are you sure you want to delete the testimonial from{" "}
            <span className="font-semibold text-slate-100">{deleteTarget.testimonialName}</span>{" "}
            ({deleteTarget.testimonialCompany}) about{" "}
            <span className="font-semibold text-slate-100">{deleteTarget.testimonialProject}</span>?
          </p>
        )}
      </Modal>
    </div>
  );
}