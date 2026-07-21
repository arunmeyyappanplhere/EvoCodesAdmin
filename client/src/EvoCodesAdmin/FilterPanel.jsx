import React from 'react';
import { Search, ArrowUpDown } from 'lucide-react';

export default function FilterPanel({ 
  searchTerm, setSearchTerm, categoryFilter, setCategoryFilter, 
  statusFilter, setStatusFilter, sortOrder, setSortOrder 
}) {
  return (
    <div className="p-4 rounded-xl border flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between transition-colors bg-[#0f1422] border-[#1e2640]">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search project name, client, or tech..." 
          className="w-full text-sm border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#4cc9f0] bg-[#0b0f17] border-[#222f54] text-white" 
        />
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 text-xs font-semibold w-full lg:w-auto">
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border px-3 py-2 rounded-lg focus:outline-none w-full sm:w-auto bg-[#0b0f17] border-[#222f54] text-gray-300"
        >
          <option value="All">Category: All</option>
          <option value="Web App">Web App</option>
          <option value="Mobile App">Mobile App</option>
          <option value="AI/ML">AI/ML</option>
        </select>

        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded-lg focus:outline-none w-full sm:w-auto bg-[#0b0f17] border-[#222f54] text-gray-300"
        >
          <option value="All">Status: All</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>

        <button 
          onClick={() => setSortOrder(sortOrder === 'Newest' ? 'Alphabetical' : 'Newest')}
          className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 border px-3 py-2 rounded-lg transition-all w-full sm:w-auto bg-[#0b0f17] border-[#222f54] hover:bg-[#151c30] text-gray-300"
        >
          <ArrowUpDown size={12} />
          <span>Sort: {sortOrder}</span>
        </button>
      </div>
    </div>
  );
}