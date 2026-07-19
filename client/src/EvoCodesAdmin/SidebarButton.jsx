import React from 'react';

export default function SidebarButton({ icon, label, active, onClick, isDark }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active 
          ? isDark 
            ? 'bg-[#152238] text-[#4cc9f0] border-l-2 border-[#4cc9f0] pl-2.5'
            : 'bg-blue-50 text-blue-600 border-l-2 border-blue-600 pl-2.5'
          : isDark 
            ? 'text-gray-400 hover:bg-[#141b2d] hover:text-gray-200' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      {/* Label hides on extra small mobile to save space if needed, or flows gracefully */}
      <span className="truncate">{label}</span>
    </button>
  );
}