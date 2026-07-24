import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Loader2,
  AlertCircle,
  X,
  Quote,
} from "lucide-react";
import axiosInstance from "./api/Axiosinstance";
import AlertModal from "./AlertModal";

const STATUS_OPTIONS = ["Published", "Pending Review", "Archived"];
const STATUS_STYLES = {
  Published: "bg-emerald-500/10 text-emerald-400",
  "Pending Review": "bg-amber-500/10 text-amber-400",
  Archived: "bg-slate-500/10 text-slate-400",
};

const emptyForm = {
  testimonialName: "",
  testimonialRole: "",
  testimonialCompany: "",
  testimonialProject: "",
  testimonialQuote: "",
  testimonialRating: "5",
  testimonialStatus: "Pending Review",
};

export default function TestimonialsPage({ isDarkMode = true }) {
  const [testimonials, setTestimonials] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // Mongo _id
  const [form, setForm] = useState(emptyForm);
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: 'OK',
    showCancel: false
  });

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, statsRes] = await Promise.allSettled([
        axiosInstance.get("/testimonials"),
        axiosInstance.get("/testimonials/stats"),
      ]);

      if (listRes.status === "fulfilled") {
        setTestimonials(Array.isArray(listRes.value.data) ? listRes.value.data : []);
      } else if (listRes.reason?.response?.status === 404) {
        setTestimonials([]);
      } else {
        setError("Couldn't load testimonials. Please refresh and try again.");
      }

      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return testimonials.filter((t) => {
      const matchesStatus = statusFilter === "All" || t.testimonialStatus === statusFilter;
      const matchesSearch =
        !q ||
        t.testimonialName?.toLowerCase().includes(q) ||
        t.testimonialCompany?.toLowerCase().includes(q) ||
        t.testimonialQuote?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [testimonials, statusFilter, search]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingId(t._id);
    setForm({
      testimonialName: t.testimonialName || "",
      testimonialRole: t.testimonialRole || "",
      testimonialCompany: t.testimonialCompany || "",
      testimonialProject: t.testimonialProject || "",
      testimonialQuote: t.testimonialQuote || "",
      testimonialRating: String(t.testimonialRating || "5"),
      testimonialStatus: t.testimonialStatus || "Pending Review",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.testimonialName.trim() || !form.testimonialQuote.trim()) {
      setError("Name and quote are required.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      if (editingId) {
        const res = await axiosInstance.put(`/testimonials/${editingId}`, form);
        setTestimonials((prev) => prev.map((t) => (t._id === editingId ? res.data : t)));
      } else {
        const res = await axiosInstance.post("/testimonials", form);
        setTestimonials((prev) => [res.data, ...prev]);
      }
      closeModal();
      fetchAll(); // refresh stats too
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setAlertConfig({
      isOpen: true,
      title: 'Confirm Delete',
      message: 'Delete this testimonial?',
      type: 'warning',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: async () => {
        setError(null);
        try {
          await axiosInstance.delete(`/testimonials/${id}`);
          setTestimonials((prev) => prev.filter((t) => t._id !== id));
        } catch {
          setError("Failed to delete the testimonial.");
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className={`text-xl md:text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Testimonials
          </h3>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Manage client testimonials shown on the public site.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-[#72efdd] hover:bg-[#52e3d0] text-[#0b0f17] px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
        >
          <Plus size={16} strokeWidth={2.5} /> Add Testimonial
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} aria-label="Dismiss"><X size={14} /></button>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total },
            { label: "Published", value: stats.published },
            { label: "Pending Review", value: stats.pending },
            { label: "Avg Rating", value: stats.averageRating },
          ].map((s) => (
            <div key={s.label} className={`p-4 rounded-xl border ${isDarkMode ? "bg-[#0f1422] border-[#1e2640]" : "bg-white border-gray-200"}`}>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold mt-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto ${isDarkMode ? "bg-[#0f1422] border-[#1e2640]" : "bg-white border-gray-200"}`}>
          {["All", ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                statusFilter === s ? "bg-cyan-500/10 text-cyan-400 font-bold" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, company, or quote..."
          className={`w-full sm:w-64 px-3 py-2 rounded-lg border bg-transparent ${isDarkMode ? "border-[#1e2640] text-white placeholder:text-gray-600" : "border-gray-300 text-gray-900 placeholder:text-gray-400"}`}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-500 text-sm">
          <Loader2 size={18} className="animate-spin" /> Loading testimonials...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-500 text-sm">
          <Quote size={24} className="opacity-50" />
          <p>No testimonials found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t) => (
            <div key={t._id} className={`p-5 rounded-xl border flex flex-col gap-3 ${isDarkMode ? "bg-[#0f1422] border-[#1e2640]" : "bg-white border-gray-200"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{t.testimonialName}</p>
                  <p className="text-xs text-gray-500">
                    {t.testimonialRole}{t.testimonialCompany ? ` · ${t.testimonialCompany}` : ""}
                  </p>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${STATUS_STYLES[t.testimonialStatus] || STATUS_STYLES.Archived}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {t.testimonialStatus}
                </span>
              </div>
              <p className="text-sm text-gray-400 italic">"{t.testimonialQuote}"</p>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill={i < Number(t.testimonialRating) ? "currentColor" : "none"} />
                  ))}
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <button onClick={() => openEditModal(t)} className="hover:text-cyan-400" aria-label="Edit"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(t._id)} className="hover:text-rose-400" aria-label="Delete"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-xl border p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto ${isDarkMode ? "bg-[#0f1422] border-[#1e2640] text-gray-200" : "bg-white border-gray-200 text-gray-800"}`}>
            <h4 className="text-lg font-bold">{editingId ? "Edit Testimonial" : "Add Testimonial"}</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-400 font-medium">Name</label>
                <input type="text" value={form.testimonialName} onChange={handleChange("testimonialName")}
                  className={`w-full p-2.5 rounded-lg border bg-transparent ${isDarkMode ? "border-[#1e2640] text-white" : "border-gray-300 text-gray-900"}`} />
              </div>
              <div className="space-y-1">
                <label className="text-gray-400 font-medium">Role</label>
                <input type="text" value={form.testimonialRole} onChange={handleChange("testimonialRole")}
                  placeholder="e.g. CTO"
                  className={`w-full p-2.5 rounded-lg border bg-transparent ${isDarkMode ? "border-[#1e2640] text-white" : "border-gray-300 text-gray-900"}`} />
              </div>
              <div className="space-y-1">
                <label className="text-gray-400 font-medium">Company</label>
                <input type="text" value={form.testimonialCompany} onChange={handleChange("testimonialCompany")}
                  className={`w-full p-2.5 rounded-lg border bg-transparent ${isDarkMode ? "border-[#1e2640] text-white" : "border-gray-300 text-gray-900"}`} />
              </div>
              <div className="space-y-1">
                <label className="text-gray-400 font-medium">Related Project</label>
                <input type="text" value={form.testimonialProject} onChange={handleChange("testimonialProject")}
                  className={`w-full p-2.5 rounded-lg border bg-transparent ${isDarkMode ? "border-[#1e2640] text-white" : "border-gray-300 text-gray-900"}`} />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-gray-400 font-medium">Quote</label>
                <textarea value={form.testimonialQuote} onChange={handleChange("testimonialQuote")} rows={3}
                  className={`w-full p-2.5 rounded-lg border bg-transparent ${isDarkMode ? "border-[#1e2640] text-white" : "border-gray-300 text-gray-900"}`} />
              </div>
              <div className="space-y-1">
                <label className="text-gray-400 font-medium">Rating (1–5)</label>
                <select value={form.testimonialRating} onChange={handleChange("testimonialRating")}
                  className={`w-full p-2.5 rounded-lg border ${isDarkMode ? "bg-[#0f1422] border-[#1e2640] text-white" : "bg-white border-gray-300 text-gray-900"}`}>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-gray-400 font-medium">Status</label>
                <select value={form.testimonialStatus} onChange={handleChange("testimonialStatus")}
                  className={`w-full p-2.5 rounded-lg border ${isDarkMode ? "bg-[#0f1422] border-[#1e2640] text-white" : "bg-white border-gray-300 text-gray-900"}`}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={closeModal} disabled={isSaving} className="px-4 py-2 rounded-lg border border-gray-700 text-xs font-medium hover:bg-gray-800 disabled:opacity-50">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 text-[#0b0f17] text-xs font-bold hover:bg-cyan-300 disabled:opacity-50">
                {isSaving && <Loader2 size={14} className="animate-spin" />}
                {editingId ? "Save Changes" : "Add Testimonial"}
              </button>
            </div>
          </div>
        </div>
      )}

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
