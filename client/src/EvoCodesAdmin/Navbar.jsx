import React from 'react';
import { Search, Bell, Mail, Sun, Moon } from 'lucide-react';

export default function Navbar({ 
  globalSearch, setGlobalSearch, notificationCount, setNotificationCount, 
  mailCount, setMailCount, isDarkMode, setIsDarkMode 
}) {
  return (
    <header className={`h-16 border-b px-4 md:px-8 flex items-center justify-between backdrop-blur transition-colors duration-200 ${
      isDarkMode ? 'bg-[#0f1422]/60 border-[#1e2640]' : 'bg-white/80 border-gray-200'
    }`}>
      <div className="flex items-center gap-4 md:gap-6">
        <h2 className="text-[#4cc9f0] font-bold text-sm md:text-lg tracking-wide whitespace-nowrap">Evo Codes</h2>
        <nav className="hidden sm:flex gap-4 text-xs font-semibold uppercase tracking-wider">
          <span onClick={() => alert("Loading Global Overview Data...")} className="text-gray-500 cursor-pointer hover:text-gray-400">Overview</span>
          <span onClick={() => alert("Current Architecture: Operational 100% Status")} className="text-[#4cc9f0] border-b-2 border-[#4cc9f0] pb-1 cursor-pointer">System Status</span>
        </nav>
      </div>

      <div className="flex items-center gap-2 md:gap-4 max-w-xs sm:max-w-none flex-1 justify-end">
        <div className="relative w-full max-w-[140px] sm:max-w-[200px]">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
          <input 
            type="text" 
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search..." 
            className={`text-xs border rounded-full pl-9 pr-3 py-2 w-full focus:outline-none focus:border-[#4cc9f0] ${
              isDarkMode ? 'bg-[#151c30] border-[#222f54] text-white' : 'bg-gray-100 border-gray-300 text-gray-900'
            }`} 
          />
        </div>

        <button onClick={() => { alert("Clearing system alerts."); setNotificationCount(0); }} className="relative p-1.5 text-gray-400 hover:text-gray-200 flex-shrink-0">
          <Bell size={18} />
          {notificationCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">{notificationCount}</span>}
        </button>

        <button onClick={() => { alert("Opening Client Contact Matrix Inbox"); setMailCount(0); }} className="relative p-1.5 text-gray-400 hover:text-gray-200 flex-shrink-0">
          <Mail size={18} />
          {mailCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#00b4d8] text-[9px] font-bold text-white flex items-center justify-center">{mailCount}</span>}
        </button>

        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-1.5 text-gray-400 hover:text-gray-200 flex-shrink-0">
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="w-8 h-8 rounded-full bg-[#4cc9f0] flex items-center justify-center border text-xs font-bold text-[#0b0f17] flex-shrink-0 hidden xs:flex">EC</div>
      </div>
    </header>
  );
}