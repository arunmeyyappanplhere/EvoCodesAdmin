import React, { useEffect, useMemo, useState, useRef } from "react";
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
  Upload,
} from "lucide-react";
import axiosInstance from "./api/axiosInstance";
import Modal, { Field, inputClass, selectClass } from "./Modal";

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

const emptyBlogForm = {
  blogTitle: "",
  blogDate: "",
  blogCategory: Object.keys(CATEGORY_OPTIONS)[0],
  blogAuthor: "",
  blogDescription: "",
  blogStatus: STATUS_OPTIONS[0],
};

export default function BlogsPage({ isDarkMode = true }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlogID, setEditingBlogID] = useState(null);
  const [form, setForm] = useState(emptyBlogForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Search and Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/blogs");
      setBlogs(res.data ?? []);
    } catch (err) {
      console.error("Failed to load blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Blogs List
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        (blog.blogTitle || "").toLowerCase().includes(query) ||
        (blog.blogAuthor || "").toLowerCase().includes(query) ||
        (blog.blogCategory || "").toLowerCase().includes(query);

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
    setEditingBlogID(null);
    setForm(emptyBlogForm);
    setSelectedFile(null);
    setModalOpen(true);
  };

  const openEditModal = (blog) => {
    setEditingBlogID(blog.blogID);
    setForm({
      blogTitle: blog.blogTitle || "",
      blogDate: blog.blogDate ? blog.blogDate.split("T")[0] : "",
      blogCategory: blog.blogCategory || Object.keys(CATEGORY_OPTIONS)[0],
      blogAuthor: blog.blogAuthor || "",
      blogDescription: blog.blogDescription || "",
      blogStatus: blog.blogStatus || STATUS_OPTIONS[0],
    });
    setSelectedFile(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingBlogID(null);
    setForm(emptyBlogForm);
    setSelectedFile(null);
  };

  const handleChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.blogTitle.trim()) return;

    // For CREATE, a featured image is required
    if (!editingBlogID && !selectedFile) {
      alert("Please select a featured image.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("blogTitle", form.blogTitle.trim());
      formData.append("blogAuthor", form.blogAuthor.trim());
      formData.append("blogCategory", form.blogCategory);
      formData.append("blogDate", form.blogDate || new Date().toISOString().split("T")[0]);
      formData.append("blogDescription", form.blogDescription.trim());
      formData.append("blogStatus", form.blogStatus);

      if (selectedFile) {
        formData.append("blogImage", selectedFile);
      }

      if (editingBlogID) {
        await axiosInstance.put(`/blogs/${editingBlogID}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("/blogs", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      closeModal();
      loadBlogs();
    } catch (err) {
      console.error("Failed to save blog:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to save blog. Please try again.";
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const toggleAll = () => {
    setSelected(allSelected ? [] : filteredBlogs.map((b) => b.blogID));
  };

  const toggleOne = (blogID) => {
    setSelected((prev) =>
      prev.includes(blogID) ? prev.filter((x) => x !== blogID) : [...prev, blogID]
    );
  };

  const handleDeleteOne = async (blogID) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await axiosInstance.delete(`/blogs/${blogID}`);
      setSelected((prev) => prev.filter((x) => x !== blogID));
      loadBlogs();
    } catch (err) {
      console.error("Failed to delete blog:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete blog. Please try again.";
      alert(message);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.length} selected blog(s)?`)) return;
    try {
      await Promise.all(selected.map((id) => axiosInstance.delete(`/blogs/${id}`)));
      setSelected([]);
      loadBlogs();
    } catch (err) {
      console.error("Bulk delete failed:", err);
      alert("Some blogs could not be deleted.");
    }
  };

  const handleBulkDraft = async () => {
    try {
      await Promise.all(
        selected.map((id) =>
          axiosInstance.put(`/blogs/${id}`, { blogStatus: "Draft" })
        )
      );
      setSelected([]);
      loadBlogs();
    } catch (err) {
      console.error("Bulk draft failed:", err);
      alert("Some blogs could not be updated.");
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
                  Loading blogs...
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
                <tr key={blog.blogID || blog._id} className={isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-gray-50'}>
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
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`h-12 w-16 rounded-md bg-gradient-to-br from-cyan-600 to-slate-800 items-center justify-center ${blog.blogImg ? 'hidden' : 'flex'}`}
                    >
                      <span className="text-[10px] text-slate-400">No img</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>{blog.blogTitle}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                    {blog.blogDate ? new Date(blog.blogDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-md px-2 py-1 text-xs font-medium ${CATEGORY_OPTIONS[blog.blogCategory] || "bg-cyan-500/10 text-cyan-400"}`}>
                      {blog.blogCategory}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-[10px] font-semibold text-slate-200">
                        {(blog.blogAuthor || "AN").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
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
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingBlogID !== null ? "Edit Blog" : "Create Blog"}
        subtitle={editingBlogID !== null ? form.blogTitle : "Add a new blog post"}
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
              {saving ? "Saving..." : editingBlogID !== null ? "Save Changes" : "Create Article"}
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
            <Field label="Description">
              <textarea
                value={form.blogDescription}
                onChange={handleChange("blogDescription")}
                rows={3}
                placeholder="Brief description of the blog post..."
                className={inputClass}
              />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label={`Featured Image ${editingBlogID ? "(leave empty to keep current)" : ""}`}>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors ${
                    isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Upload size={14} />
                  {selectedFile ? selectedFile.name : "Choose Image"}
                </button>
                {selectedFile && (
                  <span className="text-[10px] text-cyan-400">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                )}
              </div>
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}