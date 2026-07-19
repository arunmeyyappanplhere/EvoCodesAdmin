import React, { useState } from 'react';
import { MailOpen, Archive, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const INITIAL_REQUESTS = [
  { id: 1, sender: 'John Doe', email: 'john.doe@techsphere.com', subject: 'New Project Inquiry: AI SaaS Platf...', date: 'Today, 10:45 AM', status: 'NEW', initials: 'JD' },
  { id: 2, sender: 'Sarah Jenkins', email: 'sarah@creative.io', subject: 'Partnership Opportunity - Q3 Roa...', date: 'Yesterday, 04:20 PM', status: 'REPLIED', initials: 'SJ', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=60' },
  { id: 3, sender: 'Marcus Low', email: 'm.low@enterprise.com', subject: 'Technical Support Request #8921', date: 'Oct 12, 2023', status: 'ARCHIVED', initials: 'ML' },
  { id: 4, sender: 'Alex Fischer', email: 'alex.f@innovate.de', subject: 'Seeking Backend Audit for FinTec...', date: 'Oct 14, 2023', status: 'NEW', initials: 'AF' },
];

export default function ContactRequestsTable({ isDarkMode }) {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [selectedIds, setSelectedIds] = useState([]);
  const [subFilter, setSubFilter] = useState('All Requests'); // 'All Requests', 'New', 'Replied', 'Archived'

  // Toggle Single Selection Checkbox
  const toggleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  // Toggle All Checkboxes
  const toggleSelectAll = (filteredRequests) => {
    if (selectedIds.length === filteredRequests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRequests.map(r => r.id));
    }
  };

  // Actions
  const handleBatchStatus = (status) => {
    if (selectedIds.length === 0) return alert("Select at least one request.");
    setRequests(prev => prev.map(r => selectedIds.includes(r.id) ? { ...r, status } : r));
    setSelectedIds([]);
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return alert("Select at least one request.");
    if (confirm(`Delete ${selectedIds.length} selected request(s)?`)) {
      setRequests(prev => prev.filter(r => !selectedIds.includes(r.id)));
      setSelectedIds([]);
    }
  };

  // Filter Logic matching buttons
  const filteredRequests = requests.filter(r => {
    if (subFilter === 'New') return r.status === 'NEW';
    if (subFilter === 'Replied') return r.status === 'REPLIED';
    if (subFilter === 'Archived') return r.status === 'ARCHIVED';
    return true; // All Requests
  });

  const newMessagesCount = requests.filter(r => r.status === 'NEW').length;

  return (
    <div className="space-y-6">
      {/* Top Heading Actions Panel from image */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Contact Requests</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span className="flex items-center gap-1.5 font-semibold text-[#4cc9f0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4cc9f0] animate-pulse" />
              {newMessagesCount} New Messages
            </span>
            <span>|</span>
            <span>Last synced: 2 minutes ago</span>
          </div>
        </div>

        {/* Action Controls buttons */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <button 
            onClick={() => handleBatchStatus('REPLIED')}
            className={`flex items-center gap-1.5 border px-4 py-2 rounded-lg transition-all ${
              isDarkMode ? 'bg-[#151c30] border-[#222f54] text-gray-300 hover:bg-[#1d2744]' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MailOpen size={14} /> Mark as Read
          </button>
          <button 
            onClick={() => handleBatchStatus('ARCHIVED')}
            className={`flex items-center gap-1.5 border px-4 py-2 rounded-lg transition-all ${
              isDarkMode ? 'bg-[#151c30] border-[#222f54] text-gray-300 hover:bg-[#1d2744]' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Archive size={14} /> Archive
          </button>
          <button 
            onClick={handleBatchDelete}
            className="flex items-center gap-1.5 border border-rose-500/30 bg-rose-500/10 text-rose-400 px-4 py-2 rounded-lg hover:bg-rose-500/20 transition-all"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* View Sub Filter Pill Bar matching screenshot exactly */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap gap-2">
          {['All Requests', 'New', 'Replied', 'Archived'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setSubFilter(tab); setSelectedIds([]); }}
              className={`px-4 py-1.5 rounded-full font-medium transition-all ${
                subFilter === tab
                  ? 'bg-[#4cc9f0] text-[#0b0f17] font-bold'
                  : isDarkMode ? 'bg-[#151c30] text-gray-400 hover:text-white' : 'bg-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 font-semibold text-gray-500">
          <span>Show:</span>
          <select className={`bg-transparent border-none font-bold text-[#4cc9f0] focus:outline-none cursor-pointer`}>
            <option>25 rows</option>
            <option>50 rows</option>
          </select>
        </div>
      </div>

      {/* Main Container Board */}
      <div className={`rounded-xl border overflow-hidden transition-colors w-full ${
        isDarkMode ? 'bg-[#0f1422] border-[#1e2640]' : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left min-w-[750px]">
            <thead>
              <tr className={`border-b text-[10px] uppercase font-bold tracking-wider text-gray-500 ${
                isDarkMode ? 'bg-[#131a2e] border-[#1e2640]' : 'bg-gray-50 border-gray-200'
              }`}>
                <th className="py-3.5 px-6 w-12">
                  <input 
                    type="checkbox"
                    checked={filteredRequests.length > 0 && selectedIds.length === filteredRequests.length}
                    onChange={() => toggleSelectAll(filteredRequests)}
                    className="rounded bg-[#0b0f17] border-[#222f54] text-[#4cc9f0] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-6">Sender</th>
                <th className="py-3.5 px-6">Subject</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-sm ${isDarkMode ? 'divide-[#1e2640]/50' : 'divide-gray-200'}`}>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500 text-xs">No contact records standard array match selected active sub-filter.</td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-[#141b2d]' : 'hover:bg-gray-50'} ${selectedIds.includes(req.id) ? (isDarkMode ? 'bg-[#141b2d]' : 'bg-blue-50/50') : ''}`}>
                    <td className="py-4 px-6">
                      <input 
                        type="checkbox"
                        checked={selectedIds.includes(req.id)}
                        onChange={() => toggleSelectRow(req.id)}
                        className="rounded bg-[#0b0f17] border-[#222f54] text-[#4cc9f0] focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-6 flex items-center gap-3">
                      {req.avatar ? (
                        <img src={req.avatar} alt={req.sender} className="w-9 h-9 object-cover rounded-full border border-[#222f54] flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#1b253d] text-[#4cc9f0] flex items-center justify-center font-bold text-xs border border-[#222f54] flex-shrink-0">
                          {req.initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className={`font-bold transition-colors truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{req.sender}</div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate">{req.email}</div>
                      </div>
                    </td>
                    <td className={`py-4 px-6 font-medium max-w-[280px] truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {req.subject}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-400 font-medium">
                      {req.date}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'NEW' ? 'bg-cyan-500/15 text-[#4cc9f0]' :
                        req.status === 'REPLIED' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination matching look from design */}
        <div className={`p-4 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-gray-500 border-t ${
          isDarkMode ? 'bg-[#131a2e]/60 border-[#1e2640]' : 'bg-gray-50 border-gray-200'
        }`}>
          <div>Showing <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>1 to {filteredRequests.length}</span> of <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>128</span> requests</div>
          <div className="flex gap-1">
            <button className="p-1.5 rounded border border-[#222f54] text-gray-500 hover:text-white cursor-pointer"><ChevronLeft size={14} /></button>
            <button className="px-2.5 py-1 rounded font-bold bg-[#4cc9f0] text-[#0b0f17]">1</button>
            <button className="px-2.5 py-1 rounded font-bold text-gray-400 hover:text-white">2</button>
            <button className="px-2.5 py-1 rounded font-bold text-gray-400 hover:text-white">3</button>
            <button className="p-1.5 rounded border border-[#222f54] text-gray-500 hover:text-white cursor-pointer"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}