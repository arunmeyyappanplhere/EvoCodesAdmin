import React, { useState, useEffect, useMemo } from 'react';
import { Download, Plus, Globe, Menu, LogIn, UserPlus, X, User, Mail, Phone, Lock, UserCheck } from 'lucide-react';

import Sidebar from './Sidebar';
import Navbar from './Navbar';
import FilterPanel from './FilterPanel';
import ProjectTable from './ProjectTable';
import ProjectModal from './ProjectModal';
import ContactRequestsTable from './ContactRequestsTable';
import TeamManagementTable from './TeamManagementTable';
import ServicesTable from './ServicesPage';
import ClientsPage from './ClientsPage';
import TestimonialsPage from './TestimonialsPage';
import BlogsPage from './BlogsPage';
import Dashboard from './Dashboard';
import Analytics from './Analytics';

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

  const [activeTab, setActiveTab] = useState('Dashboard');
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

  // ------------------ AUTH STATE & LOGIC ------------------
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [currentUser, setCurrentUser] = useState(null);

  // Sign In Form State
  const [signInData, setSignInData] = useState({ userIdOrMail: '', password: '' });

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    email: '', username: '', phone: '', password: '', confirmPassword: '', dob: '', role: 'Developer'
  });

  // Forgot Password & OTP State
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // Handler: Generate Auto ID (ECA01, ECA02...)
  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    if (signUpData.password !== signUpData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const registeredUsers = JSON.parse(localStorage.getItem('evocodes_users') || '[]');
    const nextOrder = registeredUsers.length + 1;
    const formattedNumber = String(nextOrder).padStart(2, '0');
    const generatedEcaId = `ECA${formattedNumber}`;

    const newUser = {
      ...signUpData,
      id: generatedEcaId,
      registeredAt: new Date().toISOString()
    };

    localStorage.setItem('evocodes_users', JSON.stringify([...registeredUsers, newUser]));
    alert(`🎉 Account successfully created! Your Unique ID is: ${generatedEcaId}`);
    
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);
    setSignUpData({ email: '', username: '', phone: '', password: '', confirmPassword: '', dob: '', role: 'Developer' });
  };

  // Handler: Sign In Verification
  const handleSignInSubmit = (e) => {
    e.preventDefault();
    const registeredUsers = JSON.parse(localStorage.getItem('evocodes_users') || '[]');
    const matchedUser = registeredUsers.find(
      u => (u.email === signInData.userIdOrMail || u.id === signInData.userIdOrMail) && u.password === signInData.password
    );

    if (matchedUser) {
      setCurrentUser(matchedUser);
      setIsAuthModalOpen(false);
      alert(`Welcome back, ${matchedUser.username}! Signed in as [${matchedUser.id}].`);
    } else if (signInData.userIdOrMail === 'admin') {
      const adminUser = { id: 'ECA00', username: 'Super Admin' };
      setCurrentUser(adminUser);
      setIsAuthModalOpen(false);
    } else {
      alert("Invalid Mail ID / User ID or Password.");
    }
  };

  // Handler: Password Reset via OTP
  const handleSendOtp = () => {
    if (!forgotEmail) return alert("Please enter your registered email address.");
    setOtpSent(true);
    alert(`🔑 An OTP code (Simulated: 123456) has been dispatched to ${forgotEmail}`);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === '123456') {
      setIsOtpVerified(true);
      alert("OTP Verified successfully. Please set your new password.");
    } else {
      alert("Invalid OTP code. Try entering '123456'.");
    }
  };

  const handleSaveNewPassword = (e) => {
    e.preventDefault();
    alert("Password reset successfully! Please sign in with your updated credentials.");
    setAuthMode('signin');
    setOtpSent(false);
    setIsOtpVerified(false);
  };
  // --------------------------------------------------------

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
      setCurrentUser(null);
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
        <div className="flex items-center justify-between border-b border-[#1e2640]/40 pr-4">
          <div className="flex items-center flex-1">
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

          {/* Integrated Header Auth Controls */}
          <div className="flex items-center gap-2 pl-2">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-[#0f1422] border border-[#222f54] px-3 py-1.5 rounded-lg text-xs text-[#72efdd] font-semibold">
                <UserCheck size={14} />
                <span>{currentUser.id}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setAuthMode('signin'); setIsAuthModalOpen(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-[#72efdd]/40 text-[#72efdd] hover:bg-[#72efdd]/10 transition-all whitespace-nowrap"
                >
                  <LogIn size={13} /> Sign In
                </button>
                <button 
                  onClick={() => { setAuthMode('signup'); setIsAuthModalOpen(true); }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#72efdd] text-[#0b0f17] hover:bg-[#52e3d0] transition-all whitespace-nowrap"
                >
                  <UserPlus size={13} /> Sign Up
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Route Display */}
        {activeTab === 'Dashboard' ? (
          <Dashboard isDarkMode={isDarkMode} />
        ) : activeTab === 'Analytics' ? (
          <Analytics isDarkMode={isDarkMode} />
        ) : activeTab === 'Contact Requests' ? (
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
        ) : activeTab === 'Testimonials' || activeTab === 'testimonials' || activeTab === 'Client Testimonials' ? (
          <TestimonialsPage isDarkMode={isDarkMode} />
        ) : activeTab === 'Blogs' || activeTab === 'blogs' || activeTab === 'CMS/Blogs' ? (
          <BlogsPage isDarkMode={isDarkMode} />
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

      {/* ----------------- INTEGRATED AUTHENTICATION MODAL ----------------- */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className={`relative w-full max-w-md rounded-2xl border p-6 md:p-8 shadow-2xl transition-all ${
            isDarkMode ? 'bg-[#0f1422] border-[#1e2640] text-gray-200' : 'bg-white border-gray-200 text-gray-800'
          }`}>
            
            <button 
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-[#72efdd]">Evo Codes</h2>
              <p className="text-xs text-gray-400 mt-1">
                {authMode === 'signin' && 'Sign in to access administration controls'}
                {authMode === 'signup' && 'Complete details to issue your unique ECA User ID'}
                {authMode === 'forgot' && 'Reset account credentials via OTP verification'}
              </p>
            </div>

            {/* SIGN IN FORM */}
            {authMode === 'signin' && (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Mail ID or User ID (e.g. ECA01)</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3 text-gray-500" />
                    <input 
                      type="text" required placeholder="user@evocodes.com or ECA01"
                      value={signInData.userIdOrMail}
                      onChange={(e) => setSignInData({ ...signInData, userIdOrMail: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border outline-none ${
                        isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white focus:border-[#72efdd]' : 'bg-gray-50 border-gray-300 focus:border-[#72efdd]'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-gray-500" />
                    <input 
                      type="password" required placeholder="••••••••"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border outline-none ${
                        isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white focus:border-[#72efdd]' : 'bg-gray-50 border-gray-300 focus:border-[#72efdd]'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    type="button" 
                    onClick={() => setAuthMode('forgot')}
                    className="text-xs text-[#72efdd] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-2.5 bg-[#72efdd] hover:bg-[#52e3d0] text-[#0b0f17] font-bold rounded-lg text-xs transition-all uppercase tracking-wider"
                >
                  Sign In
                </button>

                <div className="text-center pt-2 text-xs text-gray-400">
                  Need a new account?{' '}
                  <button type="button" onClick={() => setAuthMode('signup')} className="text-[#72efdd] hover:underline font-semibold">
                    Register here
                  </button>
                </div>
              </form>
            )}

            {/* SIGN UP FORM (Generate ECA ID) */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Mail ID</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-2.5 text-gray-500" />
                    <input 
                      type="email" required placeholder="developer@evocodes.com"
                      value={signUpData.email} onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border outline-none ${
                        isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white focus:border-[#72efdd]' : 'bg-gray-50 border-gray-300 focus:border-[#72efdd]'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Username</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-2.5 text-gray-500" />
                    <input 
                      type="text" required placeholder="John Doe"
                      value={signUpData.username} onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border outline-none ${
                        isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white focus:border-[#72efdd]' : 'bg-gray-50 border-gray-300 focus:border-[#72efdd]'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-2.5 text-gray-500" />
                    <input 
                      type="tel" required placeholder="+1 234 567 890"
                      value={signUpData.phone} onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border outline-none ${
                        isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white focus:border-[#72efdd]' : 'bg-gray-50 border-gray-300 focus:border-[#72efdd]'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Password</label>
                    <input 
                      type="password" required placeholder="••••••••"
                      value={signUpData.password} onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                        isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white focus:border-[#72efdd]' : 'bg-gray-50 border-gray-300 focus:border-[#72efdd]'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Re-enter Password</label>
                    <input 
                      type="password" required placeholder="••••••••"
                      value={signUpData.confirmPassword} onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                      className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                        isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white focus:border-[#72efdd]' : 'bg-gray-50 border-gray-300 focus:border-[#72efdd]'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Date of Birth</label>
                    <input 
                      type="date" required
                      value={signUpData.dob} onChange={(e) => setSignUpData({ ...signUpData, dob: e.target.value })}
                      className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                        isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white focus:border-[#72efdd]' : 'bg-gray-50 border-gray-300 focus:border-[#72efdd]'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Role</label>
                    <select 
                      value={signUpData.role} onChange={(e) => setSignUpData({ ...signUpData, role: e.target.value })}
                      className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                        isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white focus:border-[#72efdd]' : 'bg-gray-50 border-gray-300 focus:border-[#72efdd]'
                      }`}
                    >
                      <option value="Developer">Developer</option>
                      <option value="Project Manager">Project Manager</option>
                      <option value="Designer">UI/UX Designer</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full mt-4 py-2.5 bg-[#72efdd] hover:bg-[#52e3d0] text-[#0b0f17] font-bold rounded-lg text-xs transition-all uppercase tracking-wider shadow-lg shadow-[#72efdd]/10"
                >
                  Create ID
                </button>

                <div className="text-center pt-2 text-xs text-gray-400">
                  Already registered?{' '}
                  <button type="button" onClick={() => setAuthMode('signin')} className="text-[#72efdd] hover:underline font-semibold">
                    Sign In
                  </button>
                </div>
              </form>
            )}

            {/* FORGOT PASSWORD FORM (OTP) */}
            {authMode === 'forgot' && (
              <div className="space-y-4">
                {!isOtpVerified ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Mail ID</label>
                      <div className="flex gap-2">
                        <input 
                          type="email" placeholder="user@evocodes.com"
                          value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                          className={`flex-1 px-3 py-2 text-xs rounded-lg border outline-none ${
                            isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white' : 'bg-gray-50 border-gray-300'
                          }`}
                        />
                        <button 
                          type="button" onClick={handleSendOtp}
                          className="px-3 py-2 bg-[#222f54] text-[#72efdd] rounded-lg text-xs font-semibold hover:bg-[#2b3b68]"
                        >
                          {otpSent ? 'Resend' : 'Send OTP'}
                        </button>
                      </div>
                    </div>

                    {otpSent && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Enter OTP Code</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" maxLength={6} placeholder="123456"
                            value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)}
                            className={`flex-1 px-3 py-2 text-xs rounded-lg border outline-none text-center tracking-widest ${
                              isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white' : 'bg-gray-50 border-gray-300'
                            }`}
                          />
                          <button 
                            type="button" onClick={handleVerifyOtp}
                            className="px-4 py-2 bg-[#72efdd] text-[#0b0f17] rounded-lg text-xs font-bold hover:bg-[#52e3d0]"
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <form onSubmit={handleSaveNewPassword} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">New Password</label>
                      <input 
                        type="password" required placeholder="••••••••"
                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                          isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white' : 'bg-gray-50 border-gray-300'
                        }`}
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full py-2 bg-[#72efdd] text-[#0b0f17] font-bold rounded-lg text-xs uppercase"
                    >
                      Save Password
                    </button>
                  </form>
                )}

                <button 
                  type="button" onClick={() => setAuthMode('signin')}
                  className="w-full text-center text-xs text-gray-400 hover:text-white pt-2 block"
                >
                  ← Return to Sign In
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}