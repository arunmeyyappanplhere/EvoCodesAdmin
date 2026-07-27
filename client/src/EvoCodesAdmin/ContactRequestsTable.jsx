import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MailOpen, Archive, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function ContactRequestsTable({ isDarkMode }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [subFilter, setSubFilter] = useState('All Requests'); // 'All Requests', 'New', 'Replied', 'Archived'

  // Fetch data from backend on load using Axios
  useEffect(() => {
    const fetchContactRequests = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/contact-requests', {
          withCredentials: true
        });
        setRequests(response.data);
      } catch (error) {
        console.error("Failed to fetch contact requests:", error);
        
      } finally {
        setLoading(false);
      }
    };

    fetchContactRequests();
  }, []);

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
      setSelectedIds(filteredRequests.map(r => r.contactRequestId));
    }
  };

  // Actions using Axios
  const handleBatchStatus = async (status) => {
    if (selectedIds.length === 0) return alert("Select at least one request.");
    
    try {
      await Promise.all(
        selectedIds.map(id =>
          axios.put(`/api/contact-requests/${id}`, 
            { contactRequestStatus: status },
            { withCredentials: true }
          )
        )
      );

      setRequests(prev => prev.map(r => selectedIds.includes(r.contactRequestId) ? { ...r, contactRequestStatus: status } : r));
      setSelectedIds([]);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Error updating request status.");
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return alert("Select at least one request.");
    
    if (confirm(`Delete ${selectedIds.length} selected request(s)?`)) {
      try {
        await Promise.all(
          selectedIds.map(id =>
            axios.delete(`/api/contact-requests/${id}`, {
              withCredentials: true
            })
          )
        );

        setRequests(prev => prev.filter(r => !selectedIds.includes(r.contactRequestId)));
        setSelectedIds([]);
      } catch (error) {
        console.error("Failed to delete requests:", error);
        alert("Error deleting requests.");
      }
    }
  };

  // Filter Logic matching schema status field (`contactRequestStatus`)
  const filteredRequests = requests.filter(r => {
    if (subFilter === 'New') return r.contactRequestStatus === 'NEW';
    if (subFilter === 'Replied') return r.contactRequestStatus === 'REPLIED';
    if (subFilter === 'Archived') return r.contactRequestStatus === 'ARCHIVED';
    return true; // All Requests
  });

  const newMessagesCount = requests.filter(r => r.contactRequestStatus === 'NEW').length;

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
            <span>Database Synced</span>
          </div>
        </div>

        {/* Action Controls buttons */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <button 
            onClick={() => handleBatchStatus('REPLIED')}
            className={`flex items-center gap-1.5 border px-4 py-2 rounded-lg transition-all cursor-pointer ${
              isDarkMode ? 'bg-[#151c30] border-[#222f54] text-gray-300 hover:bg-[#1d2744]' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MailOpen size={14} /> Mark as Read
          </button>
          <button 
            onClick={() => handleBatchStatus('ARCHIVED')}
            className={`flex items-center gap-1.5 border px-4 py-2 rounded-lg transition-all cursor-pointer ${
              isDarkMode ? 'bg-[#151c30] border-[#222f54] text-gray-300 hover:bg-[#1d2744]' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Archive size={14} /> Archive
          </button>
          <button 
            onClick={handleBatchDelete}
            className="flex items-center gap-1.5 border border-rose-500/30 bg-rose-500/10 text-rose-400 px-4 py-2 rounded-lg hover:bg-rose-500/20 transition-all cursor-pointer"
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
              className={`px-4 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
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
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500 text-xs">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin text-[#4cc9f0]" size={18} />
                      Loading contact requests...
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500 text-xs">No contact records found.</td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const initials = req.contactRequestSenderName
                    ? req.contactRequestSenderName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
                    : "UN";

                  return (
                    <tr key={req.contactRequestId} className={`transition-colors group ${isDarkMode ? 'hover:bg-[#141b2d]' : 'hover:bg-gray-50'} ${selectedIds.includes(req.contactRequestId) ? (isDarkMode ? 'bg-[#141b2d]' : 'bg-blue-50/50') : ''}`}>
                      <td className="py-4 px-6">
                        <input 
                          type="checkbox"
                          checked={selectedIds.includes(req.contactRequestId)}
                          onChange={() => toggleSelectRow(req.contactRequestId)}
                          className="rounded bg-[#0b0f17] border-[#222f54] text-[#4cc9f0] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1b253d] text-[#4cc9f0] flex items-center justify-center font-bold text-xs border border-[#222f54] flex-shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className={`font-bold transition-colors truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{req.contactRequestSenderName}</div>
                          <div className="text-xs text-gray-500 mt-0.5 truncate">{req.contactRequestEmail}</div>
                        </div>
                      </td>
                      <td className={`py-4 px-6 font-medium max-w-[280px] truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {req.contactRequestSubject}
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-400 font-medium">
                        {new Date(req.contactRequestDate || req.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          req.contactRequestStatus === 'NEW' ? 'bg-cyan-500/15 text-[#4cc9f0]' :
                          req.contactRequestStatus === 'REPLIED' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {req.contactRequestStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>  
        </div>

        {/* Dynamic Pagination matching look from design */}
        <div className={`p-4 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-gray-500 border-t ${
          isDarkMode ? 'bg-[#131a2e]/60 border-[#1e2640]' : 'bg-gray-50 border-gray-200'
        }`}>
          <div>Showing <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>1 to {filteredRequests.length}</span> of <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>{requests.length}</span> requests</div>
          <div className="flex gap-1">
            <button className="p-1.5 rounded border border-[#222f54] text-gray-500 hover:text-white cursor-pointer"><ChevronLeft size={14} /></button>
            <button className="px-2.5 py-1 rounded font-bold bg-[#4cc9f0] text-[#0b0f17]">1</button>
            <button className="p-1.5 rounded font-bold text-gray-400 hover:text-white">2</button>
            <button className="p-1.5 rounded font-bold text-gray-400 hover:text-white">3</button>
            <button className="p-1.5 rounded border border-[#222f54] text-gray-500 hover:text-white cursor-pointer"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}