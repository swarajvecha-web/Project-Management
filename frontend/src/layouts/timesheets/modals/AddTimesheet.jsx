import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import axios from 'axios';

function AddTimesheetModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const [employeesData, setEmployeesData] = useState([]);
    const [projectsData, setProjectsData] = useState([]);
    const [tasksData, setTasksData] = useState([]);
    
    const [formData, setFormData] = useState({
        notes: '',
        employee: '',
        project: '',
        task: '',
        progress: '',
        timeSpent: '',
        date: '',
        type: 'Development'
    });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const getEmployees = async () => {
        try {
            const response = await axios.get('api/employees');
            setEmployeesData(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const getProjects = async () => {
        try {
            const response = await axios.get('api/projects');
            setProjectsData(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const getTasks = async () => {
        try {
            const response = await axios.get('api/tasks');
            setTasksData(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        getEmployees();
        getProjects();
        getTasks();
    }, []);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleTypeClick = (type) => {
        setFormData({ ...formData, type });
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
            const response = await axiosInstance.post('/api/timesheet', formData);
            setFormData({
                notes: '',
                employee: '',
                project: '',
                task: '',
                progress: '',
                timeSpent: '',
                date: '',
                type: 'Development'
            });
            setSuccessMsg(response.data.message || 'Timesheet added successfully!');
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
                    <h2 className="text-xl font-bold text-foreground">Log Time</h2>
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
                    
                    <form id="add-timesheet-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Employee *</label>
                                <select required name="employee" value={formData.employee} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none">
                                    <option value="" disabled>Select Employee</option>
                                    {employeesData.map(emp => (
                                        <option key={emp._id} value={emp._id}>{`${emp.firstName} ${emp.lastName}`}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Project *</label>
                                <select required name="project" value={formData.project} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none">
                                    <option value="" disabled>Select Project</option>
                                    {projectsData.map(proj => (
                                        <option key={proj._id} value={proj._id}>{proj.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Task *</label>
                                <select required name="task" value={formData.task} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none">
                                    <option value="" disabled>Select Task</option>
                                    {tasksData.map(task => (
                                        <option key={task._id} value={task._id}>{task.title}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Time Spent (hours) *</label>
                                <input required type="number" step="0.5" name="timeSpent" value={formData.timeSpent} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none" placeholder="e.g. 2.5" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Progress % *</label>
                                <input required type="number" min="0" max="100" name="progress" value={formData.progress} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none" placeholder="e.g. 50" />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Date *</label>
                                <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none" />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Notes *</label>
                                <textarea required rows={3} name="notes" value={formData.notes} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none resize-none" placeholder="What did you work on?" />
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="block text-sm font-semibold text-sidebar-foreground mb-2">Work Type</label>
                            <div className="flex flex-wrap gap-2">
                                {['Development', 'Testing', 'Other'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleTypeClick(type)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                                            formData.type === type 
                                                ? type === 'Development' ? 'bg-blue-500 border-blue-500 text-white' 
                                                : type === 'Testing' ? 'bg-yellow-500 border-yellow-500 text-white'
                                                : 'bg-gray-500 border-gray-500 text-white'
                                                : 'bg-transparent border-border text-sidebar-foreground hover:bg-secondary'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
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
                        form="add-timesheet-form"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium bg-atlassian-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : 'Log Time'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddTimesheetModal;
