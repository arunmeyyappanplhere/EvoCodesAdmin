import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Calendar, 
  Search, 
  Trash2, 
  CheckCircle, 
  Phone, 
  Loader2, 
  X,
  AlertCircle
} from 'lucide-react';

// Configure Axios Instance to handle HttpOnly Auth Cookies
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Pointed to /api base path
  withCredentials: true, // Sends HTTP-only auth cookies automatically
});

const AdminPage = ({ adminsData, onRegisterAdmin }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    reEnterPassword: '',
    dateOfBirth: '',
    role: 'System Admin',
    companyCode: '',
    image: null,
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Load admins either from parent props or direct API call
  const fetchAdmins = async () => {
    if (adminsData && adminsData.length > 0) {
      setAdmins(adminsData);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch full admin list using `api` instance (includes cookies)
      const res = await api.get('/admins');
      const fetchedList = Array.isArray(res.data) ? res.data : res.data.admins || [];
      
      if (fetchedList.length > 0) {
        setAdmins(fetchedList);
      } else {
        // Fallback: If /admins is empty, load active session user via /me
        const meRes = await api.get('/me');
        if (meRes.data?.admin) {
          setAdmins([meRes.data.admin]);
        }
      }
    } catch (err) {
      // 2. Fallback to /me if /admins fails due to permissions or route issues
      try {
        const meRes = await api.get('/me');
        if (meRes.data?.admin) {
          setAdmins([meRes.data.admin]);
        } else {
          setError(err.response?.data?.message || 'Failed to load registered admins from server.');
        }
      } catch (authErr) {
        console.error('API Fetch Error:', authErr);
        setError('Authentication required or session expired. Please log in.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [adminsData]);

  // Delete Admin
  const handleDeleteAdmin = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin account?')) return;

    try {
      await api.delete(`/admins/${id}`);
      setAdmins((prev) => prev.filter((admin) => (admin._id || admin.id) !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete admin.');
    }
  };

  // Input Handling
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Register New Admin
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setFormError('');

    if (formData.password !== formData.reEnterPassword) {
      setFormError('Passwords do not match!');
      setSubmitLoading(false);
      return;
    }

    try {
      const multipartData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'image') {
          if (formData.image instanceof File) {
            multipartData.append('image', formData.image);
          }
        } else if (formData[key] !== null && formData[key] !== undefined) {
          multipartData.append(key, formData[key]);
        }
      });

      // Posts to register endpoint using `api` instance
      const response = await api.post('/register', multipartData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newAdmin = response.data.admin;

      // Ensure local state renders the newly registered admin immediately
      setAdmins((prev) => [newAdmin, ...prev]);

      if (onRegisterAdmin) {
        onRegisterAdmin(newAdmin);
      }

      setShowModal(false);
      setFormData({
        username: '',
        email: '',
        phoneNumber: '',
        password: '',
        reEnterPassword: '',
        dateOfBirth: '',
        role: 'System Admin',
        companyCode: '',
        image: null,
      });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to register admin account.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filter admins by username, email, userID, or role
  const filteredAdmins = admins.filter(
    (admin) =>
      admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.userID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-[#0B0F17] text-slate-200 min-h-screen font-sans w-full max-w-full overflow-x-hidden">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
            Registered Admins Directory
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Complete database records and status details for every registered administrator.
          </p>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <div className="bg-[#121824] border border-slate-800 p-4 sm:p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Total Admins</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">{admins.length}</h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-[#00E5FF]/10 rounded-lg text-[#00E5FF] shrink-0">
            <Users size={20} className="sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-[#121824] border border-slate-800 p-4 sm:p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Active Status</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">{admins.length} Active</h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0">
            <CheckCircle size={20} className="sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-[#121824] border border-slate-800 p-4 sm:p-5 rounded-xl flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">System Roles</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {new Set(admins.map((a) => a.role)).size || 1} Roles
            </h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0">
            <ShieldCheck size={20} className="sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#121824] border border-slate-800 rounded-xl p-3 sm:p-4 mb-6 flex items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by UserID, Name, Email or Role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0F17] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
          />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-xs sm:text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Admins Table */}
      <div className="bg-[#121824] border border-slate-800 rounded-xl overflow-hidden shadow-lg w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-[#182030]/50 border-b border-slate-800 text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 sm:py-4 px-4 sm:px-6 whitespace-nowrap">User ID</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 whitespace-nowrap">Admin User</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 whitespace-nowrap">Phone</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 whitespace-nowrap">Role</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 whitespace-nowrap">Registered On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={20} className="animate-spin text-[#00E5FF]" />
                      <span>Loading registered admins...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => (
                  <tr key={admin._id || admin.userID || admin.email} className="hover:bg-[#182030]/30 transition-colors">
                    <td className="py-3 sm:py-4 px-4 sm:px-6 font-mono text-xs font-bold text-[#00E5FF] whitespace-nowrap">
                      {admin.userID || 'N/A'}
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <img
                          src={
                            admin.image ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${admin.username || 'Admin'}`
                          }
                          alt={admin.username}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-slate-700 object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate max-w-[150px] sm:max-w-xs">{admin.username || admin.name}</p>
                          <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                            <Mail size={12} className="shrink-0" /> <span className="truncate">{admin.email}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-slate-300 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Phone size={13} className="text-slate-500 shrink-0" />
                        {admin.phoneNumber || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        <ShieldCheck size={14} className="text-[#00E5FF] shrink-0" />
                        {admin.role || 'System Admin'}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-slate-400 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="shrink-0" />
                        {admin.createdAt
                          ? new Date(admin.createdAt).toLocaleDateString()
                          : admin.dateOfBirth || 'Recently'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500 text-xs sm:text-sm">
                    No registered admins match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;