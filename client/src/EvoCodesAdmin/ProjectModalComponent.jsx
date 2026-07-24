import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import axiosInstance from "./api/Axiosinstance";

export default function ProjectModal({ 
  isOpen, 
  onClose, 
  newProject, 
  setNewProject, 
  onSubmit, 
  editingId, 
  isSaving, 
  imagePreview, 
  onImageChange 
}) {
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    onSubmit(e);
  };

  const handleChange = (key) => (e) => {
    setNewProject((prev) => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#1e2640] bg-[#0f1422] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-white">{editingId ? "Edit Project" : "Add Project"}</h4>
          <button 
            onClick={onClose} 
            disabled={isSaving}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#141b2d] disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300 mb-4">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Project Name</label>
            <input
              type="text"
              value={newProject.projectName}
              onChange={handleChange("projectName")}
              required
              className="w-full px-3 py-2 bg-[#0b0f17] border border-[#1e2640] rounded-lg text-xs text-white focus:outline-none focus:border-[#4cc9f0]"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Description</label>
            <textarea
              value={newProject.projectDesc}
              onChange={handleChange("projectDesc")}
              required
              rows={3}
              className="w-full px-3 py-2 bg-[#0b0f17] border border-[#1e2640] rounded-lg text-xs text-white focus:outline-none focus:border-[#4cc9f0]"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Sectors (comma separated)</label>
            <input
              type="text"
              value={newProject.projectSectors}
              onChange={handleChange("projectSectors")}
              placeholder="Web, Mobile, AI"
              className="w-full px-3 py-2 bg-[#0b0f17] border border-[#1e2640] rounded-lg text-xs text-white focus:outline-none focus:border-[#4cc9f0]"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Live Site Link</label>
            <input
              type="url"
              value={newProject.projectSiteLink}
              onChange={handleChange("projectSiteLink")}
              placeholder="https://example.com"
              className="w-full px-3 py-2 bg-[#0b0f17] border border-[#1e2640] rounded-lg text-xs text-white focus:outline-none focus:border-[#4cc9f0]"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="w-full px-3 py-2 bg-[#0b0f17] border border-[#1e2640] rounded-lg text-xs text-white focus:outline-none focus:border-[#4cc9f0] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#72efdd] file:text-[#0b0f17] hover:file:bg-[#52e3d0]"
            />
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-[#1e2640]" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg border border-gray-700 text-xs font-medium text-gray-300 hover:bg-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#72efdd] hover:bg-[#52e3d0] text-[#0b0f17] text-xs font-bold disabled:opacity-50"
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              {editingId ? "Save Changes" : "Add Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}