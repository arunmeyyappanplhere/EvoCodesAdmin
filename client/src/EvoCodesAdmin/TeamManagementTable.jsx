import React, { useState } from 'react';
import { Search, UserPlus, SlidersHorizontal, Download, ChevronLeft, ChevronRight, MoreVertical, Terminal, Palette, Megaphone, Briefcase } from 'lucide-react';

const INITIAL_EMPLOYEES = [
  { id: 1, name: 'Alex Thorne', position: 'Principal Engineer', department: 'Engineering', email: 'a.thorne@evocodes.ai', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=60' },
  { id: 2, name: 'Elena Vance', position: 'Design Lead', department: 'Design', email: 'e.vance@evocodes.ai', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=60' },
  { id: 3, name: 'Marcus Chen', position: 'Ops Director', department: 'Operations', email: 'm.chen@evocodes.ai', status: 'ON LEAVE', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=60' },
  { id: 4, name: 'Sarah Jenkins', position: 'Cloud Architect', department: 'Engineering', email: 's.jenkins@evocodes.ai', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=60' },
];

const DEPARTMENTS = ['All Departments', 'Engineering', 'Design', 'Marketing', 'Operations'];

export default function TeamManagementTable({ isDarkMode }) {
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');

  // Filtering Logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All Departments' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-8">
      {/* Top Heading Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Team Management</h3>
          <p className="text-xs text-gray-500 mt-1">Manage organization members, roles, and status across departments.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-[#72efdd] hover:bg-[#52e3d0] text-[#0b0f17] px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap">
          <UserPlus size={14} /> Add Employee
        </button>
      </div>

      {/* Filter and Search Actions Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3 text-xs">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border w-full sm:flex-1 ${
          isDarkMode ? 'bg-[#0f1422] border-[#1e2640]' : 'bg-white border-gray-200'
        }`}>
          <Search size={14} className="text-gray-500 flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Search by name, position or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none p-0 w-full focus:ring-0 placeholder-gray-600 text-gray-300"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className={`px-3 py-2 rounded-lg border font-medium focus:ring-0 cursor-pointer ${
              isDarkMode ? 'bg-[#0f1422] border-[#1e2640] text-gray-300' : 'bg-white border-gray-200 text-gray-700'
            }`}
          >
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <button className={`p-2 rounded-lg border transition-all ${
            isDarkMode ? 'bg-[#0f1422] border-[#1e2640] text-gray-400 hover:text-white' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}>
            <SlidersHorizontal size={14} />
          </button>

          <button className={`p-2 rounded-lg border transition-all ${
            isDarkMode ? 'bg-[#0f1422] border-[#1e2640] text-gray-400 hover:text-white' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}>
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Grid Data Container */}
      <div className={`rounded-xl border overflow-hidden transition-colors w-full ${
        isDarkMode ? 'bg-[#0f1422] border-[#1e2640]' : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left min-w-[800px]">
            <thead>
              <tr className={`border-b text-[10px] uppercase font-bold tracking-wider text-gray-500 ${
                isDarkMode ? 'bg-[#131a2e] border-[#1e2640]' : 'bg-gray-50 border-gray-200'
              }`}>
                <th className="py-4 px-6 w-20">Photo</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Position</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-sm ${isDarkMode ? 'divide-[#1e2640]/50' : 'divide-gray-200'}`}>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500 text-xs">No matching team members found.</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className={`transition-colors ${isDarkMode ? 'hover:bg-[#141b2d]' : 'hover:bg-gray-50'}`}>
                    <td className="py-4 px-6">
                      <img src={emp.avatar} alt={emp.name} className="w-8 h-8 object-cover rounded-full border border-[#222f54]" />
                    </td>
                    <td className={`py-4 px-6 font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {emp.name}
                    </td>
                    <td className={`py-4 px-6 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {emp.position}
                    </td>
                    <td className={`py-4 px-6 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {emp.department}
                    </td>
                    <td className="py-4 px-6 text-xs font-mono text-gray-500">
                      {emp.email}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold ${
                        emp.status === 'ACTIVE' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-gray-500 hover:text-white">
                      <button className="p-1 rounded hover:bg-gray-800/40 transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Block */}
        <div className={`p-4 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-gray-500 border-t ${
          isDarkMode ? 'bg-[#131a2e]/60 border-[#1e2640]' : 'bg-gray-50 border-gray-200'
        }`}>
          <div>Showing <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>1 to {filteredEmployees.length}</span> of <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>128</span> employees</div>
          <div className="flex gap-1">
            <button className="p-1.5 rounded border border-[#222f54] text-gray-500 hover:text-white cursor-pointer"><ChevronLeft size={14} /></button>
            <button className="px-2.5 py-1 rounded font-bold bg-[#4cc9f0] text-[#0b0f17]">1</button>
            <button className="px-2.5 py-1 rounded font-bold text-gray-400 hover:text-white">2</button>
            <button className="px-2.5 py-1 rounded font-bold text-gray-400 hover:text-white">3</button>
            <button className="p-1.5 rounded border border-[#222f54] text-gray-500 hover:text-white cursor-pointer"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Department Distribution Widgets Layout from screenshot */}
      <div className="space-y-4 pt-4">
        <h4 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Department Distribution
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Engineering */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-[#0f1422] border-[#1e2640]' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400"><Terminal size={16} /></div>
              <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-500/5 px-2 py-0.5 rounded-full">+4 this month</span>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Engineering</p>
              <h5 className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>64</h5>
            </div>
            <div className="w-full bg-gray-800 h-1 rounded-full mt-3 overflow-hidden">
              <div className="bg-cyan-400 h-full w-[65%]" />
            </div>
          </div>

          {/* Design */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-[#0f1422] border-[#1e2640]' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><Palette size={16} /></div>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/5 px-2 py-0.5 rounded-full">Stable</span>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Design</p>
              <h5 className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>18</h5>
            </div>
            <div className="w-full bg-gray-800 h-1 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-400 h-full w-[35%]" />
            </div>
          </div>

          {/* Marketing */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-[#0f1422] border-[#1e2640]' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400"><Megaphone size={16} /></div>
              <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/5 px-2 py-0.5 rounded-full">+2 this month</span>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Marketing</p>
              <h5 className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>24</h5>
            </div>
            <div className="w-full bg-gray-800 h-1 rounded-full mt-3 overflow-hidden">
              <div className="bg-indigo-400 h-full w-[45%]" />
            </div>
          </div>

          {/* Operations */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-[#0f1422] border-[#1e2640]' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400"><Briefcase size={16} /></div>
              <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/5 px-2 py-0.5 rounded-full">Stable</span>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Operations</p>
              <h5 className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>22</h5>
            </div>
            <div className="w-full bg-gray-800 h-1 rounded-full mt-3 overflow-hidden">
              <div className="bg-amber-400 h-full w-[40%]" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}