import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Loader2, AlertCircle, ImagePlus } from 'lucide-react';
import ProjectTable from './ProjectTable';
import Modal, { Field, inputClass } from './Modal';
import axiosInstance from "./api/Axiosinstance";
import AlertModal from "./AlertModal";

const EMPTY_PROJECT = {
  projectName: '',
  projectDesc: '',
  projectSectors: '',
  projectSiteLink: '',
};

// Instance defaults to application/json; drop it for FormData so the browser
// sets the correct multipart boundary itself.
const multipartConfig = { headers: { "Content-Type": undefined } };

const ITEMS_PER_PAGE = 6;

export default function ProjectsPage({ isDarkMode = true }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // projectID being edited, or null when adding
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: 'OK',
    showCancel: false
  });

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/projects");
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response?.status === 400) {
        setProjects([]);
      } else {
        setError("Couldn't load projects. Please refresh and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const processedProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) =>
      p.projectName?.toLowerCase().includes(q) ||
      p.projectDesc?.toLowerCase().includes(q) ||
      (p.projectSectors || []).some((s) => s.toLowerCase().includes(q))
    );
  }, [projects, search]);

  const totalPages = Math.ceil(processedProjects.length / ITEMS_PER_PAGE) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [processedProjects, currentPage]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_PROJECT);
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingId(project.projectID);
    setForm({
      projectName: project.projectName || '',
      projectDesc: project.projectDesc || '',
      projectSectors: (project.projectSectors || []).join(', '),
      projectSiteLink: project.projectSiteLink || '',
    });
    setImageFile(null);
    setImagePreview(project.projectCoverImg || null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_PROJECT);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.projectName.trim()) {
      setError("Project name is required.");
      return;
    }
    if (!editingId && !imageFile) {
      setError("Please choose a cover image for the project.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => fd.append(key, value));
      if (imageFile) fd.append("coverImg", imageFile);

      if (editingId) {
        const res = await axiosInstance.put(`/projects/${editingId}`, fd, multipartConfig);
        setProjects((prev) => prev.map((p) => (p.projectID === editingId ? res.data : p)));
      } else {
        const res = await axiosInstance.post("/projects", fd, multipartConfig);
        setProjects((prev) => [res.data, ...prev]);
      }
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to save the project.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (projectID) => {
    setAlertConfig({
      isOpen: true,
      title: 'Confirm Delete',
      message: 'Delete this project?',
      type: 'warning',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: async () => {
        setError(null);
        try {
          await axiosInstance.delete(`/projects/${projectID}`);
          setProjects((prev) => prev.filter((p) => p.projectID !== projectID));
        } catch {
          setError("Failed to delete the project.");
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-white">Projects</h3>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Manage the portfolio shown on the public site.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-[#72efdd] hover:bg-[#52e3d0] text-[#0b0f17] px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
        >
          <Plus size={16} strokeWidth={2.5} /> Add Project
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
          <div className="flex items-center gap-2"><AlertCircle size={14} /><span>{error}</span></div>
          <button onClick={() => setError(null)} aria-label="Dismiss"><X size={14} /></button>
        </div>
      )}

      <div className="relative max-w-md">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          placeholder="Search projects, sectors..."
          className="w-full rounded-lg border border-[#1e2640] bg-[#0f1422] py-2 pl-9 pr-3 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-[#4cc9f0]"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-500 text-sm">
          <Loader2 size={18} className="animate-spin" /> Loading projects...
        </div>
      ) : (
        <ProjectTable
          paginatedProjects={paginatedProjects}
          processedProjects={processedProjects}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          onDeleteProject={handleDeleteProject}
          onEditProject={openEditModal}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId !== null ? "Edit Project" : "Create Project"}
        subtitle={editingId !== null ? form.projectName : "Add a new project to your portfolio"}
        footer={
          <>
            <button
              onClick={closeModal}
              disabled={isSaving}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-[#72efdd] px-4 py-2 text-sm font-semibold text-[#0b0f17] hover:bg-[#52e3d0] disabled:opacity-50"
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              {editingId !== null ? "Save Changes" : "Add Project"}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="col-span-1">
            <Field label="Project Name">
              <input
                type="text"
                value={form.projectName}
                onChange={(e) => setForm((f) => ({ ...f, projectName: e.target.value }))}
                placeholder="Enter project name..."
                className={inputClass}
              />
            </Field>
          </div>

          <div>
            <Field label="Description">
              <textarea
                value={form.projectDesc}
                onChange={(e) => setForm((f) => ({ ...f, projectDesc: e.target.value }))}
                rows={3}
                placeholder="Brief description of the project..."
                className={inputClass}
              />
            </Field>
          </div>

          <div>
            <Field label="Sectors (comma separated)">
              <input
                type="text"
                value={form.projectSectors}
                onChange={(e) => setForm((f) => ({ ...f, projectSectors: e.target.value }))}
                placeholder="Web, Mobile, AI"
                className={inputClass}
              />
            </Field>
          </div>

          <div>
            <Field label="Live Site Link">
              <input
                type="url"
                value={form.projectSiteLink}
                onChange={(e) => setForm((f) => ({ ...f, projectSiteLink: e.target.value }))}
                placeholder="https://example.com"
                className={inputClass}
              />
            </Field>
          </div>

          <div>
            <Field label="Cover Image">
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
        </div>
      </Modal>

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
