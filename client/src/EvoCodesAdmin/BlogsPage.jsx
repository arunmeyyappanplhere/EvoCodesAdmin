import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Search,
  Calendar,
  Tag,
  Trash2,
  FileMinus,
  Pencil,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  AlertCircle,
  X,
  ImagePlus,
} from "lucide-react";
import Modal, { Field, inputClass, selectClass } from "./Modal";
import axiosInstance from "./api/Axiosinstance"; // adjust this path to wherever Axiosinstance.js actually lives

const STATUS_STYLES = {
  Published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  Scheduled: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const STATUS_OPTIONS = ["Published", "Draft", "Scheduled"];
const CATEGORY_OPTIONS = {
  Engineering: "bg-cyan-500/10 text-cyan-400",
  Tutorials: "bg-violet-500/10 text-violet-400",
  "Company News": "bg-amber-500/10 text-amber-400",
};
const DEFAULT_CATEGORY_COLOR = "bg-slate-500/10 text-slate-400";

const emptyBlogForm = {
  blogTitle: "",
  blogDate: "",
  blogCategory: Object.keys(CATEGORY_OPTIONS)[0],
  blogAuthor: "",
  blogStatus: STATUS_OPTIONS[0],
  blogDescription: "",
  blogContent: "",
};

// Axios instance already defaults Content-Type to application/json — for image
// uploads we need FormData instead, so this header override tells axios to
// drop the default and let the browser set the correct multipart boundary.
const multipartConfig = { headers: { "Content-Type": undefined } };

const formatDateDisplay = (rawDate) => {
  if (!rawDate) return "Just now";
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return rawDate;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getInitials = (name) =>
  name
    ? name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "NA";

export default function BlogsPage({ isDarkMode = true }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [selected, setSelected] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // blogID being edited, or null when creating
  const [form, setForm] = useState(emptyBlogForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Search and Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");

  // ---- Load blogs from the API ----
  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/blogs");
      setBlogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      // Backend returns 400 "No Blogs Found" when the collection is empty —
      // treat that as an empty list rather than a real error.
      if (err.response?.status === 400) {
        setBlogs([]);
      } else {
        setError("Couldn't load blogs. Please refresh and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Filtered Blogs List
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        blog.blogTitle?.toLowerCase().includes(query) ||
        blog.blogAuthor?.toLowerCase().includes(query) ||
        blog.blogCategory?.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategoryFilter === "All" || blog.blogCategory === selectedCategoryFilter;

      const matchesStatus =
        selectedStatusFilter === "All" || blog.blogStatus === selectedStatusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [blogs, searchQuery, selectedCategoryFilter, selectedStatusFilter]);

  const allSelected =
    selected.length === filteredBlogs.length && filteredBlogs.length > 0;

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyBlogForm);
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEditModal = (blog) => {
    setEditingId(blog.blogID);
    setForm({
      blogTitle: blog.blogTitle || "",
      blogDate: /^\d{4}-\d{2}-\d{2}/.test(blog.blogDate || "") ? blog.blogDate.slice(0, 10) : "",
      blogCategory: blog.blogCategory || Object.keys(CATEGORY_OPTIONS)[0],
      blogAuthor: blog.blogAuthor || "",
      blogStatus: blog.blogStatus || STATUS_OPTIONS[0],
      blogDescription: blog.blogDescription || "",
      blogContent: blog.blogContent || "",
    });
    setImageFile(null);
    setImagePreview(blog.blogImg || null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyBlogForm);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => fd.append(key, value));
    if (imageFile) fd.append("blogImage", imageFile);
    return fd;
  };

  const handleSave = async () => {
    if (!form.blogTitle.trim()) return;
    if (!editingId && !imageFile) {
      setError("Please choose a featured image for the blog.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const fd = buildFormData();
      if (editingId !== null) {
        const res = await axiosInstance.put(`/blogs/${editingId}`, fd, multipartConfig);
        setBlogs((prev) => prev.map((b) => (b.blogID === editingId ? res.data : b)));
      } else {
        const res = await axiosInstance.post("/blogs", fd, multipartConfig);
        setBlogs((prev) => [res.data, ...prev]);
      }
      closeModal();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to save the blog. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAll = () => {
    setSelected(allSelected ? [] : filteredBlogs.map((b) => b.blogID));
  };

  const toggleOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteOne = async (id) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    setError(null);
    try {
      await axiosInstance.delete(`/blogs/${id}`);
      setBlogs((prev) => prev.filter((b) => b.blogID !== id));
      setSelected((prev) => prev.filter((x) => x !== id));
    } catch (err) {
      setError("Failed to delete the blog. Please try again.");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} selected blog(s)?`)) return;
    setError(null);
    const ids = [...selected];
    try {
      await Promise.all(ids.map((id) => axiosInstance.delete(`/blogs/${id}`)));
      setBlogs((prev) => prev.filter((b) => !ids.includes(b.blogID)));
      setSelected([]);
    } catch (err) {
      setError("Some blogs couldn't be deleted. Refreshing the list.");
      fetchBlogs();
    }
  };

  const handleBulkDraft = async () => {
    setError(null);
    const ids = [...selected];
    try {
      const updates = await Promise.all(
        ids.map((id) => {
          const fd = new FormData();
          fd.append("blogStatus", "Draft");
          return axiosInstance.put(`/blogs/${id}`, fd, multipartConfig);
        })
      );
      setBlogs((prev) =>
        prev.map((b) => {
          const updated = updates.find((res) => res.data.blogID === b.blogID);
          return updated ? updated.data : b;
        })
      );
      setSelected([]);
    } catch (err) {
      setError("Some blogs couldn't be updated. Refreshing the list.");
      fetchBlogs();
    }
  };

  const selectionActive = selected.length > 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">
            CMS <span className="mx-1.5 text-slate-600">/</span>
            <span className="text-cyan-400">Blogs</span>
          </p>
          <h2 className={`mt-1 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Blog Management
          </h2>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} />
          Create Blog
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

      {/* Filters & Search Input */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by title, author, or keyword..."
            className={`w-full rounded-lg border py-2 pl-9 pr-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
              isDarkMode 
                ? 'border-slate-800 bg-slate-900/60 text-slate-200 placeholder:text-slate-500' 
                : 'border-gray-300 bg-white text-gray-800 placeholder:text-gray-400'
            }`}
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className={`appearance-none rounded-lg border py-2 pl-9 pr-8 text-sm focus:outline-none cursor-pointer ${
              isDarkMode
                ? 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <option value="All">All Categories</option>
            {Object.keys(CATEGORY_OPTIONS).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <Tag size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className={`appearance-none rounded-lg border py-2 pl-9 pr-8 text-sm focus:outline-none cursor-pointer ${
              isDarkMode
                ? 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <Calendar size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      {/* Bulk actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-800 accent-cyan-500"
            />
            Select All
          </label>
          <button
            onClick={handleBulkDelete}
            disabled={!selectionActive}
            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 disabled:opacity-40 disabled:hover:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
          >
            <Trash2 size={14} />
            Bulk Delete
          </button>
          <button
            onClick={handleBulkDraft}
            disabled={!selectionActive}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:hover:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
          >
            <FileMinus size={14} />
            Set to Draft
          </button>
        </div>
        <p className="text-sm text-cyan-400">
          Showing {filteredBlogs.length} of {blogs.length} articles
        </p>
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
              <th className="w-10 px-6 py-3.5"></th>
              <th className="px-2 py-3.5 font-medium">Featured Image</th>
              <th className="px-6 py-3.5 font-medium">Blog Title</th>
              <th className="px-6 py-3.5 font-medium">Date</th>
              <th className="px-6 py-3.5 font-medium">Category</th>
              <th className="px-6 py-3.5 font-medium">Author</th>
              <th className="px-6 py-3.5 font-medium">Status</th>
              <th className="px-6 py-3.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/70' : 'divide-gray-100'}`}>
            {loading ? (
              <tr>
                <td colSpan="8" className="py-10 text-center text-slate-500 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Loading blogs...
                  </span>
                </td>
              </tr>
            ) : filteredBlogs.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-10 text-center text-slate-500 text-sm">
                  No articles found matching your search.
                </td>
              </tr>
            ) : (
              filteredBlogs.map((blog) => (
                <tr key={blog.blogID} className={isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(blog.blogID)}
                      onChange={() => toggleOne(blog.blogID)}
                      className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-800 accent-cyan-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-2 py-4">
                    {blog.blogImg ? (
                      <img
                        src={blog.blogImg}
                        alt={blog.blogTitle}
                        className="h-12 w-16 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-12 w-16 rounded-md bg-gradient-to-br from-slate-700 to-slate-800" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>{blog.blogTitle}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                    {formatDateDisplay(blog.blogDate)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-md px-2 py-1 text-xs font-medium ${CATEGORY_OPTIONS[blog.blogCategory] || DEFAULT_CATEGORY_COLOR}`}>
                      {blog.blogCategory}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-[10px] font-semibold text-slate-200">
                        {getInitials(blog.blogAuthor)}
                      </span>
                      <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>{blog.blogAuthor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[blog.blogStatus] || STATUS_STYLES.Draft}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {blog.blogStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3 text-slate-400">
                      <button
                        onClick={() => openEditModal(blog)}
                        className="hover:text-cyan-400 cursor-pointer transition-colors"
                        aria-label="Edit blog"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteOne(blog.blogID)}
                        className="hover:text-rose-400 cursor-pointer transition-colors"
                        aria-label="Delete blog"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="hover:text-slate-200 cursor-pointer transition-colors" aria-label="More options">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className={`p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t ${isDarkMode ? "bg-slate-900/40 border-slate-800 text-slate-400" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
          <p>
            Showing <span className={`font-semibold ${isDarkMode ? "text-slate-200" : "text-gray-900"}`}>
              {filteredBlogs.length === 0 ? 0 : 1}–{filteredBlogs.length}
            </span> of{" "}
            <span className={`font-semibold ${isDarkMode ? "text-slate-200" : "text-gray-900"}`}>{blogs.length}</span> articles
          </p>
          <div className="flex items-center gap-1.5">
            <button className={`p-1.5 rounded-lg border transition-colors ${isDarkMode ? "border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800" : "border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
              <ChevronLeft size={14} />
            </button>
            <button className="px-2.5 py-1 rounded-lg font-bold bg-cyan-400 text-[#0b0f17]">1</button>
            <button className={`p-1.5 rounded-lg border transition-colors ${isDarkMode ? "border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800" : "border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId !== null ? "Edit Blog" : "Create Blog"}
        subtitle={editingId !== null ? form.blogTitle : "Add a new blog post"}
        footer={
          <>
            <button
              onClick={closeModal}
              disabled={isSaving}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 cursor-pointer disabled:opacity-50"
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              {editingId !== null ? "Save Changes" : "Create Article"}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Blog Title">
              <input
                type="text"
                value={form.blogTitle}
                onChange={handleChange("blogTitle")}
                placeholder="Enter blog title..."
                className={inputClass}
              />
            </Field>
          </div>

          {/* Featured image upload */}
          <div className="col-span-2">
            <Field label="Featured Image">
              <div className="flex items-center gap-3">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-14 w-20 rounded-md object-cover border border-slate-700" />
                ) : (
                  <div className="flex h-14 w-20 items-center justify-center rounded-md border border-dashed border-slate-700 text-slate-600">
                    <ImagePlus size={18} />
                  </div>
                )}
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800">
                  <ImagePlus size={14} />
                  {imagePreview ? "Replace image" : "Upload image"}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </Field>
          </div>

          <Field label="Author">
            <input
              type="text"
              value={form.blogAuthor}
              onChange={handleChange("blogAuthor")}
              placeholder="e.g. Elena Voss"
              className={inputClass}
            />
          </Field>
          <Field label="Publish Date">
            <input
              type="date"
              value={form.blogDate}
              onChange={handleChange("blogDate")}
              className={inputClass}
            />
          </Field>
          <Field label="Category">
            <select
              value={form.blogCategory}
              onChange={handleChange("blogCategory")}
              className={selectClass}
            >
              {Object.keys(CATEGORY_OPTIONS).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              value={form.blogStatus}
              onChange={handleChange("blogStatus")}
              className={selectClass}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>

          <div className="col-span-2">
            <Field label="Short Description">
              <textarea
                value={form.blogDescription}
                onChange={handleChange("blogDescription")}
                rows={2}
                placeholder="A one or two sentence summary shown in previews..."
                className={inputClass}
              />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Content">
              <textarea
                value={form.blogContent}
                onChange={handleChange("blogContent")}
                rows={6}
                placeholder="Full article content..."
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}