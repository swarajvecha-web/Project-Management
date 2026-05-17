import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import axios from 'axios';

function AddProjectModal({ isOpen, onClose, projectToEdit }) {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        clientName: '',
        startDate: '',
        status: 'On Hold',
        priority: 'Most Important'
    });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            if (projectToEdit) {
                setFormData({
                    title: projectToEdit.title || '',
                    description: projectToEdit.description || '',
                    clientName: projectToEdit.clientName || '',
                    startDate: projectToEdit.startDate ? new Date(projectToEdit.startDate).toISOString().split('T')[0] : '',
                    status: projectToEdit.status || 'On Hold',
                    priority: projectToEdit.priority || 'Most Important'
                });
            } else {
                setFormData({
                    title: '', description: '', clientName: '', startDate: '', status: 'On Hold', priority: 'Most Important'
                });
            }
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, projectToEdit]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStatusClick = (status) => {
        setFormData({ ...formData, status });
    };

    const handleTagClick = (priority) => {
        setFormData({ ...formData, priority });
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
            const isEdit = !!projectToEdit;
            const response = isEdit 
                ? await axiosInstance.put(`/api/project/${projectToEdit._id}`, formData)
                : await axiosInstance.post('/api/project', formData);
                
            setFormData({
                title: '',
                description: '',
                clientName: '',
                startDate: '',
                status: 'On Hold',
                priority: 'Most Important'
            });
            setSuccessMsg(response.data.message || 'Project added successfully!');
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
                    <h2 className="text-xl font-bold text-foreground">{projectToEdit ? 'Edit Project' : 'Add New Project'}</h2>
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
                    
                    <form id="add-project-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Project Title *</label>
                            <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none" placeholder="e.g. Website Redesign" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Description *</label>
                            <textarea required rows={4} name="description" value={formData.description} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none resize-none" placeholder="Describe the project goals and scope..." />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Client Name *</label>
                                <input required type="text" name="clientName" value={formData.clientName} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none" placeholder="e.g. Acme Corp" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Start Date *</label>
                                <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-2">Status</label>
                                <div className="flex flex-wrap gap-2">
                                    {['On Hold', 'In Progress', 'Testing', 'Completed'].map(stat => (
                                        <button
                                            key={stat}
                                            type="button"
                                            onClick={() => handleStatusClick(stat)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                                                formData.status === stat 
                                                    ? stat === 'Completed' ? 'bg-green-500 border-green-500 text-white' 
                                                    : stat === 'In Progress' ? 'bg-blue-500 border-blue-500 text-white'
                                                    : stat === 'Testing' ? 'bg-yellow-500 border-yellow-500 text-white'
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
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-2">Priority</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Most Important', 'Important', 'Moderate'].map(prio => (
                                        <button
                                            key={prio}
                                            type="button"
                                            onClick={() => handleTagClick(prio)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                                                formData.priority === prio 
                                                    ? prio === 'Most Important' ? 'bg-red-500 border-red-500 text-white'
                                                    : prio === 'Important' ? 'bg-yellow-500 border-yellow-500 text-white'
                                                    : 'bg-green-500 border-green-500 text-white'
                                                    : 'bg-transparent border-border text-sidebar-foreground hover:bg-secondary'
                                            }`}
                                        >
                                            {prio}
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
                        form="add-project-form"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium bg-atlassian-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : projectToEdit ? 'Update Project' : 'Add Project'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddProjectModal;
