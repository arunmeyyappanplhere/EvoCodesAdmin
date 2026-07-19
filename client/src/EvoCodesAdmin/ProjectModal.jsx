import React from 'react';

export default function ProjectModal({ isOpen, onClose, newProject, setNewProject, onSubmit }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#06080f]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f1422] border border-[#263359] rounded-xl w-full max-w-md p-5 md:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto scrollbar-none">
        <h4 className="text-base md:text-lg font-bold text-white mb-4">Pipeline Sync: Add New Project</h4>
        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 font-semibold mb-1">Project Name</label>
            <input 
              type="text" required
              value={newProject.name}
              onChange={e => setNewProject({...newProject, name: e.target.value})}
              className="w-full bg-[#0b0f17] border border-[#222f54] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4cc9f0]"
              placeholder="e.g. Genesis Smart Contract"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Client Title</label>
              <input 
                type="text" required
                value={newProject.client}
                onChange={e => setNewProject({...newProject, client: e.target.value})}
                className="w-full bg-[#0b0f17] border border-[#222f54] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4cc9f0]"
                placeholder="e.g. EtherLabs"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Build Version</label>
              <input 
                type="text"
                value={newProject.version}
                onChange={e => setNewProject({...newProject, version: e.target.value})}
                className="w-full bg-[#0b0f17] border border-[#222f54] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4cc9f0]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Category</label>
              <select 
                value={newProject.category}
                onChange={e => setNewProject({...newProject, category: e.target.value})}
                className="w-full bg-[#0b0f17] border border-[#222f54] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4cc9f0]"
              >
                <option value="Web App">Web App</option>
                <option value="Mobile App">Mobile App</option>
                <option value="AI/ML">AI/ML</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Status</label>
              <select 
                value={newProject.status}
                onChange={e => setNewProject({...newProject, status: e.target.value})}
                className="w-full bg-[#0b0f17] border border-[#222f54] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4cc9f0]"
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1">Tech Stack (comma separated)</label>
            <input 
              type="text"
              value={newProject.tech}
              onChange={e => setNewProject({...newProject, tech: e.target.value})}
              className="w-full bg-[#0b0f17] border border-[#222f54] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4cc9f0]"
              placeholder="React, Next.js, Solidity"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="bg-[#151c30] text-gray-400 px-4 py-2 rounded-lg font-semibold hover:bg-[#1d2744]"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-[#72efdd] text-[#0b0f17] px-4 py-2 rounded-lg font-bold hover:bg-[#52e3d0]"
            >
              Publish Live
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}