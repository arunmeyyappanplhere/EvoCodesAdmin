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
    <div className="p-6 md:p-8 bg-[#0B0F17] text-slate-200 min-h-screen font-sans">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Registered Admins Directory
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Complete database records and status details for every registered administrator.
          </p>
        </div>
       
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Total Admins</p>
            <h3 className="text-3xl font-bold text-white mt-1">{admins.length}</h3>
          </div>
          <div className="p-3 bg-[#00E5FF]/10 rounded-lg text-[#00E5FF]">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Active Status</p>
            <h3 className="text-3xl font-bold text-white mt-1">{admins.length} Active</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">System Roles</p>
            <h3 className="text-3xl font-bold text-white mt-1">
              {new Set(admins.map((a) => a.role)).size || 1} Roles
            </h3>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by UserID, Name, Email or Role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0F17] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
          />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Admins Table */}
      <div className="bg-[#121824] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#182030]/50 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">User ID</th>
                <th className="py-4 px-6">Admin User</th>
                <th className="py-4 px-6">Phone</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Registered On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={20} className="animate-spin text-[#00E5FF]" />
                      <span>Loading registered admins...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => (
                  <tr key={admin._id || admin.userID || admin.email} className="hover:bg-[#182030]/30 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-[#00E5FF]">
                      {admin.userID || 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            admin.image ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${admin.username || 'Admin'}`
                          }
                          alt={admin.username}
                          className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                        />
                        <div>
                          <p className="font-semibold text-white">{admin.username || admin.name}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail size={12} /> {admin.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-300 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Phone size={13} className="text-slate-500" />
                        {admin.phoneNumber || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        <ShieldCheck size={14} className="text-[#00E5FF]" />
                        {admin.role || 'System Admin'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {admin.createdAt
                          ? new Date(admin.createdAt).toLocaleDateString()
                          : admin.dateOfBirth || 'Recently'}
                      </div>
                    </td>
                 
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500 text-sm">
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