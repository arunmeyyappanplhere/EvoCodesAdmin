import React from 'react';
import { Search, Bell, Mail } from 'lucide-react';

export default function Navbar({ 
  globalSearch, setGlobalSearch, notificationCount, setNotificationCount, 
  mailCount, setMailCount 
}) {
  return (
    <header className="h-16 border-b px-4 md:px-8 flex items-center justify-between backdrop-blur transition-colors duration-200 bg-[#0f1422]/60 border-[#1e2640]">
      <div className="flex items-center gap-4 md:gap-6">
        <h2 className="text-[#4cc9f0] font-bold text-sm md:text-lg tracking-wide whitespace-nowrap">Evo Codes</h2>
        <nav className="hidden sm:flex gap-4 text-xs font-semibold uppercase tracking-wider">
          </nav>
      </div>

      <div className="flex items-center gap-2 md:gap-4 max-w-xs sm:max-w-none flex-1 justify-end">
      
    
        <button onClick={() => { alert("Opening Client Contact Matrix Inbox"); setMailCount(0); }} className="relative p-1.5 text-gray-400 hover:text-gray-200 flex-shrink-0">
          <Mail size={18} />
          {mailCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#00b4d8] text-[9px] font-bold text-white flex items-center justify-center">{mailCount}</span>}
        </button>

        <div className="w-8 h-8 rounded-full bg-[#4cc9f0] flex items-center justify-center border border-[#222f54] text-xs font-bold text-[#0b0f17] flex-shrink-0 hidden xs:flex">EC</div>
      </div>
    </header>
  );
}