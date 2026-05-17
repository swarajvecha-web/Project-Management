import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

function AddTaskModal({ isOpen, onClose, taskToEdit }) {
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [employeesData, setEmployeesData] = useState([]);
    const [projectsData, setProjectsData] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignTo: '',
        project: '',
        startDate: new Date().toISOString().split('T')[0],
        priority: 'Important',
        storyPoints: 1,
        epicName: '',
        epicColor: '#DFE1E6'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const token = localStorage.getItem("tm_token");
    const axiosInstance = axios.create({
        baseURL: process.env.REACT_APP_API_URL,
        headers: { Authorization: `Bearer ${token}` },
    });

    useEffect(() => {
        if (isOpen) {
            axiosInstance.get('api/employees').then(res => setEmployeesData(res.data)).catch(console.error);
            axiosInstance.get('api/projects').then(res => setProjectsData(res.data)).catch(console.error);
            
            if (taskToEdit) {
                setFormData({
                    title: taskToEdit.title || '',
                    description: taskToEdit.description || '',
                    assignTo: typeof taskToEdit.assignTo === 'object' ? taskToEdit.assignTo._id : (taskToEdit.assignTo || ''),
                    project: typeof taskToEdit.project === 'object' ? taskToEdit.project._id : (taskToEdit.project || ''),
                    startDate: taskToEdit.startDate ? new Date(taskToEdit.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    priority: taskToEdit.priority || 'Important',
                    storyPoints: taskToEdit.storyPoints || 1,
                    epicName: taskToEdit.epicName || '',
                    epicColor: taskToEdit.epicColor || '#DFE1E6'
                });
            } else {
                setFormData({
                    title: '', description: '', assignTo: '', project: '', startDate: new Date().toISOString().split('T')[0], priority: 'Important', storyPoints: 1, epicName: '', epicColor: '#DFE1E6'
                });
            }
        }
    }, [isOpen, taskToEdit]);

    const handleAiSuggest = async () => {
        if (!formData.title.trim()) return toast.warning('Please enter a task title first!');
        setAiLoading(true);
        try {
            const res = await axiosInstance.post('/api/ai/suggest', { title: formData.title });
            if (res.data) {
                setFormData(prev => ({
                    ...prev,
                    description:  res.data.description  || prev.description,
                    priority:     res.data.priority     || prev.priority,
                    storyPoints:  res.data.storyPoints  || prev.storyPoints,
                    epicName:     res.data.label        || prev.epicName,
                    epicColor:    '#8777D9',
                }));
                toast.success('AI suggestion applied!');
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'AI suggestion failed. Please try again.';
            console.error('[AI Suggest] Error:', msg);
            toast.error(msg);
        } finally {
            setAiLoading(false);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const isEdit = !!taskToEdit;
            if (isEdit) {
                await axiosInstance.put(`/api/task/${taskToEdit._id}`, formData);
            } else {
                await axiosInstance.post('/api/task', formData);
            }
            setFormData({
                title: '', description: '', assignTo: '', project: '', startDate: new Date().toISOString().split('T')[0], priority: 'Important', storyPoints: 1, epicName: '', epicColor: '#DFE1E6'
            });
            onClose();
            toast.success(taskToEdit ? "Task updated successfully!" : "Task created successfully!");
        } catch (error) {
            console.error('Error adding task', error);
            toast.error("Failed to add task.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/40 z-[100]" onClick={onClose} />
            
            <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
                <div className="bg-background w-full max-w-2xl rounded-lg shadow-xl flex flex-col pointer-events-auto max-h-[90vh]">
                    
                    <div className="flex justify-between items-center px-6 py-4 border-b border-border">
                        <h2 className="text-xl font-bold text-foreground">{taskToEdit ? 'Edit issue' : 'Create issue'}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-atlassian-hover rounded-md text-sidebar-foreground"><X size={20}/></button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                        
                        <div>
                            <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Title <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <input required type="text" name="title" value={formData.title} onChange={handleChange} className="flex-1 bg-sidebar border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-atlassian-blue focus:outline-none" />
                                <button type="button" onClick={handleAiSuggest} disabled={aiLoading} className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50">
                                    {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                    AI Suggest
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Description <span className="text-red-500">*</span></label>
                            <textarea required rows={5} name="description" value={formData.description} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-atlassian-blue focus:outline-none resize-y" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Project <span className="text-red-500">*</span></label>
                                <select required name="project" value={formData.project} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-atlassian-blue focus:outline-none">
                                    <option value="" disabled>Select Project</option>
                                    {projectsData.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Assignee <span className="text-red-500">*</span></label>
                                <select required name="assignTo" value={formData.assignTo} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-atlassian-blue focus:outline-none">
                                    <option value="" disabled>Select Assignee</option>
                                    {employeesData.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Priority</label>
                                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-atlassian-blue focus:outline-none">
                                    <option value="Least Important">Least Important</option>
                                    <option value="Important">Important</option>
                                    <option value="Most Important">Most Important</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Story Points</label>
                                <input type="number" name="storyPoints" value={formData.storyPoints} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-atlassian-blue focus:outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Epic / Label Name</label>
                                <input type="text" name="epicName" value={formData.epicName} onChange={handleChange} placeholder="e.g. Frontend" className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-atlassian-blue focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Epic Color</label>
                                <input type="color" name="epicColor" value={formData.epicColor} onChange={handleChange} className="w-full h-9 bg-sidebar border border-border rounded-md px-1 py-1 focus:ring-2 focus:ring-atlassian-blue focus:outline-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-sidebar-foreground mb-1">Start Date <span className="text-red-500">*</span></label>
                            <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-atlassian-blue focus:outline-none" />
                        </div>

                    </form>

                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
                        <button type="button" onClick={onClose} className="px-4 py-2 hover:bg-atlassian-hover text-foreground rounded-md text-sm font-medium transition-colors">Cancel</button>
                        <button type="button" onClick={handleSubmit} disabled={loading} className="bg-atlassian-blue hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50">
                            {loading ? 'Saving...' : taskToEdit ? 'Update' : 'Create'}
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}

export default AddTaskModal;
