import React, { useState, useEffect, useMemo } from 'react';
import { Download, Plus, Globe, Menu, LogIn, UserPlus, X, User, Mail, Phone, Lock, Calendar, Building, CheckCircle } from 'lucide-react';
import axiosInstance from './api/axiosInstance';
import { useAuth } from './AuthContext';

import Sidebar from './Sidebar';
import Navbar from './Navbar';
import FilterPanel from './FilterPanel';
import ProjectTable from './ProjectTable';
import ProjectsPage from './ProjectModal';
import ContactRequestsTable from './ContactRequestsTable';
import TeamManagementTable from './TeamManagementTable';
import ServicesTable from './ServicesPage';
import ClientsPage from './ClientsPage';
import TestimonialsPage from './TestimonialsPage';
import BlogsPage from './BlogsPage';
import Dashboard from './Dashboard';
import Analytics from './Analytics';
import AlertModal from './AlertModal';

export default function EvoCodesAdmin() {
  // Projects state removed - now handled by ProjectsPage component

  const { currentUser, isAuthenticated, isAuthLoading, login, logout } = useAuth();

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
  const [currentPage, setCurrentPage] = useState(1);

  // ------------------ AUTH STATE & LOGIC ------------------
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup' | 'forgot'

  // Generated ID popup state
  const [createdUserPopup, setCreatedUserPopup] = useState(null);

  // Alert Modal state
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: 'OK',
    showCancel: false
  });

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

  // Handle Sign Up — calls the backend, which generates the ECA ID and
  // sets an httpOnly session cookie in its response.
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (signUpData.password !== signUpData.confirmPassword) {
      setAlertConfig({
        isOpen: true,
        title: 'Password Mismatch',
        message: 'Passwords do not match!',
        type: 'error',
        confirmText: 'OK'
      });
      return;
    }

    try {
      const res = await axiosInstance.post("/register", {
        email: signUpData.email,
        username: signUpData.username,
        phoneNumber: signUpData.phone,
        password: signUpData.password,
        reEnterPassword: signUpData.confirmPassword,
        dateOfBirth: signUpData.dob,
        companyCode: signUpData.companyCode,
        role: "Developer", // no role field in this form yet — defaulting for now
      });

      const data = res.data;

      // Show persistent custom popup modal with the backend-generated ECA ID
      setCreatedUserPopup(data.admin);
      login(data.admin); // already logged in — the cookie was set by /register
      setIsAuthModalOpen(false);
      setSignUpData({ email: '', username: '', phone: '', password: '', confirmPassword: '', dob: '', companyCode: '' });
    } catch (err) {
      console.error("Register error:", err);
      const message = err.response?.data?.message || "Couldn't reach the server. Please check your connection and try again.";
      setAlertConfig({
        isOpen: true,
        title: 'Registration Error',
        message: message,
        type: 'error',
        confirmText: 'OK'
      });
    }
  };

  // Handle Sign In — backend verifies credentials and sets the httpOnly cookie
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/login", {
        identifier: signInData.userIdOrMail,
        password: signInData.password,
      });

      const data = res.data;

      login(data.admin);
      setIsAuthModalOpen(false);
      setSignInData({ userIdOrMail: '', password: '' });
    } catch (err) {
      console.error("Login error:", err);
      const message = err.response?.data?.message || "Couldn't reach the server. Please check your connection and try again.";
      setAlertConfig({
        isOpen: true,
        title: 'Login Error',
        message: message,
        type: 'error',
        confirmText: 'OK'
      });
    }
  };

  // Password Reset Handlers
  const handleSendOtp = () => {
    if (!forgotEmail) {
      setAlertConfig({
        isOpen: true,
        title: 'Email Required',
        message: 'Please enter your registered email address.',
        type: 'warning',
        confirmText: 'OK'
      });
      return;
    }
    setOtpSent(true);
    setAlertConfig({
      isOpen: true,
      title: 'Verification Code Sent',
      message: `🔑 Reset code (Simulated: 123456) dispatched to ${forgotEmail}`,
      type: 'success',
      confirmText: 'OK'
    });
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === '123456') {
      setIsOtpVerified(true);
      setAlertConfig({
        isOpen: true,
        title: 'Success',
        message: 'Verification code accepted!',
        type: 'success',
        confirmText: 'OK'
      });
    } else {
      setAlertConfig({
        isOpen: true,
        title: 'Invalid Code',
        message: "Invalid verification code. Use '123456'.",
        type: 'error',
        confirmText: 'OK'
      });
    }
  };

  const handleSaveNewPassword = (e) => {
    e.preventDefault();
    const registeredUsers = JSON.parse(localStorage.getItem('evocodes_users') || '[]');
    const userIndex = registeredUsers.findIndex(u => u.email.toLowerCase() === forgotEmail.toLowerCase());

    if (userIndex !== -1) {
      registeredUsers[userIndex].password = newPassword;
      localStorage.setItem('evocodes_users', JSON.stringify(registeredUsers));
      setAlertConfig({
        isOpen: true,
        title: 'Password Reset',
        message: 'Password reset successfully! Please sign in with your new password.',
        type: 'success',
        confirmText: 'OK'
      });
    } else {
      setAlertConfig({
        isOpen: true,
        title: 'Password Updated',
        message: 'Password updated for system user.',
        type: 'info',
        confirmText: 'OK'
      });
    }

    setAuthMode('signin');
    setOtpSent(false);
    setIsOtpVerified(false);
    setForgotEmail('');
    setEnteredOtp('');
    setNewPassword('');
  };

  const handleLogout = async () => {
    setAlertConfig({
      isOpen: true,
      title: 'Confirm Logout',
      message: 'Confirm logging out of your session?',
      type: 'warning',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: async () => {
        await logout();
      }
    });
  };

  // Auto-open auth modal if not authenticated (after loading completes)
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      setIsAuthModalOpen(true);
    }
  }, [isAuthLoading, isAuthenticated]);

  // Update page title dynamically based on active tab
  useEffect(() => {
    const pageTitles = {
      'Dashboard': 'Dashboard - EvoCodes Admin',
      'Analytics': 'Analytics - EvoCodes Admin',
      'Contact Requests': 'Contact Requests - EvoCodes Admin',
      'Employees': 'Employees - EvoCodes Admin',
      'Services': 'Services - EvoCodes Admin',
      'Clients': 'Clients - EvoCodes Admin',
      'Testimonials': 'Testimonials - EvoCodes Admin',
      'Blogs': 'Blogs - EvoCodes Admin',
      'Projects': 'Projects - EvoCodes Admin',
    };
    document.title = pageTitles[activeTab] || 'EvoCodes Admin';
  }, [activeTab]);

  // --------------------------------------------------------

  // Show loading state while checking authentication
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0b0f17]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4cc9f0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show only the auth modal (no sidebar/navbar)
  if (!isAuthenticated) {
    return (
      <div className={`flex items-center justify-center min-h-screen w-full text-gray-300 font-sans antialiased overflow-hidden select-none transition-colors duration-200 ${
        isDarkMode ? 'bg-[#0b0f17]' : 'bg-gray-100 text-gray-800'
      }`}>
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#4cc9f0]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#72efdd]/10 rounded-full blur-3xl"></div>
        </div>

        {/* Auth Modal */}
        {isAuthModalOpen && (
          <div className="relative z-10 w-full max-w-md p-4">
            <div className="bg-[#0f1422] border border-[#1e2640] rounded-xl w-full p-6 shadow-2xl relative text-gray-200">
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

        {/* Generated ID Popup */}
        {createdUserPopup && (
          <div className="relative z-20 flex items-center justify-center min-h-screen p-4">
            <div className="bg-[#0f1422] border-2 border-[#72efdd] rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl relative animate-in fade-in zoom-in">
              <div className="w-14 h-14 bg-[#72efdd]/20 border border-[#72efdd] rounded-full flex items-center justify-center mx-auto mb-4 text-[#72efdd]">
                <CheckCircle size={32} />
              </div>

              <h3 className="text-xl font-bold text-white mb-1">Account Created!</h3>
              <p className="text-xs text-gray-400 mb-4">Your profile registration is verified.</p>

              <div className="bg-[#0b0f17] border border-[#1e2640] p-4 rounded-xl mb-5 space-y-2">
                <span className="text-xs text-gray-400 block uppercase tracking-wider">Your Assigned Unique ID</span>
                <span className="text-3xl font-extrabold text-[#72efdd] tracking-widest block font-mono">
                  {createdUserPopup.userID}
                </span>
                <span className="text-[11px] text-gray-500 block">Company Code: {createdUserPopup.companyCode}</span>
              </div>

              <p className="text-xs text-gray-400 mb-5">
                Please save this ID. You can sign in using your Mail ID or this Unique ID.
              </p>

              <button
                onClick={() => {
                  setSignInData({ userIdOrMail: createdUserPopup.userID, password: '' });
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
          <div className="p-4 md:p-8 max-w-7xl w-full mx-auto">
            <ClientsPage isDarkMode={isDarkMode} />
          </div>
        ) : activeTab === 'Testimonials' || activeTab === 'testimonials' || activeTab === 'Client Testimonials' ? (
          <div className="p-4 md:p-8 max-w-7xl w-full mx-auto">
            <TestimonialsPage isDarkMode={isDarkMode} />
          </div>
        ) : activeTab === 'Blogs' || activeTab === 'blogs' || activeTab === 'CMS/Blogs' ? (
          <div className="p-4 md:p-8 max-w-7xl w-full mx-auto">
            <BlogsPage isDarkMode={isDarkMode} />
          </div>
        ) : activeTab === 'Projects' ? (
          <div className="p-4 md:p-8 max-w-7xl w-full mx-auto">
            <ProjectsPage isDarkMode={isDarkMode} />
          </div>
        ) : (
          <div className="p-4 md:p-8 text-center text-gray-500 text-sm">
            Section <strong>"{activeTab}"</strong> is currently streaming connected pipeline endpoints.
          </div>
        )}
      </main>

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

      {/* Project Modal - Now handled by ProjectsPage component */}

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
                {createdUserPopup.userID}
              </span>
              <span className="text-[11px] text-gray-500 block">Company Code: {createdUserPopup.companyCode}</span>
            </div>

            <p className="text-xs text-gray-400 mb-5">
              Please save this ID. You can sign in using your Mail ID or this Unique ID.
            </p>

            <button
              onClick={() => {
                setSignInData({ userIdOrMail: createdUserPopup.userID, password: '' });
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
