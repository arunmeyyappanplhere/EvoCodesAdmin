import React, { useState, useEffect, useMemo } from 'react';
import { Download, Plus, Globe, Menu, LogIn, UserPlus, X, User, Mail, Phone, Lock, Calendar, Building, CheckCircle } from 'lucide-react';

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
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('evocodes_current_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Generated ID popup state
  const [createdUserPopup, setCreatedUserPopup] = useState(null);

  // Sign In Form State
  const [signInData, setSignInData] = useState({ userIdOrMail: '', password: '' });

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    email: '', username: '', phone: '', password: '', confirmPassword: '', dob: '', companyCode: ''
  });

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // Handle Sign Up & ID Generation (ECA01, ECA02...)
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

    const updatedUsers = [...registeredUsers, newUser];
    localStorage.setItem('evocodes_users', JSON.stringify(updatedUsers));

    // Show persistent custom popup modal with generated ID
    setCreatedUserPopup(newUser);
    setIsAuthModalOpen(false);
    setSignUpData({ email: '', username: '', phone: '', password: '', confirmPassword: '', dob: '', companyCode: '' });
  };

  // Handle Sign In Verification
  const handleSignInSubmit = (e) => {
    e.preventDefault();
    const registeredUsers = JSON.parse(localStorage.getItem('evocodes_users') || '[]');
    const matchedUser = registeredUsers.find(
      u => (u.email.toLowerCase() === signInData.userIdOrMail.toLowerCase() || u.id.toLowerCase() === signInData.userIdOrMail.toLowerCase()) && u.password === signInData.password
    );

    if (matchedUser) {
      setCurrentUser(matchedUser);
      localStorage.setItem('evocodes_current_user', JSON.stringify(matchedUser));
      setIsAuthModalOpen(false);
      setSignInData({ userIdOrMail: '', password: '' });
    } else if (signInData.userIdOrMail === 'admin' && signInData.password === 'admin') {
      const adminUser = { id: 'ECA00', username: 'Super Admin', email: 'admin@evocodes.com' };
      setCurrentUser(adminUser);
      localStorage.setItem('evocodes_current_user', JSON.stringify(adminUser));
      setIsAuthModalOpen(false);
    } else {
      alert("Invalid Mail ID / User ID or Password.");
    }
  };

  // Password Reset Handlers
  const handleSendOtp = () => {
    if (!forgotEmail) return alert("Please enter your registered email address.");
    setOtpSent(true);
    alert(`🔑 Reset code (Simulated: 123456) dispatched to ${forgotEmail}`);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === '123456') {
      setIsOtpVerified(true);
    } else {
      alert("Invalid verification code. Use '123456'.");
    }
  };

  const handleSaveNewPassword = (e) => {
    e.preventDefault();
    const registeredUsers = JSON.parse(localStorage.getItem('evocodes_users') || '[]');
    const userIndex = registeredUsers.findIndex(u => u.email.toLowerCase() === forgotEmail.toLowerCase());

    if (userIndex !== -1) {
      registeredUsers[userIndex].password = newPassword;
      localStorage.setItem('evocodes_users', JSON.stringify(registeredUsers));
      alert("Password reset successfully! Please sign in with your new password.");
    } else {
      alert("Password updated for system user.");
    }

    setAuthMode('signin');
    setOtpSent(false);
    setIsOtpVerified(false);
    setForgotEmail('');
    setEnteredOtp('');
    setNewPassword('');
  };

  const handleLogout = () => {
    if (confirm("Confirm logging out of your session?")) {
      setCurrentUser(null);
      localStorage.removeItem('evocodes_current_user');
    }
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
  };

  const handleDeleteProject = (id) => {
    if (confirm("Confirm removal of this project?")) {
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
                currentUser={currentUser}
                onOpenAuth={(mode) => { setAuthMode(mode); setIsAuthModalOpen(true); }}
                onLogout={handleLogout}
              />
            </div>
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
            Section <strong>"{activeTab}"</strong> is currently streaming connected pipeline endpoints.
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

      {/* Project Modal */}
      <ProjectModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        newProject={newProject} setNewProject={setNewProject}
        onSubmit={handleCreateProject}
      />

      {/* ------------------ AUTH MODAL ------------------ */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0f1422] border border-[#1e2640] rounded-xl w-full max-w-md p-6 shadow-2xl relative text-gray-200">
            <button 
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>

            {/* Mode Switcher Header */}
            <div className="flex border-b border-[#1e2640] mb-6">
              <button
                onClick={() => setAuthMode('signin')}
                className={`pb-2 px-4 text-sm font-semibold transition-all border-b-2 ${
                  authMode === 'signin' ? 'border-[#4cc9f0] text-[#4cc9f0]' : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className={`pb-2 px-4 text-sm font-semibold transition-all border-b-2 ${
                  authMode === 'signup' ? 'border-[#4cc9f0] text-[#4cc9f0]' : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* SIGN IN FORM */}
            {authMode === 'signin' && (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Welcome Back</h3>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Mail ID or Generated ID (e.g. ECA01)</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3 text-gray-500" />
                    <input
                      type="text"
                      required
                      placeholder="ECA01 or email@domain.com"
                      value={signInData.userIdOrMail}
                      onChange={(e) => setSignInData({ ...signInData, userIdOrMail: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-[#0b0f17] border border-[#1e2640] rounded-lg text-xs text-white focus:outline-none focus:border-[#4cc9f0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-gray-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-[#0b0f17] border border-[#1e2640] rounded-lg text-xs text-white focus:outline-none focus:border-[#4cc9f0]"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="text-xs text-[#4cc9f0] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#4cc9f0] hover:bg-[#3ab0d8] text-[#0b0f17] font-bold py-2 rounded-lg text-xs transition-all shadow-md mt-2"
                >
                  Sign In
                </button>
              </form>
            )}

            {/* SIGN UP FORM */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
                <h3 className="text-lg font-bold text-white mb-1">Create Account</h3>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Mail ID</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-2.5 text-gray-500" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-1.5 bg-[#0b0f17] border border-[#1e2640] rounded-lg text-xs text-white focus:outline-none focus:border-[#4cc9f0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Username</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-2.5 text-gray-500" />
                    <input
                      type="text"
                      required
                      placeholder="john_doe"
                      value={signUpData.username}
                      onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                      className="w-full pl-9 pr-3 py-1.5 bg-[#0b0f17] border border-[#1e2640] rounded-lg text-xs text-white focus:outline-none focus:border-[#4cc9f0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-2.5 text-gray-500" />
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={signUpData.phone}
                      onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-1.5 bg-[#0b0f17] border border-[#1e2640] rounded-lg text-xs text-white focus:outline-none focus:border-[#4cc9f0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Company Code</label>
                  <div className="relative">
                    <Building size={15} className="absolute left-3 top-2.5 text-gray-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. EVOC-2026"
                      value={signUpData.companyCode}
                      onChange={(e) => setSignUpData({ ...signUpData, companyCode: e.target.value })}
                      className="w-full pl-9 pr-3 py-1.5 bg-[#0b0f17] border border-[#1e2640] rounded-lg text-xs text-white focus:outline-none focus:border-[#4cc9f0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Date of Birth</label>
                  <div className="relative">
                    <Calendar size={15} className="absolute left-3 top-2.5 text-gray-500" />
                    <input
                      type="date"
                      required
                      value={signUpData.dob}
                      onChange={(e) => setSignUpData({ ...signUpData, dob: e.target.value })}
                      className="w-full pl-9 pr-3 py-1.5 bg-[#0b0f17] border border-[#1e2640] rounded-lg text-xs text-white focus:outline-none focus:border-[#4cc9f0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-2.5 text-gray-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      className="w-full pl-9 pr-3 py-1.5 bg-[#0b0f17] border border-[#1e2640] rounded-lg text-xs text-white focus:outline-none focus:border-[#4cc9f0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Re-enter Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-2.5 text-gray-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                      className="w-full pl-9 pr-3 py-1.5 bg-[#0b0f17] border border-[#1e2640] rounded-lg text-xs text-white focus:outline-none focus:border-[#4cc9f0]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#72efdd] hover:bg-[#52e3d0] text-[#0b0f17] font-bold py-2 rounded-lg text-xs transition-all shadow-md mt-3"
                >
                  Create ID
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {authMode === 'forgot' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Reset Password</h3>

                {!isOtpVerified ? (
                  <>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Registered Mail ID</label>
                      <input
                        type="email"
                        placeholder="email@company.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0b0f17] border border-[#1e2640] rounded-lg text-xs text-white focus:outline-none focus:border-[#4cc9f0]"
                      />
                    </div>

                    {!otpSent ? (
                      <button
                        onClick={handleSendOtp}
                        className="w-full bg-[#4cc9f0] text-[#0b0f17] font-bold py-2 rounded-lg text-xs transition-all"
                      >
                        Send Verification Code
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Enter Code (Use 123456)</label>
                          <input
                            type="text"
                            placeholder="123456"
                            value={enteredOtp}
                            onChange={(e) => setEnteredOtp(e.target.value)}
                            className="w-full px-3 py-2 bg-[#0b0f17] border border-[#1e2640] rounded-lg text-xs text-white focus:outline-none focus:border-[#4cc9f0]"
                          />
                        </div>
                        <button
                          onClick={handleVerifyOtp}
                          className="w-full bg-[#72efdd] text-[#0b0f17] font-bold py-2 rounded-lg text-xs transition-all"
                        >
                          Verify Code
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <form onSubmit={handleSaveNewPassword} className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0b0f17] border border-[#1e2640] rounded-lg text-xs text-white focus:outline-none focus:border-[#4cc9f0]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#4cc9f0] text-[#0b0f17] font-bold py-2 rounded-lg text-xs transition-all"
                    >
                      Update Password
                    </button>
                  </form>
                )}

                <div className="text-center">
                  <button
                    onClick={() => setAuthMode('signin')}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------ GENERATED ID POPUP MODAL ------------------ */}
      {createdUserPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0f1422] border-2 border-[#72efdd] rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl relative animate-in fade-in zoom-in">
            <div className="w-14 h-14 bg-[#72efdd]/20 border border-[#72efdd] rounded-full flex items-center justify-center mx-auto mb-4 text-[#72efdd]">
              <CheckCircle size={32} />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">Account Created!</h3>
            <p className="text-xs text-gray-400 mb-4">Your profile registration is verified.</p>

            <div className="bg-[#0b0f17] border border-[#1e2640] p-4 rounded-xl mb-5 space-y-2">
              <span className="text-xs text-gray-400 block uppercase tracking-wider">Your Assigned Unique ID</span>
              <span className="text-3xl font-extrabold text-[#72efdd] tracking-widest block font-mono">
                {createdUserPopup.id}
              </span>
              <span className="text-[11px] text-gray-500 block">Company Code: {createdUserPopup.companyCode}</span>
            </div>

            <p className="text-xs text-gray-400 mb-5">
              Please save this ID. You can sign in using your Mail ID or this Unique ID.
            </p>

            <button
              onClick={() => {
                setSignInData({ userIdOrMail: createdUserPopup.id, password: '' });
                setCreatedUserPopup(null);
                setAuthMode('signin');
                setIsAuthModalOpen(true);
              }}
              className="w-full bg-[#72efdd] hover:bg-[#52e3d0] text-[#0b0f17] font-bold py-2.5 rounded-lg text-xs transition-all shadow-lg"
            >
              Proceed to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}