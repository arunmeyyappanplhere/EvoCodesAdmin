import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  Download,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Palette,
  Megaphone,
  Briefcase,
  X,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  ImagePlus,
} from 'lucide-react';
import axiosInstance from "./api/Axiosinstance";
import AlertModal from "./AlertModal";

const DEPARTMENTS = ['All Departments', 'Engineering', 'Design', 'Marketing', 'Operations'];
const DEPARTMENT_META = {
  Engineering: { color: 'cyan', icon: Terminal },
  Design: { color: 'emerald', icon: Palette },
  Marketing: { color: 'indigo', icon: Megaphone },
  Operations: { color: 'amber', icon: Briefcase },
};

const EMPTY_EMPLOYEE_FORM = {
  employeeName: '',
  employeePosition: '',
  employeeDepartment: 'Engineering',
  employeeEmail: '',
  employeeStatus: 'ACTIVE',
};

// Instance defaults to application/json; drop it for FormData so the browser
// sets the correct multipart boundary itself.
const multipartConfig = { headers: { "Content-Type": undefined } };

const ITEMS_PER_PAGE = 5;

export default function TeamManagementTable({ isDarkMode = true }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null); // employeeId
  const [form, setForm] = useState(EMPTY_EMPLOYEE_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: 'OK',
    showCancel: false
  });

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/employees");
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response?.status === 400) {
        setEmployees([]);
      } else {
        setError("Couldn't load employees. Please refresh and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        emp.employeeName?.toLowerCase().includes(query) ||
        emp.employeePosition?.toLowerCase().includes(query) ||
        emp.employeeEmail?.toLowerCase().includes(query);
      const matchesDept = selectedDept === 'All Departments' || emp.employeeDepartment === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchQuery, selectedDept]);

  const departmentStats = useMemo(() => {
    return Object.keys(DEPARTMENT_META).map((name) => {
      const count = employees.filter((e) => e.employeeDepartment === name).length;
      const progress = employees.length ? Math.round((count / employees.length) * 100) : 0;
      return { name, count, progress: `${progress}%`, ...DEPARTMENT_META[name] };
    });
  }, [employees]);

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEmployees.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEmployees, currentPage]);

  const openAddModal = () => {
    setEditingEmployeeId(null);
    setForm(EMPTY_EMPLOYEE_FORM);
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setEditingEmployeeId(emp.employeeId);
    setForm({
      employeeName: emp.employeeName || '',
      employeePosition: emp.employeePosition || '',
      employeeDepartment: emp.employeeDepartment || 'Engineering',
      employeeEmail: emp.employeeEmail || '',
      employeeStatus: emp.employeeStatus || 'ACTIVE',
    });
    setImageFile(null);
    setImagePreview(emp.employeeImage || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingEmployeeId(null);
    setForm(EMPTY_EMPLOYEE_FORM);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.employeeName.trim() || !form.employeeEmail.trim()) return;
    if (!editingEmployeeId && !imageFile) {
      setError("Please choose a photo for this employee.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => fd.append(key, value));
      if (imageFile) fd.append("employeeImage", imageFile);

      if (editingEmployeeId) {
        const res = await axiosInstance.put(`/employees/${editingEmployeeId}`, fd, multipartConfig);
        setEmployees((prev) => prev.map((emp) => (emp.employeeId === editingEmployeeId ? res.data : emp)));
      } else {
        const res = await axiosInstance.post("/employees", fd, multipartConfig);
        setEmployees((prev) => [res.data, ...prev]);
      }
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to save employee.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (employeeId) => {
    setAlertConfig({
      isOpen: true,
      title: 'Confirm Delete',
      message: 'Are you sure you want to remove this employee?',
      type: 'warning',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: async () => {
        setError(null);
        try {
          await axiosInstance.delete(`/employees/${employeeId}`);
          setEmployees((prev) => prev.filter((emp) => emp.employeeId !== employeeId));
        } catch {
          setError("Failed to remove the employee.");
        }
      }
    });
  };

  const exportToCSV = () => {
    const headers = ["ID,Name,Position,Department,Email,Status\n"];
    const rows = filteredEmployees.map(e => `${e.employeeId},"${e.employeeName}","${e.employeePosition}","${e.employeeDepartment}","${e.employeeEmail}",${e.employeeStatus}`);
    const blob = new Blob([headers.concat(rows.join("\n")).join("")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-members.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Team Management</h3>
          <p className="text-xs text-gray-500 mt-1">Manage organization members, roles, and status across departments.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center justify-center gap-2 bg-[#72efdd] hover:bg-[#52e3d0] text-[#0b0f17] px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer">
          <UserPlus size={14} /> Add Employee
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
          <div className="flex items-center gap-2"><AlertCircle size={14} /><span>{error}</span></div>
          <button onClick={() => setError(null)} aria-label="Dismiss"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3 text-xs">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border w-full sm:flex-1 ${isDarkMode ? 'bg-[#0f1422] border-[#1e2640]' : 'bg-white border-gray-200'}`}>
          <Search size={14} className="text-gray-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, position or email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="bg-transparent border-none p-0 w-full focus:ring-0 placeholder-gray-600 text-gray-300 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={selectedDept}
            onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(1); }}
            className={`px-3 py-2 rounded-lg border font-medium focus:ring-0 cursor-pointer ${isDarkMode ? 'bg-[#0f1422] border-[#1e2640] text-gray-300' : 'bg-white border-gray-200 text-gray-700'}`}
          >
            {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>

          <button onClick={exportToCSV} aria-label="Export to CSV"
            className={`p-2 rounded-lg border transition-all cursor-pointer ${isDarkMode ? 'bg-[#0f1422] border-[#1e2640] text-gray-400 hover:text-white' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            <Download size={14} />
          </button>
        </div>
      </div>

      <div className={`rounded-xl border overflow-hidden transition-colors w-full ${isDarkMode ? 'bg-[#0f1422] border-[#1e2640]' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left min-w-[800px]">
            <thead>
              <tr className={`border-b text-[10px] uppercase font-bold tracking-wider text-gray-500 ${isDarkMode ? 'bg-[#131a2e] border-[#1e2640]' : 'bg-gray-50 border-gray-200'}`}>
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
              {loading ? (
                <tr><td colSpan="7" className="py-12 text-center text-gray-500 text-xs">
                  <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading team...</span>
                </td></tr>
              ) : paginatedEmployees.length === 0 ? (
                <tr><td colSpan="7" className="py-12 text-center text-gray-500 text-xs">No matching team members found.</td></tr>
              ) : (
                paginatedEmployees.map((emp) => (
                  <tr key={emp.employeeId} className={`transition-colors ${isDarkMode ? 'hover:bg-[#141b2d]' : 'hover:bg-gray-50'}`}>
                    <td className="py-4 px-6">
                      <img src={emp.employeeImage} alt={emp.employeeName} className="w-8 h-8 object-cover rounded-full border border-[#222f54]" />
                    </td>
                    <td className={`py-4 px-6 font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{emp.employeeName}</td>
                    <td className={`py-4 px-6 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{emp.employeePosition}</td>
                    <td className={`py-4 px-6 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{emp.employeeDepartment}</td>
                    <td className="py-4 px-6 text-xs font-mono text-gray-500">{emp.employeeEmail}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold ${
                        emp.employeeStatus === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {emp.employeeStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-gray-500">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(emp)} className="p-1 rounded hover:text-cyan-400 transition-colors cursor-pointer" aria-label="Edit employee"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(emp.employeeId)} className="p-1 rounded hover:text-rose-400 transition-colors cursor-pointer" aria-label="Delete employee"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={`p-4 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-gray-500 border-t ${isDarkMode ? 'bg-[#131a2e]/60 border-[#1e2640]' : 'bg-gray-50 border-gray-200'}`}>
          <div>
            Showing <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>
              {filteredEmployees.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredEmployees.length)}
            </span> of <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>{filteredEmployees.length}</span> entries
          </div>
          <div className="flex gap-1 items-center">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-[#222f54] text-gray-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
              <ChevronLeft size={14} />
            </button>
            <span className="px-3 py-1 text-xs font-semibold text-gray-300">{currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded border border-[#222f54] text-gray-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h4 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Department Distribution</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {departmentStats.map((dept) => <DepartmentCard key={dept.name} dept={dept} isDarkMode={isDarkMode} />)}
        </div>
      </div>

      {isModalOpen && (
        <EmployeeModal
          isDarkMode={isDarkMode}
          editingEmployeeId={editingEmployeeId}
          form={form}
          setForm={setForm}
          onClose={closeModal}
          onSave={handleSave}
          isSaving={isSaving}
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
        />
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        showCancel={alertConfig.showCancel}
        onConfirm={alertConfig.onConfirm}
      />
    </div>
  );
}

function DepartmentCard({ dept, isDarkMode }) {
  const Icon = dept.icon;
  const colorMap = {
    cyan: 'bg-cyan-500/10 text-cyan-400 bg-cyan-400',
    emerald: 'bg-emerald-500/10 text-emerald-400 bg-emerald-400',
    indigo: 'bg-indigo-500/10 text-indigo-400 bg-indigo-400',
    amber: 'bg-amber-500/10 text-amber-400 bg-amber-400',
  };
  const [bgAlpha, textColor, barBg] = colorMap[dept.color].split(' ');

  return (
    <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-[#0f1422] border-[#1e2640]' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${bgAlpha} ${textColor}`}><Icon size={16} /></div>
        <span className={`text-[10px] ${textColor} font-semibold bg-white/5 px-2 py-0.5 rounded-full`}>{dept.progress} of team</span>
      </div>
      <div className="mt-4">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{dept.name}</p>
        <h5 className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{dept.count}</h5>
      </div>
      <div className="w-full bg-gray-800 h-1 rounded-full mt-3 overflow-hidden">
        <div className={`${barBg} h-full`} style={{ width: dept.progress }} />
      </div>
    </div>
  );
}

function EmployeeModal({ isDarkMode, editingEmployeeId, form, setForm, onClose, onSave, isSaving, imagePreview, onImageChange }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className={`w-full max-w-lg rounded-xl border p-6 space-y-4 shadow-2xl relative ${isDarkMode ? 'bg-[#0f1422] border-[#1e2640] text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}>
        <div className="flex items-center justify-between pb-2 border-b border-gray-700/50">
          <h4 className="text-lg font-bold">{editingEmployeeId ? "Edit Employee" : "Add New Employee"}</h4>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors cursor-pointer" aria-label="Close modal"><X size={18} /></button>
        </div>

        <form onSubmit={onSave} className="grid grid-cols-2 gap-4 text-xs">
          <div className="col-span-2 space-y-1">
            <label className="text-gray-400 font-medium">Photo</label>
            <div className="flex items-center gap-3">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-14 w-14 rounded-full object-cover border border-[#222f54]" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-[#222f54] text-gray-600">
                  <ImagePlus size={18} />
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#222f54] px-3 py-2 text-xs font-medium text-gray-300 hover:bg-[#1a233a]">
                <ImagePlus size={14} />
                {imagePreview ? "Replace photo" : "Upload photo"}
                <input type="file" accept="image/*" onChange={onImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-gray-400 font-medium">Full Name</label>
            <input type="text" required value={form.employeeName}
              onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
              placeholder="e.g. Alex Thorne"
              className={`w-full p-2.5 rounded-lg border bg-transparent focus:ring-0 focus:outline-none ${isDarkMode ? 'border-[#1e2640] text-white' : 'border-gray-300 text-gray-900'}`} />
          </div>

          <div className="space-y-1">
            <label className="text-gray-400 font-medium">Position / Role</label>
            <input type="text" required value={form.employeePosition}
              onChange={(e) => setForm({ ...form, employeePosition: e.target.value })}
              placeholder="e.g. Lead Developer"
              className={`w-full p-2.5 rounded-lg border bg-transparent focus:ring-0 focus:outline-none ${isDarkMode ? 'border-[#1e2640] text-white' : 'border-gray-300 text-gray-900'}`} />
          </div>

          <div className="space-y-1">
            <label className="text-gray-400 font-medium">Department</label>
            <select value={form.employeeDepartment} onChange={(e) => setForm({ ...form, employeeDepartment: e.target.value })}
              className={`w-full p-2.5 rounded-lg border focus:ring-0 focus:outline-none ${isDarkMode ? 'bg-[#0f1422] border-[#1e2640] text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
              {DEPARTMENTS.filter(d => d !== 'All Departments').map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-gray-400 font-medium">Email Address</label>
            <input type="email" required value={form.employeeEmail}
              onChange={(e) => setForm({ ...form, employeeEmail: e.target.value })}
              placeholder="a.thorne@evocodes.ai"
              className={`w-full p-2.5 rounded-lg border bg-transparent focus:ring-0 focus:outline-none ${isDarkMode ? 'border-[#1e2640] text-white' : 'border-gray-300 text-gray-900'}`} />
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-gray-400 font-medium">Status</label>
            <select value={form.employeeStatus} onChange={(e) => setForm({ ...form, employeeStatus: e.target.value })}
              className={`w-full p-2.5 rounded-lg border focus:ring-0 focus:outline-none ${isDarkMode ? 'bg-[#0f1422] border-[#1e2640] text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ON LEAVE">ON LEAVE</option>
            </select>
          </div>

          <div className="col-span-2 flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 rounded-lg border border-gray-700 text-xs font-medium hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#72efdd] text-[#0b0f17] text-xs font-bold hover:bg-[#52e3d0] transition-colors cursor-pointer disabled:opacity-50">
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              Save Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}