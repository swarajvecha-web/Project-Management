import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import axios from 'axios';

/**
 * AddAttendanceModal
 *  - No props     → create mode (Mark Attendance)
 *  - attendanceToEdit prop → edit mode (pre-fills Employee, Time In, Time Out)
 */
function AddAttendanceModal({ isOpen, onClose, attendanceToEdit = null }) {
    const isEditMode = Boolean(attendanceToEdit);

    const [loading, setLoading]           = useState(false);
    const [errorMsg, setErrorMsg]         = useState('');
    const [successMsg, setSuccessMsg]     = useState('');
    const [employeesData, setEmployeesData] = useState([]);

    // Create mode fields
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [attendanceType, setAttendanceType]     = useState('');

    // Edit mode fields
    const [editTimeIn, setEditTimeIn]   = useState('');
    const [editTimeOut, setEditTimeOut] = useState('');
    const [editDay, setEditDay]         = useState('');

    const token = localStorage.getItem('tm_token');
    const axiosInstance = axios.create({
        baseURL: process.env.REACT_APP_API_URL,
        headers: { Authorization: `Bearer ${token}` },
    });

    /* ── Close on Escape ── */
    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    /* ── Fetch employees (needed for create mode) ── */
    useEffect(() => {
        axios.get('api/employees')
            .then(r => setEmployeesData(r.data))
            .catch(e => console.error('Error fetching employees:', e));
    }, []);

    /* ── Pre-fill fields when in edit mode ── */
    useEffect(() => {
        if (isEditMode && attendanceToEdit) {
            setEditTimeIn(attendanceToEdit.timeIn || '');
            setEditTimeOut(attendanceToEdit.timeOut || '');
            // Normalize stored day string to YYYY-MM-DD for <input type="date">
            const raw = attendanceToEdit.day;
            if (raw) {
                const d = new Date(raw);
                if (!isNaN(d.getTime())) {
                    setEditDay(d.toISOString().split('T')[0]);
                } else {
                    setEditDay('');
                }
            }
        }
    }, [attendanceToEdit, isEditMode]);

    /* ── Reset state when modal closes ── */
    useEffect(() => {
        if (!isOpen) {
            setErrorMsg('');
            setSuccessMsg('');
            setSelectedEmployee('');
            setAttendanceType('');
        }
    }, [isOpen]);

    const getCurrentDate = () => {
        const d = new Date();
        return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
    };

    const getCurrentTime = () => {
        const d = new Date();
        return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
    };

    /* ── Create submit ── */
    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const response = await axiosInstance.post('/api/attendance', {
                employeeId: selectedEmployee,
                day: getCurrentDate(),
                timeIn:  attendanceType === 'time_in'  ? getCurrentTime() : null,
                timeOut: attendanceType === 'time_out' ? getCurrentTime() : null,
            });
            setSuccessMsg(response.data.message || 'Attendance logged successfully!');
            setTimeout(() => { setLoading(false); onClose(); }, 1500);
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Server error. Please try again.');
            setLoading(false);
        }
    };

    /* ── Edit submit ── */
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            await axiosInstance.put(`/api/attendance/${attendanceToEdit._id}`, {
                timeIn:  editTimeIn  || undefined,
                timeOut: editTimeOut || undefined,
                day: editDay || undefined,
            });
            setSuccessMsg('Attendance updated successfully!');
            setTimeout(() => { setLoading(false); onClose(); }, 1400);
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Failed to update. Please try again.');
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/55 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-background rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-border z-10">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-sidebar">
                    <h2 className="text-lg font-bold text-foreground">
                        {isEditMode ? 'Edit Attendance Record' : 'Mark Attendance'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-md text-sidebar-foreground transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {errorMsg && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-sm">
                            {errorMsg}
                        </div>
                    )}
                    {successMsg && (
                        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-md text-sm flex items-center gap-2">
                            <Check size={16} /> {successMsg}
                        </div>
                    )}

                    {isEditMode ? (
                        /* ── EDIT FORM ── */
                        <form id="attendance-form" onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Date</label>
                                <input
                                    type="date"
                                    value={editDay}
                                    onChange={(e) => setEditDay(e.target.value)}
                                    className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Time In</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 9:00 AM"
                                    value={editTimeIn}
                                    onChange={(e) => setEditTimeIn(e.target.value)}
                                    className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Time Out</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 5:30 PM"
                                    value={editTimeOut}
                                    onChange={(e) => setEditTimeOut(e.target.value)}
                                    className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none font-mono"
                                />
                            </div>
                        </form>
                    ) : (
                        /* ── CREATE FORM ── */
                        <form id="attendance-form" onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Employee *</label>
                                <select
                                    required
                                    value={selectedEmployee}
                                    onChange={(e) => setSelectedEmployee(e.target.value)}
                                    className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none"
                                >
                                    <option value="" disabled>Select Employee</option>
                                    {employeesData.map(emp => (
                                        <option key={emp._id} value={emp._id}>
                                            {emp.firstName} {emp.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Action *</label>
                                <select
                                    required
                                    value={attendanceType}
                                    onChange={(e) => setAttendanceType(e.target.value)}
                                    className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none"
                                >
                                    <option value="" disabled>Select Action</option>
                                    <option value="time_in">Time In</option>
                                    <option value="time_out">Time Out</option>
                                </select>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-sidebar">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="attendance-form"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium bg-atlassian-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Saving…' : isEditMode ? 'Save Changes' : 'Mark Attendance'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddAttendanceModal;
