import React, { useEffect, useMemo, useState } from 'react';
import { MailOpen, Archive, Trash2, ChevronLeft, ChevronRight, Loader2, AlertCircle, X } from 'lucide-react';
import axiosInstance from "./api/Axiosinstance"; // adjust to wherever Axiosinstance.js actually lives

const initialsFor = (name = "") =>
  name ? name.split(" ").filter(Boolean).map((w) => w[0]).join("").substring(0, 2).toUpperCase() : "NA";

const formatDate = (raw) => {
  if (!raw) return "";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
};

export default function ContactRequestsTable({ isDarkMode }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); // contactRequestId
  const [subFilter, setSubFilter] = useState('All Requests');

  // NOTE: this GET route is served by contactController.js (not something I have visibility
  // into) — it's assumed to return documents shaped like the contactRequests model
  // (contactRequestId, contactRequestSenderName, contactRequestEmail, contactRequestSubject,
  // contactRequestDate, contactRequestStatus). Verify this matches your actual controller.
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/contact");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 404) {
        setRequests([]);
      } else {
        setError("Couldn't load contact requests. Please refresh and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };

  const toggleSelectAll = (filteredRequests) => {
    if (selectedIds.length === filteredRequests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRequests.map(r => r.contactRequestId));
    }
  };

  const handleBatchStatus = async (status) => {
    if (selectedIds.length === 0) return alert("Select at least one request.");
    setError(null);
    const ids = [...selectedIds];
    try {
      const updates = await Promise.all(
        ids.map((id) => axiosInstance.put(`/contact/${id}`, { contactRequestStatus: status }))
      );
      setRequests((prev) =>
        prev.map((r) => {
          const updated = updates.find((res) => res.data.contactRequestId === r.contactRequestId);
          return updated ? updated.data : r;
        })
      );
      setSelectedIds([]);
    } catch {
      setError("Some requests couldn't be updated. Refreshing the list.");
      fetchRequests();
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return alert("Select at least one request.");
    if (!confirm(`Delete ${selectedIds.length} selected request(s)?`)) return;
    setError(null);
    const ids = [...selectedIds];
    try {
      await Promise.all(ids.map((id) => axiosInstance.delete(`/contact/${id}`)));
      setRequests((prev) => prev.filter((r) => !ids.includes(r.contactRequestId)));
      setSelectedIds([]);
    } catch {
      setError("Some requests couldn't be deleted. Refreshing the list.");
      fetchRequests();
    }
  };

  const filteredRequests = useMemo(() => requests.filter(r => {
    if (subFilter === 'New') return r.contactRequestStatus === 'NEW';
    if (subFilter === 'Replied') return r.contactRequestStatus === 'REPLIED';
    if (subFilter === 'Archived') return r.contactRequestStatus === 'ARCHIVED';
    return true;
  }), [requests, subFilter]);

  const newMessagesCount = requests.filter(r => r.contactRequestStatus === 'NEW').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Contact Requests</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span className="flex items-center gap-1.5 font-semibold text-[#4cc9f0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4cc9f0] animate-pulse" />
              {newMessagesCount} New Messages
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <button onClick={() => handleBatchStatus('REPLIED')}
            className={`flex items-center gap-1.5 border px-4 py-2 rounded-lg transition-all ${isDarkMode ? 'bg-[#151c30] border-[#222f54] text-gray-300 hover:bg-[#1d2744]' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <MailOpen size={14} /> Mark as Read
          </button>
          <button onClick={() => handleBatchStatus('ARCHIVED')}
            className={`flex items-center gap-1.5 border px-4 py-2 rounded-lg transition-all ${isDarkMode ? 'bg-[#151c30] border-[#222f54] text-gray-300 hover:bg-[#1d2744]' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <Archive size={14} /> Archive
          </button>
          <button onClick={handleBatchDelete}
            className="flex items-center gap-1.5 border border-rose-500/30 bg-rose-500/10 text-rose-400 px-4 py-2 rounded-lg hover:bg-rose-500/20 transition-all">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
          <div className="flex items-center gap-2"><AlertCircle size={14} /><span>{error}</span></div>
          <button onClick={() => setError(null)} aria-label="Dismiss"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap gap-2">
          {['All Requests', 'New', 'Replied', 'Archived'].map((tab) => (
            <button key={tab} onClick={() => { setSubFilter(tab); setSelectedIds([]); }}
              className={`px-4 py-1.5 rounded-full font-medium transition-all ${
                subFilter === tab ? 'bg-[#4cc9f0] text-[#0b0f17] font-bold' : isDarkMode ? 'bg-[#151c30] text-gray-400 hover:text-white' : 'bg-gray-200 text-gray-600 hover:text-gray-900'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className={`rounded-xl border overflow-hidden transition-colors w-full ${isDarkMode ? 'bg-[#0f1422] border-[#1e2640]' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left min-w-[750px]">
            <thead>
              <tr className={`border-b text-[10px] uppercase font-bold tracking-wider text-gray-500 ${isDarkMode ? 'bg-[#131a2e] border-[#1e2640]' : 'bg-gray-50 border-gray-200'}`}>
                <th className="py-3.5 px-6 w-12">
                  <input type="checkbox"
                    checked={filteredRequests.length > 0 && selectedIds.length === filteredRequests.length}
                    onChange={() => toggleSelectAll(filteredRequests)}
                    className="rounded bg-[#0b0f17] border-[#222f54] text-[#4cc9f0] focus:ring-0 cursor-pointer" />
                </th>
                <th className="py-3.5 px-6">Sender</th>
                <th className="py-3.5 px-6">Subject</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-sm ${isDarkMode ? 'divide-[#1e2640]/50' : 'divide-gray-200'}`}>
              {loading ? (
                <tr><td colSpan="5" className="py-12 text-center text-gray-500 text-xs">
                  <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading requests...</span>
                </td></tr>
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan="5" className="py-12 text-center text-gray-500 text-xs">No contact requests match the selected filter.</td></tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.contactRequestId} className={`transition-colors group ${isDarkMode ? 'hover:bg-[#141b2d]' : 'hover:bg-gray-50'} ${selectedIds.includes(req.contactRequestId) ? (isDarkMode ? 'bg-[#141b2d]' : 'bg-blue-50/50') : ''}`}>
                    <td className="py-4 px-6">
                      <input type="checkbox"
                        checked={selectedIds.includes(req.contactRequestId)}
                        onChange={() => toggleSelectRow(req.contactRequestId)}
                        className="rounded bg-[#0b0f17] border-[#222f54] text-[#4cc9f0] focus:ring-0 cursor-pointer" />
                    </td>
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1b253d] text-[#4cc9f0] flex items-center justify-center font-bold text-xs border border-[#222f54] flex-shrink-0">
                        {initialsFor(req.contactRequestSenderName)}
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
                      {formatDate(req.contactRequestDate || req.createdAt)}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={`p-4 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-gray-500 border-t ${isDarkMode ? 'bg-[#131a2e]/60 border-[#1e2640]' : 'bg-gray-50 border-gray-200'}`}>
          <div>Showing <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>{filteredRequests.length}</span> of <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>{requests.length}</span> requests</div>
          <div className="flex gap-1">
            <button className="p-1.5 rounded border border-[#222f54] text-gray-500 hover:text-white cursor-pointer"><ChevronLeft size={14} /></button>
            <button className="px-2.5 py-1 rounded font-bold bg-[#4cc9f0] text-[#0b0f17]">1</button>
            <button className="p-1.5 rounded border border-[#222f54] text-gray-500 hover:text-white cursor-pointer"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}