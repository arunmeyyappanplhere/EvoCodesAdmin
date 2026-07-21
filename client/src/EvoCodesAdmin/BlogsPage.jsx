import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import Modal, { Field, inputClass, selectClass } from "./Modal";

const BLOGS = [
  {
    id: 1,
    title: "Architecting the Future of Cloud-Native Systems",
    date: "Oct 24, 2023",
    category: "Engineering",
    categoryColor: "bg-cyan-500/10 text-cyan-400",
    author: "Elena Voss",
    authorInitials: "EV",
    status: "Published",
    thumb: "bg-gradient-to-br from-cyan-600 to-slate-800",
  },
  {
    id: 2,
    title: "10 Performance Bottlenecks in Modern React Apps",
    date: "Oct 22, 2023",
    category: "Tutorials",
    categoryColor: "bg-violet-500/10 text-violet-400",
    author: "Marcus Chen",
    authorInitials: "MC",
    status: "Draft",
    thumb: "bg-gradient-to-br from-violet-600 to-slate-800",
  },
  {
    id: 3,
    title: "Evo Codes Q4 Roadmap: Scaling to 200 Clients",
    date: "Oct 12, 2023",
    category: "Company News",
    categoryColor: "bg-amber-500/10 text-amber-400",
    author: "Alex Carter",
    authorInitials: "AC",
    status: "Published",
    thumb: "bg-gradient-to-br from-amber-600 to-slate-800",
  },
  {
    id: 4,
    title: "Mastering CSS Container Queries in Production",
    date: "Oct 05, 2023",
    category: "Tutorials",
    categoryColor: "bg-violet-500/10 text-violet-400",
    author: "Elena Voss",
    authorInitials: "EV",
    status: "Published",
    thumb: "bg-gradient-to-br from-emerald-600 to-slate-800",
  },
];

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

const THUMB_GRADIENTS = [
  "bg-gradient-to-br from-cyan-600 to-slate-800",
  "bg-gradient-to-br from-violet-600 to-slate-800",
  "bg-gradient-to-br from-amber-600 to-slate-800",
  "bg-gradient-to-br from-emerald-600 to-slate-800",
];

const emptyBlogForm = {
  title: "",
  date: "",
  category: Object.keys(CATEGORY_OPTIONS)[0],
  author: "",
  status: STATUS_OPTIONS[0],
};

export default function BlogsPage({ isDarkMode = true }) {
  const [blogs, setBlogs] = useState(BLOGS);
  const [selected, setSelected] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyBlogForm);

  // Search and Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");

  // Filtered Blogs List
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        blog.title.toLowerCase().includes(query) ||
        blog.author.toLowerCase().includes(query) ||
        blog.category.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategoryFilter === "All" || blog.category === selectedCategoryFilter;

      const matchesStatus =
        selectedStatusFilter === "All" || blog.status === selectedStatusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [blogs, searchQuery, selectedCategoryFilter, selectedStatusFilter]);

  const allSelected =
    selected.length === filteredBlogs.length && filteredBlogs.length > 0;

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyBlogForm);
    setModalOpen(true);
  };

  const openEditModal = (blog) => {
    setEditingId(blog.id);
    setForm({
      title: blog.title,
      date: "", 
      category: blog.category,
      author: blog.author,
      status: blog.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyBlogForm);
  };

  const handleChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

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

  const handleSave = () => {
    if (!form.title.trim()) return;

    const initials = form.author
      ? form.author
          .split(" ")
          .filter(Boolean)
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "NA";

    const displayDate = formatDateDisplay(form.date);

    if (editingId !== null) {
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === editingId
            ? {
                ...b,
                ...form,
                date: form.date ? displayDate : b.date,
                categoryColor:
                  CATEGORY_OPTIONS[form.category] || b.categoryColor,
                authorInitials: initials,
              }
            : b
        )
      );
    } else {
      const newBlog = {
        id: Date.now(),
        ...form,
        date: displayDate,
        categoryColor:
          CATEGORY_OPTIONS[form.category] || "bg-cyan-500/10 text-cyan-400",
        authorInitials: initials || "AN",
        thumb:
          THUMB_GRADIENTS[Math.floor(Math.random() * THUMB_GRADIENTS.length)],
      };
      setBlogs((prev) => [newBlog, ...prev]);
    }

    closeModal();
  };

  const toggleAll = () => {
    setSelected(allSelected ? [] : filteredBlogs.map((b) => b.id));
  };

  const toggleOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteOne = (id) => {
    setBlogs((prev) => prev.filter((b) => b.id !== id));
    setSelected((prev) => prev.filter((x) => x !== id));
  };

  const handleBulkDelete = () => {
    setBlogs((prev) => prev.filter((b) => !selected.includes(b.id)));
    setSelected([]);
  };

  const handleBulkDraft = () => {
    setBlogs((prev) =>
      prev.map((b) => (selected.includes(b.id) ? { ...b, status: "Draft" } : b))
    );
    setSelected([]);
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
            {filteredBlogs.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-10 text-center text-slate-500 text-sm">
                  No articles found matching your search.
                </td>
              </tr>
            ) : (
              filteredBlogs.map((blog) => (
                <tr key={blog.id} className={isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(blog.id)}
                      onChange={() => toggleOne(blog.id)}
                      className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-800 accent-cyan-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-2 py-4">
                    <div className={`h-12 w-16 rounded-md ${blog.thumb}`} />
                  </td>
                  <td className="px-6 py-4">
                    <p className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>{blog.title}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                    {blog.date}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-md px-2 py-1 text-xs font-medium ${blog.categoryColor}`}>
                      {blog.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-[10px] font-semibold text-slate-200">
                        {blog.authorInitials}
                      </span>
                      <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>{blog.author}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[blog.status]}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {blog.status}
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
                        onClick={() => handleDeleteOne(blog.id)}
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
        subtitle={editingId !== null ? form.title : "Add a new blog post"}
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
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 cursor-pointer"
            >
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
                value={form.title}
                onChange={handleChange("title")}
                placeholder="Enter blog title..."
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Author">
            <input
              type="text"
              value={form.author}
              onChange={handleChange("author")}
              placeholder="e.g. Elena Voss"
              className={inputClass}
            />
          </Field>
          <Field label="Publish Date">
            <input
              type="date"
              value={form.date}
              onChange={handleChange("date")}
              className={inputClass}
            />
          </Field>
          <Field label="Category">
            <select
              value={form.category}
              onChange={handleChange("category")}
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
      </Modal>
    </div>
  );
}