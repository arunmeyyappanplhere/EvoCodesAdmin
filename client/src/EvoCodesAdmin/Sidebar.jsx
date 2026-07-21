import React from 'react';
import { 
  LayoutDashboard, BarChart3, Briefcase, Settings, LogOut, Layers, Users, UserCheck, BookOpen, MessageSquare, X 
} from 'lucide-react';
import SidebarButton from './SidebarButton';

// Replace this path with your actual image path or asset import
import evoLogo from './../../public/EC-ICON.jpg'; 

export default function Sidebar({ activeTab, setActiveTab, onLogout, isSidebarOpen, setIsSidebarOpen }) {
  return (
    <>
      {/* Mobile Background Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-50 lg:static w-[260px] border-r flex flex-col justify-between p-6 transition-all duration-300 flex-shrink-0 bg-[#0f1422] border-[#1e2640]
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div>
          {/* Header & Logo Container */}
          <div className="flex items-center justify-between mb-8">
            {/* px-3 aligns the icon perfectly with the navigation button icons below */}
            <div className="flex items-center gap-3 px-3">
              <img 
                src={evoLogo} 
                alt="Evo Codes Logo" 
                className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-[#1e2640]" 
              />
              <div>
                <h1 className="text-xl font-bold tracking-wide text-white leading-tight">Evo Codes</h1>
                <p className="text-xs text-[#00b4d8] uppercase font-semibold tracking-wider mt-0.5">Admin Console</p>
              </div>
            </div>

            {/* Close button inside sidebar for mobile viewports */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-lg lg:hidden hover:bg-[#141b2d] text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1">
            <SidebarButton icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => { setActiveTab('Dashboard'); setIsSidebarOpen(false); }} isDark={true} />
            <SidebarButton icon={<BarChart3 size={18} />} label="Analytics" active={activeTab === 'Analytics'} onClick={() => { setActiveTab('Analytics'); setIsSidebarOpen(false); }} isDark={true} />
            <SidebarButton icon={<Briefcase size={18} />} label="Projects" active={activeTab === 'Projects'} onClick={() => { setActiveTab('Projects'); setIsSidebarOpen(false); }} isDark={true} />
            <SidebarButton icon={<Layers size={18} />} label="Services" active={activeTab === 'Services'} onClick={() => { setActiveTab('Services'); setIsSidebarOpen(false); }} isDark={true} />
            <SidebarButton icon={<Users size={18} />} label="Clients" active={activeTab === 'Clients'} onClick={() => { setActiveTab('Clients'); setIsSidebarOpen(false); }} isDark={true} />
            <SidebarButton icon={<UserCheck size={18} />} label="Employees" active={activeTab === 'Employees'} onClick={() => { setActiveTab('Employees'); setIsSidebarOpen(false); }} isDark={true} />
            <SidebarButton icon={<BookOpen size={18} />} label="Blogs" active={activeTab === 'Blogs'} onClick={() => { setActiveTab('Blogs'); setIsSidebarOpen(false); }} isDark={true} />
            <SidebarButton icon={<MessageSquare size={18} />} label="Contact Requests" active={activeTab === 'Contact Requests'} onClick={() => { setActiveTab('Contact Requests'); setIsSidebarOpen(false); }} isDark={true} />
            <SidebarButton icon={<Layers size={18} />} label="Client Testimonials" active={activeTab === 'Client Testimonials'} onClick={() => { setActiveTab('Client Testimonials'); setIsSidebarOpen(false); }} isDark={true} />
          </nav>
        </div>

        <div className="space-y-2 border-t pt-4 border-[#1e2640]">
          <SidebarButton icon={<Settings size={18} />} label="Settings" active={activeTab === 'Settings'} onClick={() => { setActiveTab('Settings'); setIsSidebarOpen(false); }} isDark={true} />
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