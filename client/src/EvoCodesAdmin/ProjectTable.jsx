import React from 'react';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProjectTable({ 
  paginatedProjects, processedProjects, currentPage, setCurrentPage, totalPages, onDeleteProject, isDarkMode 
}) {
  return (
    <div className={`rounded-xl border overflow-hidden transition-colors w-full ${
      isDarkMode ? 'bg-[#0f1422] border-[#1e2640]' : 'bg-white border-gray-200'
    }`}>
      {/* Responsive Horizontal Scroll Wrapper Container */}
      <div className="overflow-x-auto w-full scrollbar-thin">
        <table className="w-full border-collapse text-left min-w-[700px]">
          <thead>
            <tr className={`border-b text-[10px] uppercase font-bold tracking-wider text-gray-500 ${
              isDarkMode ? 'bg-[#131a2e] border-[#1e2640]' : 'bg-gray-50 border-gray-200'
            }`}>
              <th className="py-3 px-4 md:px-6">Project</th>
              <th className="py-3 px-4 md:px-6">Client</th>
              <th className="py-3 px-4 md:px-6">Category</th>
              <th className="py-3 px-4 md:px-6">Technologies</th>
              <th className="py-3 px-4 md:px-6">Status</th>
              <th className="py-3 px-4 md:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-sm ${isDarkMode ? 'divide-[#1e2640]/50' : 'divide-gray-200'}`}>
            {paginatedProjects.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-gray-500 text-xs">No active datasets match explicit search parameters.</td>
              </tr>
            ) : (
              paginatedProjects.map((project) => (
                <tr key={project.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-[#141b2d]' : 'hover:bg-gray-50'}`}>
                  <td className="py-4 px-4 md:px-6 flex items-center gap-4">
                    <img src={project.image} alt={project.name} className="w-10 h-10 object-cover rounded-lg border border-[#222f54] flex-shrink-0" />
                    <div className="min-w-0">
                      <div className={`font-bold transition-colors truncate ${isDarkMode ? 'text-white group-hover:text-[#4cc9f0]' : 'text-gray-900 group-hover:text-[#00b4d8]'}`}>{project.name}</div>
                      <div className="text-[10px] font-mono text-gray-500 mt-0.5">{project.version}</div>
                    </div>
                  </td>
                  <td className={`py-4 px-4 md:px-6 font-medium truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{project.client}</td>
                  <td className="py-4 px-4 md:px-6 text-xs font-semibold text-gray-400">{project.category}</td>
                  <td className="py-4 px-4 md:px-6">
                    <div className="flex gap-1.5 flex-wrap max-w-[200px]">
                      {project.tech.map((t, idx) => (
                        <span key={idx} className="bg-[#1b243d] text-[#a5b4fc] px-2 py-0.5 rounded text-[10px] font-medium border border-[#2a375e] whitespace-nowrap">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 md:px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${
                      project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                      project.status === 'In Progress' ? 'bg-[#00b4d8]/10 text-[#00b4d8]' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        project.status === 'Completed' ? 'bg-emerald-400' :
                        project.status === 'In Progress' ? 'bg-[#00b4d8]' : 'bg-amber-400'
                      }`} />
                      {project.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 md:px-6 text-right">
                    <button 
                      onClick={() => onDeleteProject(project.id)}
                      className="text-gray-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/5 transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Module Footprint Layout Area */}
      <div className={`p-4 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-gray-500 border-t ${
        isDarkMode ? 'bg-[#131a2e]/60 border-[#1e2640]' : 'bg-gray-50 border-gray-200'
      }`}>
        <div>Showing <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>{paginatedProjects.length}</span> of <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>{processedProjects.length}</span> results</div>
        <div className="flex gap-1">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className={`p-1.5 rounded border text-gray-500 transition-all ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:text-white cursor-pointer'}`}
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
            className={`p-1.5 rounded border text-gray-500 transition-all ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:text-white cursor-pointer'}`}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}