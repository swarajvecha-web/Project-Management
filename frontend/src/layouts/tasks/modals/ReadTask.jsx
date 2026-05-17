import React, { useState, useEffect } from 'react';
import { X, Activity, Link as LinkIcon, Paperclip, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Avatar from '../../../components/common/Avatar';
import DropdownMenu from '../../../components/common/DropdownMenu';

function ReadTaskDrawer({ isOpen, onClose, task, onDelete, onUpdateStatus, onUpdateTask, onEdit }) {
    const [commentText, setCommentText] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');
    const [isPostingComment, setIsPostingComment] = useState(false);

    // Handle closing on overlay click or Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleAddComment = async () => {
        if (!commentText.trim()) return;
        setIsPostingComment(true);
        try {
            const res = await axios.post(`api/task/${task._id}/comment`, {
                text: commentText
            });
            if (onUpdateTask) {
                onUpdateTask(res.data);
            }
            setCommentText('');
            toast.success("Comment added!");
        } catch (error) {
            console.error('Failed to add comment', error);
            toast.error("Failed to add comment.");
        } finally {
            setIsPostingComment(false);
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editingCommentText.trim()) return;
        try {
            const res = await axios.put(`api/task/${task._id}/comment/${commentId}`, {
                text: editingCommentText
            });
            if (onUpdateTask) onUpdateTask(res.data);
            setEditingCommentId(null);
            setEditingCommentText('');
            toast.success("Comment updated!");
        } catch (error) {
            console.error('Failed to edit comment', error);
            toast.error(error.response?.data?.message || "Failed to edit comment.");
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            const res = await axios.delete(`api/task/${task._id}/comment/${commentId}`);
            if (onUpdateTask) onUpdateTask(res.data);
            toast.success("Comment deleted!");
        } catch (error) {
            console.error('Failed to delete comment', error);
            toast.error(error.response?.data?.message || "Failed to delete comment.");
        }
    };

    if (!isOpen || !task) return null;

    const priorityColor = task.priority === 'Most Important' ? 'text-red-500' : task.priority === 'Important' ? 'text-yellow-500' : 'text-blue-500';

    return (
        <>
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black/40 z-[100] transition-opacity"
                onClick={onClose}
            />
            
            {/* Drawer Container */}
            <div className={`fixed right-0 top-0 h-full w-[600px] bg-background shadow-2xl z-[101] transform transition-transform duration-300 flex flex-col border-l border-border
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
                    <div className="flex items-center gap-4 text-sm font-medium text-sidebar-foreground">
                        <span className="hover:underline cursor-pointer">TF-{task._id.substring(task._id.length - 4).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => toast.info("Task linking coming soon!")} className="p-2 hover:bg-atlassian-hover rounded-md text-sidebar-foreground transition-colors"><LinkIcon size={18} /></button>
                        <DropdownMenu 
                            actions={[
                                { label: 'Edit', icon: Edit2, onClick: () => { onClose(); if(onEdit) onEdit(); } },
                                { label: 'Delete', icon: Trash2, onClick: () => onDelete(task._id), color: 'text-red-500' }
                            ]}
                            horizontal
                        />
                        <button onClick={onClose} className="p-2 hover:bg-atlassian-hover rounded-md text-sidebar-foreground transition-colors ml-2"><X size={20} /></button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {/* Title */}
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-4">{task.title}</h1>
                        
                        {/* Quick Actions / Buttons */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <button onClick={() => toast.info("Attachment feature coming soon!")} className="flex items-center gap-2 px-3 py-1.5 bg-sidebar hover:bg-atlassian-hover border border-border rounded text-sm font-medium transition-colors">
                                <Paperclip size={16} /> Attach
                            </button>
                            <button onClick={() => toast.info("Task linking coming soon!")} className="flex items-center gap-2 px-3 py-1.5 bg-sidebar hover:bg-atlassian-hover border border-border rounded text-sm font-medium transition-colors">
                                <LinkIcon size={16} /> Link issue
                            </button>
                            <div className="flex items-center gap-2 bg-sidebar hover:bg-atlassian-hover border border-border rounded transition-colors">
                                <DropdownMenu 
                                    actions={[
                                        { label: 'Edit', onClick: () => { onClose(); if(onEdit) onEdit(); } },
                                        { label: 'Delete', onClick: () => onDelete(task._id), color: 'text-red-500' }
                                    ]}
                                    horizontal
                                />
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                        <div>
                            <span className="text-sm font-semibold text-sidebar-foreground block mb-1">Status</span>
                            <select 
                                value={task.status || 'To Do'} 
                                onChange={(e) => onUpdateStatus(task._id, e.target.value)}
                                className="w-full bg-sidebar border border-border rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-atlassian-hover transition-colors focus:ring-2 focus:ring-atlassian-blue"
                            >
                                <option value='To Do'>To Do</option>
                                <option value='In Progress'>In Progress</option>
                                <option value='Testing'>Testing</option>
                                <option value='Done'>Done</option>
                            </select>
                        </div>
                        
                        <div>
                            <span className="text-sm font-semibold text-sidebar-foreground block mb-1">Assignee</span>
                            <div className="flex items-center gap-2 text-sm text-foreground bg-sidebar border border-border px-3 py-1.5 rounded-md hover:bg-atlassian-hover cursor-pointer">
                                <Avatar 
                                    className="w-5 h-5 rounded-full" 
                                    src={task.assignTo?.profilePic} 
                                    name={typeof task.assignTo === 'string' ? task.assignTo : (task.assignTo?.firstName || 'User')} 
                                    size={16}
                                />
                                <span>{typeof task.assignTo === 'string' ? task.assignTo : `${task.assignTo?.firstName || 'Unassigned'}`}</span>
                            </div>
                        </div>

                        <div>
                            <span className="text-sm font-semibold text-sidebar-foreground block mb-1">Priority</span>
                            <div className="flex items-center gap-2 text-sm text-foreground bg-sidebar border border-border px-3 py-1.5 rounded-md">
                                <div className={`w-3 h-3 rounded-full ${priorityColor.replace('text-', 'bg-')}`}></div>
                                <span>{task.priority}</span>
                            </div>
                        </div>

                        <div>
                            <span className="text-sm font-semibold text-sidebar-foreground block mb-1">Story Points</span>
                            <div className="flex items-center gap-2 text-sm text-foreground bg-sidebar border border-border px-3 py-1.5 rounded-md">
                                <span className="font-bold bg-border/50 px-2 rounded">{task.storyPoints || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <span className="text-sm font-bold text-foreground block mb-2">Description</span>
                        <div className="text-sm text-sidebar-foreground bg-sidebar/50 p-4 rounded-md border border-border min-h-[100px]">
                            {task.description || "Add a description..."}
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                            <span className="text-sm font-bold text-foreground">Comments</span>
                        </div>
                        
                        {/* Add Comment */}
                        <div className="flex gap-3 mb-6">
                            <Avatar 
                                className="w-8 h-8 rounded-full flex-shrink-0" 
                                name="Me" 
                            />
                            <div className="flex-1">
                                <textarea 
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment... Use @ to mention someone."
                                    className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-atlassian-blue focus:outline-none resize-none min-h-[80px]"
                                />
                                <div className="flex justify-end mt-2">
                                    <button 
                                        onClick={handleAddComment} 
                                        disabled={isPostingComment || !commentText.trim()}
                                        className="bg-atlassian-blue hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        {isPostingComment ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Threaded Comments */}
                        {task.comments?.length > 0 ? (
                            <div className="space-y-4">
                                {task.comments.map((comment, idx) => {
                                    const authorObj = typeof comment.author === 'object' && comment.author ? comment.author : null;
                                    const authorName = authorObj ? `${authorObj.firstName} ${authorObj.lastName}` : (comment.author || 'User');
                                    
                                    return (
                                        <div key={idx} className="flex gap-3 group relative">
                                            <Avatar 
                                                className="w-8 h-8 rounded-full flex-shrink-0" 
                                                src={authorObj?.profilePic}
                                                name={authorName} 
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-sm font-bold text-foreground">{authorName}</span>
                                                    <span className="text-xs text-sidebar-foreground">{new Date(comment.createdAt).toLocaleString()}</span>
                                                </div>
                                                
                                                {editingCommentId === comment._id ? (
                                                    <div className="mt-2">
                                                        <textarea 
                                                            value={editingCommentText}
                                                            onChange={(e) => setEditingCommentText(e.target.value)}
                                                            className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-atlassian-blue focus:outline-none resize-none min-h-[60px]"
                                                        />
                                                        <div className="flex justify-start gap-2 mt-2">
                                                            <button 
                                                                onClick={() => handleEditComment(comment._id)} 
                                                                className="bg-atlassian-blue hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                                            >
                                                                Save
                                                            </button>
                                                            <button 
                                                                onClick={() => { setEditingCommentId(null); setEditingCommentText(''); }}
                                                                className="hover:bg-secondary text-foreground px-3 py-1 rounded text-xs transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-foreground mt-1">
                                                        {/* Basic @mention parsing */}
                                                        {comment.text.split(' ').map((word, i) => 
                                                            word.startsWith('@') 
                                                                ? <span key={i} className="text-atlassian-blue bg-blue-500/10 px-1 rounded">{word} </span> 
                                                                : word + ' '
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                            {/* Dropdown Menu for Edit/Delete (visible on hover) */}
                                            {editingCommentId !== comment._id && (
                                                <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <DropdownMenu 
                                                        horizontal
                                                        actions={[
                                                            { label: 'Edit', onClick: () => { setEditingCommentId(comment._id); setEditingCommentText(comment.text); } },
                                                            { label: 'Delete', onClick: () => handleDeleteComment(comment._id), color: 'text-red-500' }
                                                        ]}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-sm text-sidebar-foreground text-center py-4">No comments yet.</div>
                        )}
                    </div>

                    {/* Activity Log Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4 border-b border-border pb-2 mt-8">
                            <span className="text-sm font-bold text-foreground">Activity</span>
                        </div>
                        
                        <div className="space-y-3">
                            {task.activityLog?.length > 0 ? task.activityLog.map((log, idx) => (
                                <div key={idx} className="flex gap-3 text-sm">
                                    <Activity size={16} className="text-sidebar-foreground mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-foreground">{log.by}</span>
                                        <span className="text-sidebar-foreground mx-1">{log.action}</span>
                                        <span className="text-xs text-sidebar-foreground block mt-0.5">{new Date(log.at).toLocaleString()}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-sm text-sidebar-foreground py-2">
                                    Created on {new Date(task.startDate).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ReadTaskDrawer;
