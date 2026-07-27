import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MailOpen, Archive, Trash2, ChevronLeft, ChevronRight, Loader2, Eye, X } from 'lucide-react';

export default function ContactRequestsTable({ isDarkMode }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [subFilter, setSubFilter] = useState('All Requests'); // 'All Requests', 'New', 'Replied', 'Archived'
  
  // State for viewing/editing full details in a popup modal
  const [activeModalRequest, setActiveModalRequest] = useState(null);

  // Helper function to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleString();
  };

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

  // Batch Status Handler
  const handleBatchStatus = async (status) => {
    if (selectedIds.length === 0) return alert("Select at least one request.");
    
    try {
      await Promise.all(
        selectedIds.map(id =>
          axios.put(`http://localhost:8000/api/contact-requests/${id}`, 
            { contactRequestStatus: status },
            { withCredentials: true }
          )
        )
      );

      setRequests(prev => prev.map(r => selectedIds.includes(r.contactRequestId) ? { ...r, contactRequestStatus: status } : r));
      setSelectedIds([]);
    } catch (error) {
      console.error("Failed to update batch status:", error);
      alert("Error updating request status.");
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return alert("Select at least one request.");
    
    if (confirm(`Delete ${selectedIds.length} selected request(s)?`)) {
      try {
        await Promise.all(
          selectedIds.map(id =>
            axios.delete(`http://localhost:8000/api/contact-requests/${id}`, {
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

  // Single Delete Handler
  const handleDeleteSingle = async (id, e) => {
    if (e) e.stopPropagation();
    if (confirm("Are you sure you want to delete this contact request?")) {
      try {
        await axios.delete(`http://localhost:8000/api/contact-requests/${id}`, {
          withCredentials: true
        });
        setRequests(prev => prev.filter(r => r.contactRequestId !== id));
        setSelectedIds(prev => prev.filter(rowId => rowId !== id));
        if (activeModalRequest?.contactRequestId === id) {
          setActiveModalRequest(null);
        }
      } catch (error) {
        console.error("Failed to delete request:", error);
        alert("Error deleting request.");
      }
    }
  };

  // Single status update handler from modal or quick-select
  const handleUpdateStatusSingle = async (id, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:8000/api/contact-requests/${id}`, 
        { contactRequestStatus: newStatus },
        { withCredentials: true }
      );
      
      const updatedStatus = response.data.contactRequestStatus || newStatus;

      setRequests(prev => prev.map(r => r.contactRequestId === id ? { ...r, contactRequestStatus: updatedStatus } : r));
      
      if (activeModalRequest && activeModalRequest.contactRequestId === id) {
        setActiveModalRequest(prev => ({ ...prev, contactRequestStatus: updatedStatus }));
      }
      
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Error updating request status.");
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
      {/* Top Heading Actions Panel */}
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
            <MailOpen size={14} /> Mark as Replied
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

      {/* View Sub Filter Pill Bar */}
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
          <select className="bg-transparent border-none font-bold text-[#4cc9f0] focus:outline-none cursor-pointer">
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
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-sm ${isDarkMode ? 'divide-[#1e2640]/50' : 'divide-gray-200'}`}>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500 text-xs">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin text-[#4cc9f0]" size={18} />
                      Loading contact requests...
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500 text-xs">No contact records found.</td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const initials = req.contactRequestSenderName
                    ? req.contactRequestSenderName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
                    : "UN";

                  return (
                    <tr 
                      key={req.contactRequestId} 
                      onClick={() => setActiveModalRequest(req)}
                      className={`transition-colors group cursor-pointer ${isDarkMode ? 'hover:bg-[#141b2d]' : 'hover:bg-gray-50'} ${selectedIds.includes(req.contactRequestId) ? (isDarkMode ? 'bg-[#141b2d]' : 'bg-blue-50/50') : ''}`}
                    >
                      <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
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
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setActiveModalRequest(req)}
                            title="View Full Details & Edit"
                            className="p-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-[#4cc9f0] hover:bg-cyan-500/20 transition-all cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteSingle(req.contactRequestId, e)}
                            title="Delete Request"
                            className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>  
        </div>

        {/* Dynamic Pagination */}
        <div className={`p-4 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-gray-500 border-t ${
          isDarkMode ? 'bg-[#131a2e]/60 border-[#1e2640]' : 'bg-gray-50 border-gray-200'
        }`}>
          <div>Showing <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>1 to {filteredRequests.length}</span> of <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>{requests.length}</span> requests</div>
          <div className="flex gap-1">
            <button className="p-1.5 rounded border border-[#222f54] text-gray-500 hover:text-white cursor-pointer"><ChevronLeft size={14} /></button>
            <button className="px-2.5 py-1 rounded font-bold bg-[#4cc9f0] text-[#0b0f17]">1</button>
            <button className="p-1.5 rounded border border-[#222f54] text-gray-500 hover:text-white cursor-pointer"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Modal View */}
      {activeModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative ${
            isDarkMode ? 'bg-[#0f1422] border-[#1e2640] text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-gray-700/30">
              <h3 className="text-lg font-bold">Contact Request Details</h3>
              <button 
                onClick={() => setActiveModalRequest(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 my-6 text-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Sender Name</span>
                <p className="font-semibold text-base mt-0.5">{activeModalRequest.contactRequestSenderName}</p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Email Address</span>
                <p className="font-medium text-[#4cc9f0] mt-0.5">{activeModalRequest.contactRequestEmail}</p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Subject</span>
                <p className="font-medium mt-0.5">{activeModalRequest.contactRequestSubject}</p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Message</span>
                <div className={`mt-1 p-3 rounded-xl border text-sm max-h-40 overflow-y-auto ${
                  isDarkMode ? 'bg-[#151c30] border-[#222f54] text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}>
                  {activeModalRequest.contactRequestDesc || activeModalRequest.contactRequestMessage || activeModalRequest.message || "No message body provided."}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">Date Received</span>
                  <span className="text-xs text-gray-400 font-medium">
                    {formatDate(activeModalRequest.contactRequestDate || activeModalRequest.createdAt)}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">Status</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={activeModalRequest.contactRequestStatus}
                      onChange={(e) => handleUpdateStatusSingle(activeModalRequest.contactRequestId, e.target.value)}
                      className={`text-xs font-bold rounded px-2.5 py-1 border focus:outline-none cursor-pointer ${
                        isDarkMode ? 'bg-[#151c30] border-[#222f54] text-[#4cc9f0]' : 'bg-gray-100 border-gray-300 text-blue-600'
                      }`}
                    >
                      <option value="NEW">NEW</option>
                      <option value="REPLIED">REPLIED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700/30">
              <button
                onClick={(e) => handleDeleteSingle(activeModalRequest.contactRequestId, e)}
                className="flex items-center gap-1.5 border border-rose-500/30 bg-rose-500/10 text-rose-400 px-4 py-2 rounded-lg hover:bg-rose-500/20 transition-all text-xs font-semibold cursor-pointer"
              >
                <Trash2 size={14} /> Delete Request
              </button>
              <button
                onClick={() => setActiveModalRequest(null)}
                className="px-4 py-2 rounded-lg bg-[#4cc9f0] text-[#0b0f17] text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}