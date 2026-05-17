import React, { useEffect, useState } from 'react';
import { X, Trash2, Calendar, Target, Activity, AlertTriangle } from 'lucide-react';

function ReadProjectModal({ isOpen, onClose, project, onDelete, onUpdateStatus }) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !project) return null;

    // Reset state when closing
    if (isOpen === false && showDeleteConfirm) setShowDeleteConfirm(false);

    const getPriorityColor = (priority) => {
        switch(priority?.toLowerCase()) {
            case 'most important': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'important': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            default: return 'bg-green-500/10 text-green-500 border-green-500/20';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-sidebar">
                    <h2 className="text-xl font-bold text-foreground truncate flex-1 pr-4">{project.title}</h2>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-2 hover:bg-red-500/10 text-red-500 rounded-md transition-colors"
                            title="Delete Project"
                        >
                            <Trash2 size={18} />
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-secondary rounded-md text-sidebar-foreground transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
                    {/* Delete Confirmation Overlay */}
                    {showDeleteConfirm && (
                        <div className="absolute inset-0 z-10 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Delete Project?</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Are you sure you want to delete <strong>{project.title}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex items-center gap-3 w-full">
                                <button 
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-2 bg-secondary text-foreground font-medium rounded-md hover:bg-secondary/80 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        onDelete(project._id);
                                    }}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <h3 className="text-sm font-semibold text-sidebar-foreground mb-2 flex items-center gap-2">
                            <Target size={16} /> Description
                        </h3>
                        <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap bg-sidebar p-4 rounded-md border border-border">
                            {project.description || 'No description provided.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-semibold text-sidebar-foreground mb-2 flex items-center gap-2">
                                <Activity size={16} /> Status
                            </h3>
                            <select 
                                value={project.status || 'On Hold'} 
                                onChange={(e) => onUpdateStatus(project._id, e.target.value)}
                                className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-atlassian-blue focus:outline-none"
                            >
                                <option value="On Hold">On Hold</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Testing">Testing</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-sidebar-foreground mb-2">Priority</h3>
                            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getPriorityColor(project.priority)}`}>
                                {project.priority}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-sidebar-foreground mb-2">Client Name</h3>
                        <p className="text-foreground font-medium text-sm">
                            {project.clientName || 'N/A'}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-sidebar-foreground mb-2 flex items-center gap-2">
                            <Calendar size={16} /> Start Date
                        </h3>
                        <p className="text-foreground text-sm">
                            {project.startDate ? new Date(project.startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReadProjectModal;
