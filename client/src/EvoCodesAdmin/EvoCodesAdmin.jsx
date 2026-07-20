import React, { useState, useEffect, useMemo } from 'react';
import { Download, Plus, Globe, Menu } from 'lucide-react';

import Sidebar from './Sidebar';
import Navbar from './Navbar';
import FilterPanel from './FilterPanel';
import ProjectTable from './ProjectTable';
import ProjectModal from './ProjectModal';
import ContactRequestsTable from './ContactRequestsTable';
import TeamManagementTable from './TeamManagementTable';
import ServicesTable from './ServicesPage';
import ClientsPage from './ClientsPage'; 
import BlogsPage from './BlogsPage'; // Integrated Blogs Page

const INITIAL_PROJECTS = [
  { id: 1, name: 'Nova Crypto Dashboard', version: 'v2.4.0', client: 'Stellar Ventures', category: 'Web App', tech: ['React', 'Tailwind', 'Node.js'], status: 'In Progress', image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=80&auto=format&fit=crop&q=60' },
  { id: 2, name: 'Luxury Retail Mobile', version: 'v1.1.2', client: 'Aurum Collective', category: 'Mobile App', tech: ['Flutter', 'Firebase'], status: 'Completed', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=80&auto=format&fit=crop&q=60' },
  { id: 3, name: 'Sentient AI Predictor', version: 'v0.8.5b', client: 'Neural Systems Inc.', category: 'AI/ML', tech: ['Python', 'PyTorch', 'AWS'], status: 'On Hold', image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=80&auto=format&fit=crop&q=60' },
];

export default function EvoCodesAdmin() {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('evocodes_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [activeTab, setActiveTab] = useState('Projects');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notificationCount, setNotificationCount] = useState(3);
  const [mailCount, setMailCount] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const [newProject, setNewProject] = useState({
    name: '', version: 'v1.0.0', client: '', category: 'Web App', tech: '', status: 'In Progress'
  });

  useEffect(() => {
    localStorage.setItem('evocodes_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, globalSearch, categoryFilter, statusFilter]);

  const processedProjects = useMemo(() => {
    let result = [...projects];
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tech.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (globalSearch) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
        p.category.toLowerCase().includes(globalSearch.toLowerCase())
      );
    }
    if (categoryFilter !== 'All') result = result.filter(p => p.category === categoryFilter);
    if (statusFilter !== 'All') result = result.filter(p => p.status === statusFilter);
    if (sortOrder === 'Newest') result.reverse();
    if (sortOrder === 'Alphabetical') result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [projects, searchTerm, globalSearch, categoryFilter, statusFilter, sortOrder]);

  const totalPages = Math.ceil(processedProjects.length / itemsPerPage) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedProjects.slice(start, start + itemsPerPage);
  }, [processedProjects, currentPage]);

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProject.name || !newProject.client) return;

    const projectObj = {
      ...newProject,
      id: Date.now(),
      tech: newProject.tech.split(',').map(t => t.trim()).filter(Boolean),
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&auto=format&fit=crop&q=60'
    };

    setProjects([projectObj, ...projects]);
    setIsModalOpen(false);
    setNewProject({ name: '', version: 'v1.0.0', client: '', category: 'Web App', tech: '', status: 'In Progress' });
    alert("🚀 Project deployed live to production environment site.");
  };

  const handleDeleteProject = (id) => {
    if (confirm("Confirm removal of this project? Changes overwrite the public production database immediately.")) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Project,Client,Category,Status\n"] 
      + projects.map(p => `${p.id},"${p.name}","${p.client}","${p.category}","${p.status}"`).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `evocodes_live_dump_${Date.now()}.csv`;
    link.click();
  };

  const handleLogout = () => {
    if(confirm("Are you sure you want to end your administration session?")) {
      alert("Logged out securely.");
    }
  };

  return (
    <div className={`flex h-screen text-gray-300 font-sans antialiased overflow-hidden select-none transition-colors duration-200 ${
      isDarkMode ? 'bg-[#0b0f17]' : 'bg-gray-100 text-gray-800'
    }`}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
        onLogout={handleLogout} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />
      
      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex items-center">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className={`p-3 ml-4 mt-2 rounded-lg lg:hidden flex-shrink-0 border transition-all ${
              isDarkMode ? 'bg-[#0f1422] border-[#1e2640] text-gray-400 hover:text-white' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Menu size={20} />
          </button>
          
          <div className="flex-1">
            <Navbar 
              globalSearch={globalSearch} setGlobalSearch={setGlobalSearch}
              notificationCount={notificationCount} setNotificationCount={setNotificationCount}
              mailCount={mailCount} setMailCount={setMailCount}
              isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
            />
          </div>
        </div>

        {/* Dynamic Route Display */}
        {activeTab === 'Contact Requests' ? (
          <div className="p-4 md:p-8 max-w-7xl w-full mx-auto">
            <ContactRequestsTable isDarkMode={isDarkMode} />
          </div>
        ) : activeTab === 'Employees' ? (
          <div className="p-4 md:p-8 max-w-7xl w-full mx-auto">
            <TeamManagementTable isDarkMode={isDarkMode} />
          </div>
        ) : activeTab === 'Services' || activeTab === 'services' ? (
          <div className="p-4 md:p-8 max-w-7xl w-full mx-auto">
            <ServicesTable isDarkMode={isDarkMode} />
          </div>
        ) : activeTab === 'Clients' || activeTab === 'clients' ? (
          <ClientsPage isDarkMode={isDarkMode} />
        ) : activeTab === 'Blogs' || activeTab === 'blogs' ? (
          <div className="p-4 md:p-8 max-w-7xl w-full mx-auto">
            <BlogsPage isDarkMode={isDarkMode} />
          </div>
        ) : activeTab !== 'Projects' ? (
          <div className="p-4 md:p-8 text-center text-gray-500 text-sm">
            Section <strong>"{activeTab}"</strong> is currently streaming connected pipeline endpoints. Displaying grid mock placeholder layouts.
          </div>
        ) : (
          <div className="p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end justify-between">
              <div>
                <h3 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Projects</h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1">Manage and monitor all active development cycles and client deliverables.</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={handleExportCSV}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 border px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isDarkMode ? 'bg-[#151c30] border-[#222f54] text-gray-300 hover:bg-[#1d2744]' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Download size={14} /> <span className="hidden xs:inline">CSV Export</span><span className="inline xs:hidden">Export</span>
                </button>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#72efdd] hover:bg-[#52e3d0] text-[#0b0f17] px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-[#72efdd]/10 whitespace-nowrap"
                >
                  <Plus size={14} /> Add Project
                </button>
              </div>
            </div>

            <FilterPanel 
              searchTerm={searchTerm} setSearchTerm={setSearchTerm}
              categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
              statusFilter={statusFilter} setStatusFilter={setStatusFilter}
              sortOrder={sortOrder} setSortOrder={setSortOrder}
              isDarkMode={isDarkMode}
            />

            <div className="bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg flex items-start gap-2 text-xs">
              <Globe size={14} className="animate-pulse mt-0.5 flex-shrink-0" />
              <span><strong>Live Pipeline Context Active:</strong> Modifications affect the production UI template presentation modules simultaneously.</span>
            </div>

            <ProjectTable 
              paginatedProjects={paginatedProjects} processedProjects={processedProjects}
              currentPage={currentPage} setCurrentPage={setCurrentPage}
              totalPages={totalPages} onDeleteProject={handleDeleteProject}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
      </main>

      <ProjectModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        newProject={newProject} setNewProject={setNewProject}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}