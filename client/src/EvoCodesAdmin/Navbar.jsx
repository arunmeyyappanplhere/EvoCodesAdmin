import React from 'react';
import { Mail, LogIn, UserPlus, LogOut, User } from 'lucide-react';

export default function Navbar({ 
  globalSearch, setGlobalSearch, notificationCount, setNotificationCount, 
  mailCount, setMailCount, currentUser, onOpenAuth, onLogout 
}) {
  return (
    <header className="h-16 border-b px-4 md:px-8 flex items-center justify-between backdrop-blur transition-colors duration-200 bg-[#0f1422]/60 border-[#1e2640]">
      <div className="flex items-center gap-4 md:gap-6">
        <h2 className="text-[#4cc9f0] font-bold text-sm md:text-lg tracking-wide whitespace-nowrap">Evo Codes</h2>
      </div>

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
            <div className="w-8 h-8 rounded-full bg-[#4cc9f0] flex items-center justify-center border border-[#222f54] text-xs font-bold text-[#0b0f17]">
              {currentUser.username ? currentUser.username.substring(0, 2).toUpperCase() : 'EC'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-white block leading-none">{currentUser.username}</span>
              <span className="text-[10px] text-[#72efdd] font-mono leading-none">{currentUser.id}</span>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 text-gray-400 hover:text-red-400 transition-colors ml-1"
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
  );
}