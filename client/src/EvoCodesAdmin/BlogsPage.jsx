import React, { useState } from "react";
import {
  Plus,
  Search,
  Calendar,
  Tag,
  Trash2,
  FileMinus,
  Pencil,
  Eye,
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
    date: "Published Oct 24, 2023",
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
    date: "Updated 2 days ago",
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
    date: "Published Oct 12, 2023",
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
    date: "Published Oct 05, 2023",
    category: "Tutorials",
    categoryColor: "bg-violet-500/10 text-violet-400",
    author: "Elena Voss",
    authorInitials: "EV",
    status: "Published",
    thumb: "bg-gradient-to-br from-emerald-600 to-slate-800",
  },
];

const STATUS_STYLES = {
  Published: "bg-emerald-500/10 text-emerald-400",
  Draft: "bg-slate-500/10 text-slate-400",
  Scheduled: "bg-amber-500/10 text-amber-400",
};

const STATUS_OPTIONS = ["Published", "Draft", "Scheduled"];
const CATEGORY_OPTIONS = {
  Engineering: "bg-cyan-500/10 text-cyan-400",
  Tutorials: "bg-violet-500/10 text-violet-400",
  "Company News": "bg-amber-500/10 text-amber-400",
};

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
  const allSelected = selected.length === blogs.length && blogs.length > 0;

  const openEditModal = (blog) => {
    setEditingId(blog.id);
    setForm({
      title: blog.title,
      date: blog.date,
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

  const handleSave = () => {
    setBlogs((prev) =>
      prev.map((b) =>
        b.id === editingId
          ? {
              ...b,
              ...form,
              categoryColor: CATEGORY_OPTIONS[form.category] || b.categoryColor,
              authorInitials: form.author
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase(),
            }
          : b
      )
    );
    closeModal();
  };

  const toggleAll = () => {
    setSelected(allSelected ? [] : blogs.map((b) => b.id));
  };

  const toggleOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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
        <button className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400">
          <Plus size={16} strokeWidth={2.5} />
          Create Blog
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Filter by title or keyword..."
            className={`w-full rounded-lg border py-2 pl-9 pr-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
              isDarkMode 
                ? 'border-slate-800 bg-slate-900/60 text-slate-200 placeholder:text-slate-500' 
                : 'border-gray-300 bg-white text-gray-800 placeholder:text-gray-400'
            }`}
          />
        </div>
        <button className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm ${
          isDarkMode ? 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}>
          <Calendar size={14} />
          All Dates
          <ChevronDown size={14} className="text-slate-500" />
        </button>
        <button className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm ${
          isDarkMode ? 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}>
          <Tag size={14} />
          All Categories
          <ChevronDown size={14} className="text-slate-500" />
        </button>
      </div>

      {/* Bulk action bar */}
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
            disabled={!selectionActive}
            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 disabled:opacity-40 disabled:hover:text-slate-400"
          >
            <Trash2 size={14} />
            Bulk Delete
          </button>
          <button
            disabled={!selectionActive}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:hover:text-slate-400"
          >
            <FileMinus size={14} />
            Set to Draft
          </button>
        </div>
        <p className="text-sm text-cyan-400">Showing {blogs.length} of 142 articles</p>
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
              <th className="px-6 py-3.5 font-medium">Category</th>
              <th className="px-6 py-3.5 font-medium">Author</th>
              <th className="px-6 py-3.5 font-medium">Status</th>
              <th className="px-6 py-3.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/70' : 'divide-gray-100'}`}>
            {blogs.map((blog) => (
              <tr key={blog.id} className={isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-gray-50'}>
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selected.includes(blog.id)}
                    onChange={() => toggleOne(blog.id)}
                    className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-800 accent-cyan-500"
                  />
                </td>
                <td className="px-2 py-4">
                  <div className={`h-12 w-16 rounded-md ${blog.thumb}`} />
                </td>
                <td className="px-6 py-4">
                  <p className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>{blog.title}</p>
                  <p className="text-xs text-slate-500">{blog.date}</p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${blog.categoryColor}`}
                  >
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
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[blog.status]}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {blog.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3 text-slate-400">
                    <button
                      onClick={() => openEditModal(blog)}
                      className="hover:text-cyan-400"
                      aria-label="Edit blog"
                    >
                      <Pencil size={16} />
                    </button>
                    <button className="hover:text-cyan-400" aria-label="Preview blog">
                      <Eye size={16} />
                    </button>
                    <button className="hover:text-slate-200" aria-label="More options">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className={`flex items-center justify-between border-t px-6 py-3.5 ${
          isDarkMode ? 'border-slate-800' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            Rows per page:
            <button className={`flex items-center gap-1 rounded-md border px-2 py-1 ${
              isDarkMode ? 'border-slate-700 text-slate-300' : 'border-gray-300 text-gray-700'
            }`}>
              25
              <ChevronDown size={12} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-500">1 - 4 of 142</p>
            <div className="flex items-center gap-1">
              <button className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800/50">
                <ChevronLeft size={16} />
              </button>
              <button className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800/50">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Edit Blog"
        subtitle={form.title}
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
          <div className="col-span-2">
            <Field label="Blog Title">
              <input
                type="text"
                value={form.title}
                onChange={handleChange("title")}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Author">
            <input
              type="text"
              value={form.author}
              onChange={handleChange("author")}
              className={inputClass}
            />
          </Field>
          <Field label="Date / Note">
            <input
              type="text"
              value={form.date}
              onChange={handleChange("date")}
              placeholder="Published Oct 24, 2023"
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