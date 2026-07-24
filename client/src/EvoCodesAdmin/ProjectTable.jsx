import React from 'react';
import { Trash2, Pencil, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProjectTable({
  paginatedProjects, processedProjects, currentPage, setCurrentPage, totalPages, onDeleteProject, onEditProject
}) {
  return (
    <div className="rounded-xl border overflow-hidden transition-colors w-full bg-[#0f1422] border-[#1e2640]">
      <div className="overflow-x-auto w-full scrollbar-thin">
        <table className="w-full border-collapse text-left min-w-[700px]">
          <thead>
            <tr className="border-b text-[10px] uppercase font-bold tracking-wider text-gray-500 bg-[#131a2e] border-[#1e2640]">
              <th className="py-3 px-4 md:px-6">Project</th>
              <th className="py-3 px-4 md:px-6">Description</th>
              <th className="py-3 px-4 md:px-6">Sectors</th>
              <th className="py-3 px-4 md:px-6">Live Site</th>
              <th className="py-3 px-4 md:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm divide-[#1e2640]/50">
            {paginatedProjects.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-gray-500 text-xs">No projects match the current filters.</td>
              </tr>
            ) : (
              paginatedProjects.map((project) => (
                <tr key={project.projectID} className="transition-colors group hover:bg-[#141b2d]">
                  <td className="py-4 px-4 md:px-6 flex items-center gap-4">
                    <img src={project.projectCoverImg} alt={project.projectName} className="w-10 h-10 object-cover rounded-lg border border-[#222f54] flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold transition-colors truncate text-white group-hover:text-[#4cc9f0]">{project.projectName}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 md:px-6 text-xs text-gray-400 max-w-xs truncate">{project.projectDesc}</td>
                  <td className="py-4 px-4 md:px-6">
                    <div className="flex gap-1.5 flex-wrap max-w-[200px]">
                      {(project.projectSectors || []).map((t, idx) => (
                        <span key={idx} className="bg-[#1b243d] text-[#a5b4fc] px-2 py-0.5 rounded text-[10px] font-medium border border-[#2a375e] whitespace-nowrap">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 md:px-6">
                    {project.projectSiteLink ? (
                      <a href={project.projectSiteLink} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[#4cc9f0] hover:underline text-xs">
                        Visit <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-4 px-4 md:px-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-gray-500">
                      <button
                        onClick={() => onEditProject(project)}
                        className="hover:text-cyan-400 p-1.5 rounded-lg hover:bg-cyan-500/5 transition-all"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDeleteProject(project.projectID)}
                        className="hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/5 transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-gray-500 border-t bg-[#131a2e]/60 border-[#1e2640]">
        <div>Showing <span className="text-gray-300 font-semibold">{paginatedProjects.length}</span> of <span className="text-gray-300 font-semibold">{processedProjects.length}</span> results</div>
        <div className="flex gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className={`p-1.5 rounded border border-[#222f54] text-gray-500 transition-all ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:text-white cursor-pointer'}`}
          >
            <ChevronLeft size={14} />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-2.5 py-1 rounded font-bold transition-all ${currentPage === i + 1 ? 'bg-[#72efdd] text-[#0b0f17]' : 'bg-transparent text-gray-400 hover:text-white'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className={`p-1.5 rounded border border-[#222f54] text-gray-500 transition-all ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:text-white cursor-pointer'}`}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}