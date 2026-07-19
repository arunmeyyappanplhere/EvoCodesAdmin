import React from 'react';
import { 
  LayoutDashboard, BarChart3, Briefcase, Settings, LogOut, Layers, Users, UserCheck, BookOpen, MessageSquare, X 
} from 'lucide-react';
import SidebarButton from './SidebarButton';

export default function Sidebar({ activeTab, setActiveTab, isDarkMode, onLogout, isSidebarOpen, setIsSidebarOpen }) {
  return (
    <>
      {/* Mobile Background Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-50 lg:static w-[260px] border-r flex flex-col justify-between p-6 transition-all duration-300 flex-shrink-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        ${isDarkMode ? 'bg-[#0f1422] border-[#1e2640]' : 'bg-white border-gray-200 text-gray-700'}
      `}>
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-xl font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Evo Codes</h1>
              <p className="text-xs text-[#00b4d8] uppercase font-semibold tracking-wider mt-0.5">Admin Console</p>
            </div>
            {/* Close button inside sidebar for mobile viewports */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className={`p-1 rounded-lg lg:hidden ${isDarkMode ? 'hover:bg-[#141b2d] text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1">
            <SidebarButton icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => { setActiveTab('Dashboard'); setIsSidebarOpen(false); }} isDark={isDarkMode} />
            <SidebarButton icon={<BarChart3 size={18} />} label="Analytics" active={activeTab === 'Analytics'} onClick={() => { setActiveTab('Analytics'); setIsSidebarOpen(false); }} isDark={isDarkMode} />
            <SidebarButton icon={<Briefcase size={18} />} label="Projects" active={activeTab === 'Projects'} onClick={() => { setActiveTab('Projects'); setIsSidebarOpen(false); }} isDark={isDarkMode} />
            <SidebarButton icon={<Layers size={18} />} label="Services" active={activeTab === 'Services'} onClick={() => { setActiveTab('Services'); setIsSidebarOpen(false); }} isDark={isDarkMode} />
            <SidebarButton icon={<Users size={18} />} label="Clients" active={activeTab === 'Clients'} onClick={() => { setActiveTab('Clients'); setIsSidebarOpen(false); }} isDark={isDarkMode} />
            <SidebarButton icon={<UserCheck size={18} />} label="Employees" active={activeTab === 'Employees'} onClick={() => { setActiveTab('Employees'); setIsSidebarOpen(false); }} isDark={isDarkMode} />
            <SidebarButton icon={<BookOpen size={18} />} label="Blogs" active={activeTab === 'Blogs'} onClick={() => { setActiveTab('Blogs'); setIsSidebarOpen(false); }} isDark={isDarkMode} />
            <SidebarButton icon={<MessageSquare size={18} />} label="Contact Requests" active={activeTab === 'Contact Requests'} onClick={() => { setActiveTab('Contact Requests'); setIsSidebarOpen(false); }} isDark={isDarkMode} />
            <SidebarButton icon={<Layers size={18} />} label="Client Testimonials" active={activeTab === 'Client Testimonials'} onClick={() => { setActiveTab('Client Testimonials'); setIsSidebarOpen(false); }} isDark={isDarkMode} />
          </nav>
        </div>

        <div className={`space-y-2 border-t pt-4 ${isDarkMode ? 'border-[#1e2640]' : 'border-gray-200'}`}>
          <SidebarButton icon={<Settings size={18} />} label="Settings" active={activeTab === 'Settings'} onClick={() => { setActiveTab('Settings'); setIsSidebarOpen(false); }} isDark={isDarkMode} />
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}