import React, { useState } from 'react';
import { Mail, LogIn, UserPlus, LogOut, ShieldAlert, Users, X } from 'lucide-react';
import AdminPage from './AdminPage';

export default function Navbar({ 
  globalSearch, setGlobalSearch, notificationCount, setNotificationCount, 
  mailCount, setMailCount, currentUser, onOpenAuth, onLogout, onUpdateProfile,
  dashboardStats, onNavigateToSection, registeredAdmins = [], onRegisterAdmin
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminPageOpen, setIsAdminPageOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b px-4 md:px-8 flex items-center justify-between backdrop-blur transition-colors duration-200 bg-[#0f1422]/60 border-[#1e2640]">
        
        {/* LEFT SECTION: Logo + PERMANENT Admins Button */}
        <div className="flex items-center gap-4 md:gap-6">
          <h2 className="text-[#4cc9f0] font-bold text-sm md:text-lg tracking-wide whitespace-nowrap">
            Evo Codes
          </h2>

          {/* PERMANENT ADMINS BUTTON (Always visible right next to logo) */}
          <button
            onClick={() => setIsAdminPageOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1e2640] bg-[#151c30] text-xs font-semibold text-[#4cc9f0] hover:bg-[#1d2744] hover:text-[#72efdd] transition-all shadow-sm"
          >
            <Users size={16} />
            <span>Admins</span>
          </button>
        </div>

        {/* RIGHT SECTION: Notifications & Auth Controls */}
        <div className="flex items-center gap-3 max-w-xs sm:max-w-none flex-1 justify-end">
          <button 
            onClick={() => { alert("Opening Client Contact Matrix Inbox"); setMailCount(0); }} 
            className="relative p-1.5 text-gray-400 hover:text-gray-200 flex-shrink-0"
          >
            <Mail size={18} />
            {mailCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#00b4d8] text-[9px] font-bold text-white flex items-center justify-center">
                {mailCount}
              </span>
            )}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 border-l border-[#1e2640] pl-3">
              <button
                onClick={() => setIsAdminOpen(true)}
                title="Admin Control Panel"
                className="p-1.5 text-gray-400 hover:text-[#72efdd] transition-colors"
              >
                <ShieldAlert size={17} />
              </button>

              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2 group text-left hover:opacity-90 transition-opacity"
                title="Edit Profile"
              >
                <div className="w-8 h-8 rounded-full bg-[#4cc9f0] flex items-center justify-center border border-[#222f54] text-xs font-bold text-[#0b0f17] overflow-hidden group-hover:border-[#72efdd] transition-colors">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : currentUser.username ? (
                    currentUser.username.substring(0, 2).toUpperCase()
                  ) : (
                    'EC'
                  )}
                </div>
                <div className="hidden sm:block">
                  <span className="text-xs font-bold text-white block leading-none group-hover:text-[#4cc9f0] transition-colors">
                    {currentUser.fullName || currentUser.username}
                  </span>
                  <span className="text-[10px] text-[#72efdd] font-mono leading-none">
                    @{currentUser.username || currentUser.id}
                  </span>
                </div>
              </button>

              <button
                onClick={onLogout}
                title="Logout"
                className="p-1.5 text-gray-400 hover:text-red-400 transition-colors ml-0.5"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('signin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e2640] bg-[#151c30] text-gray-300 hover:text-white text-xs font-semibold transition-all hover:bg-[#1d2744]"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#72efdd] hover:bg-[#52e3d0] text-[#0b0f17] text-xs font-bold transition-all shadow-md"
              >
                <UserPlus size={14} />
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </header>


   

      {/* ADMIN DETAILS MODAL */}
      {isAdminPageOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center p-4 sm:p-6">
          <div className="relative w-full max-w-6xl bg-[#0B0F17] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden my-auto">
            {/* Modal Close Button */}
            <div className="flex justify-end p-4 bg-[#0B0F17] border-b border-slate-800/80">
              <button
                onClick={() => setIsAdminPageOpen(false)}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Admin Directory Page Details */}
            <AdminPage 
              adminsData={registeredAdmins} 
              onRegisterAdmin={onRegisterAdmin}
            />
          </div>
        </div>
      )}
    </>
  );
}