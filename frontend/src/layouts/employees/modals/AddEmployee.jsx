import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import axios from 'axios';

function AddEmployeeModal({ isOpen, onClose, employeeToEdit }) {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const [formData, setFormData] = useState({
        employee_id: '1',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        residentialAddress: '',
        cnic: '',
        role: '',
        dateOfBirth: '',
        startDate: '',
        status: 'Active',
        gender: 'Male'
    });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            if (employeeToEdit) {
                setFormData({
                    employee_id: employeeToEdit.employee_id || '',
                    firstName: employeeToEdit.firstName || '',
                    lastName: employeeToEdit.lastName || '',
                    email: employeeToEdit.email || '',
                    phone: employeeToEdit.phone || '',
                    residentialAddress: employeeToEdit.residentialAddress || '',
                    cnic: employeeToEdit.cnic || '',
                    role: employeeToEdit.role || '',
                    dateOfBirth: employeeToEdit.dateOfBirth ? new Date(employeeToEdit.dateOfBirth).toISOString().split('T')[0] : '',
                    startDate: employeeToEdit.startDate ? new Date(employeeToEdit.startDate).toISOString().split('T')[0] : '',
                    status: employeeToEdit.status || 'Active',
                    gender: employeeToEdit.gender || 'Male'
                });
            } else {
                setFormData({
                    employee_id: '1', firstName: '', lastName: '', email: '', phone: '', residentialAddress: '', cnic: '', role: '', dateOfBirth: '', startDate: '', status: 'Active', gender: 'Male'
                });
            }
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, employeeToEdit]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStatusClick = (status) => {
        setFormData({ ...formData, status });
    };

    const handleGenderClick = (gender) => {
        setFormData({ ...formData, gender });
    };

    const token = localStorage.getItem("tm_token");
    const axiosInstance = axios.create({
        baseURL: process.env.REACT_APP_API_URL,
        headers: {
            Authorization: `Bearer ${token}`
        },
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const isEdit = !!employeeToEdit;
            const response = isEdit 
                ? await axiosInstance.put(`/api/employee/${employeeToEdit._id}`, formData)
                : await axiosInstance.post('/api/employee', formData);
            setFormData({
                employee_id: '1',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                residentialAddress: '',
                cnic: '',
                role: '',
                dateOfBirth: '',
                startDate: '',
                status: 'Active',
                gender: 'Male'
            });
            setSuccessMsg(response.data.message || 'Employee added successfully!');
            setTimeout(() => {
                setSuccessMsg('');
                setLoading(false);
                onClose();
            }, 1500);
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Server error. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-background rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-sidebar">
                    <h2 className="text-xl font-bold text-foreground">{employeeToEdit ? 'Edit Employee' : 'Add New Employee'}</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-secondary rounded-md text-sidebar-foreground transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
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
                    
                    <form id="add-employee-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">First Name *</label>
                                <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none" placeholder="e.g. John" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Last Name *</label>
                                <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none" placeholder="e.g. Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Email *</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none" placeholder="john@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Phone *</label>
                                <input required type="number" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none" placeholder="1234567890" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Residential Address *</label>
                                <input required type="text" name="residentialAddress" value={formData.residentialAddress} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none" placeholder="123 Main St, City" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">CNIC *</label>
                                <input required type="text" name="cnic" value={formData.cnic} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none" placeholder="ID Number" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Role *</label>
                                <input required type="text" name="role" value={formData.role} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none" placeholder="e.g. Developer" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Date of Birth *</label>
                                <input required type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Start Date *</label>
                                <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none" />
                            </div>
                        </div>

                        <div className="pt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-2">Status</label>
                                <div className="flex gap-2">
                                    {['Active', 'In Active', 'Terminated'].map(stat => (
                                        <button
                                            key={stat}
                                            type="button"
                                            onClick={() => handleStatusClick(stat)}
                                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                                                formData.status === stat 
                                                    ? stat === 'Active' ? 'bg-green-500 border-green-500 text-white' 
                                                    : stat === 'In Active' ? 'bg-yellow-500 border-yellow-500 text-white'
                                                    : 'bg-red-500 border-red-500 text-white'
                                                    : 'bg-transparent border-border text-sidebar-foreground hover:bg-secondary'
                                            }`}
                                        >
                                            {stat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-2">Gender</label>
                                <div className="flex gap-2">
                                    {['Male', 'Female'].map(gen => (
                                        <button
                                            key={gen}
                                            type="button"
                                            onClick={() => handleGenderClick(gen)}
                                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                                                formData.gender === gen 
                                                    ? 'bg-atlassian-blue border-atlassian-blue text-white'
                                                    : 'bg-transparent border-border text-sidebar-foreground hover:bg-secondary'
                                            }`}
                                        >
                                            {gen}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </form>
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
                        form="add-employee-form"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium bg-atlassian-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : employeeToEdit ? 'Update Employee' : 'Add Employee'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddEmployeeModal;
