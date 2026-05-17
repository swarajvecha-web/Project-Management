import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Plus, Search, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import AddTaskModal from './modals/AddTask';
import ReadTaskModal from './modals/ReadTask';
import Avatar from '../../components/common/Avatar';

// Setup socket connection
const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:8000');

function Board() {
    const [tasks, setTasks] = useState([]);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [isReadTaskModalOpen, setIsReadTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // Calculate Dynamic Metrics
    const uniqueAssignees = Array.from(new Map(tasks.map(t => [t.assignTo?._id || t.assignTo, t.assignTo])).values()).filter(Boolean);
    const totalPoints = tasks.reduce((sum, t) => sum + (Number(t.storyPoints) || 0), 0);
    const completedPoints = tasks.filter(t => t.status === 'Done').reduce((sum, t) => sum + (Number(t.storyPoints) || 0), 0);

    // Kanban Columns
    const columns = ['To Do', 'In Progress', 'Testing', 'Done'];

    useEffect(() => {
        fetchTasks();
        
        socket.on('connect', () => {
            console.log('Connected to real-time board');
        });

        // Listen for task updates from other clients
        socket.on('task:updated', (updatedTask) => {
            setTasks(prevTasks => prevTasks.map(t => t._id === updatedTask._id ? updatedTask : t));
        });

        socket.on('task:created', (newTask) => {
            setTasks(prevTasks => [...prevTasks, newTask]);
        });
        
        socket.on('task:deleted', (deletedId) => {
            setTasks(prevTasks => prevTasks.filter(t => t._id !== deletedId));
        });

        return () => {
            socket.off('task:updated');
            socket.off('task:created');
            socket.off('task:deleted');
        };
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get('api/tasks');
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatus = destination.droppableId;
        
        // Optimistic UI update
        const taskToMove = tasks.find(t => t._id === draggableId);
        const previousStatus = taskToMove.status;
        taskToMove.status = newStatus;
        
        setTasks(prev => prev.map(t => t._id === draggableId ? { ...t, status: newStatus } : t));

        try {
            const res = await axios.put(`api/task/${draggableId}/status`, { status: newStatus });
            // Emit via socket
            socket.emit('task:updated', res.data);
        } catch (error) {
            console.error("Failed to update status", error);
            // Revert on failure
            setTasks(prev => prev.map(t => t._id === draggableId ? { ...t, status: previousStatus } : t));
        }
    };

    const openReadTaskModal = (task) => {
        setSelectedTask(task);
        setIsReadTaskModalOpen(true);
    };

    const openEditTaskModal = (task) => {
        setTaskToEdit(task);
        setIsAddTaskModalOpen(true);
    };

    const closeTaskModal = () => {
        setIsAddTaskModalOpen(false);
        setTaskToEdit(null);
        fetchTasks();
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await axios.delete(`api/task/${taskId}`);
            toast.success('Task deleted successfully');
            setIsReadTaskModalOpen(false);
            socket.emit('task:deleted', taskId);
            setTasks(prev => prev.filter(t => t._id !== taskId));
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Failed to delete task.');
        }
    };

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            const res = await axios.put(`api/task/${taskId}/status`, { status: newStatus });
            setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
            setSelectedTask(prev => ({ ...prev, status: newStatus }));
            socket.emit('task:updated', res.data);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleUpdateTask = (updatedTask) => {
        setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
        setSelectedTask(updatedTask);
        socket.emit('task:updated', updatedTask);
    };

    const getPriorityColor = (priority) => {
        if (priority === 'Most Important') return 'bg-red-500';
        if (priority === 'Important') return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    return (
        <div className="flex flex-col h-full bg-background rounded-md">
            
            <AddTaskModal isOpen={isAddTaskModalOpen} onClose={closeTaskModal} taskToEdit={taskToEdit} />
            <ReadTaskModal 
                isOpen={isReadTaskModalOpen} 
                onClose={() => setIsReadTaskModalOpen(false)} 
                task={selectedTask} 
                onDelete={handleDeleteTask} 
                onUpdateStatus={handleUpdateStatus} 
                onUpdateTask={handleUpdateTask} 
                onEdit={() => openEditTaskModal(selectedTask)}
            />

            {/* Board Header (Sprint Info & Filters) */}
            <div className="p-6 border-b border-border">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-foreground">TF Sprint 1</h1>
                    <button 
                        onClick={() => setIsAddTaskModalOpen(true)}
                        className="bg-atlassian-blue hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                    >
                        Complete Sprint
                    </button>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-sidebar-foreground">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2" size={14} />
                            <input type="text" className="pl-7 pr-3 py-1 border border-border rounded-md bg-transparent" placeholder="Search" />
                        </div>
                    </div>
                    <div className="flex -space-x-2">
                        {uniqueAssignees.map((assignee, idx) => {
                            const name = typeof assignee === 'object' ? `${assignee.firstName} ${assignee.lastName}` : assignee;
                            const profilePic = typeof assignee === 'object' ? assignee.profilePic : null;
                            return (
                                <Avatar 
                                    key={idx} 
                                    className="w-8 h-8 rounded-full border-2 border-background" 
                                    src={profilePic} 
                                    name={name} 
                                    size={16}
                                />
                            );
                        })}
                    </div>
                    <button className="flex items-center gap-1 hover:bg-atlassian-hover px-2 py-1 rounded-md transition-colors">
                        <Filter size={14} /> Epic
                    </button>
                    <div className="ml-auto text-xs font-semibold">
                        Velocity: {completedPoints} / {totalPoints} pts
                    </div>
                </div>
            </div>

            {/* Kanban Board Area */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                    <div className="flex gap-4 h-full items-start">
                        {columns.map(status => {
                            const columnTasks = tasks.filter(t => (t.status || 'To Do') === status);
                            return (
                                <div key={status} className="flex flex-col bg-sidebar border border-border rounded-lg w-72 shrink-0 h-full max-h-full">
                                    <div className="p-3 font-semibold text-sm text-sidebar-foreground flex items-center justify-between sticky top-0 bg-sidebar rounded-t-lg z-10 border-b border-border/50">
                                        <span className="uppercase tracking-wider text-xs">{status}</span>
                                        <span className="bg-background px-2 py-0.5 rounded-full text-xs">{columnTasks.length}</span>
                                    </div>
                                    
                                    <Droppable droppableId={status}>
                                        {(provided, snapshot) => (
                                            <div 
                                                ref={provided.innerRef} 
                                                {...provided.droppableProps}
                                                className={`flex-1 overflow-y-auto p-2 space-y-2 transition-colors ${snapshot.isDraggingOver ? 'bg-atlassian-hover/50' : ''}`}
                                            >
                                                {columnTasks.map((task, index) => (
                                                    <Draggable key={task._id} draggableId={task._id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                onClick={() => openReadTaskModal(task)}
                                                                className={`bg-card border border-border p-3 rounded-md shadow-sm hover:bg-atlassian-hover transition-all cursor-pointer group
                                                                    ${status === 'Done' ? 'opacity-60 line-through' : ''}
                                                                    ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl ring-2 ring-atlassian-blue' : ''}
                                                                `}
                                                            >
                                                                {/* Epic Label */}
                                                                {task.epicName && (
                                                                    <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-block mb-2`} style={{backgroundColor: task.epicColor || '#DFE1E6', color: '#172B4D'}}>
                                                                        {task.epicName}
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Title */}
                                                                <p className="text-sm font-medium text-foreground mb-3 leading-snug line-clamp-2">
                                                                    {task.title}
                                                                </p>

                                                                {/* Footer */}
                                                                <div className="flex items-center justify-between mt-auto">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs font-semibold text-sidebar-foreground" title="Issue Key">TF-{task._id.substring(task._id.length - 4).toUpperCase()}</span>
                                                                        {/* Priority Dot */}
                                                                        <div className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(task.priority)}`} title={task.priority}></div>
                                                                    </div>
                                                                    
                                                                    <div className="flex items-center gap-2">
                                                                        {/* Story Points */}
                                                                        <div className="bg-sidebar px-1.5 py-0.5 rounded text-xs font-bold text-sidebar-foreground">
                                                                            {task.storyPoints || '-'}
                                                                        </div>
                                                                        {/* Avatar */}
                                                                        <Avatar 
                                                                            className="w-6 h-6 rounded-full" 
                                                                            src={task.assignTo?.profilePic} 
                                                                            name={typeof task.assignTo === 'object' ? `${task.assignTo.firstName}` : task.assignTo} 
                                                                            size={12}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                                {status === 'To Do' && (
                                                    <button 
                                                        onClick={() => setIsAddTaskModalOpen(true)}
                                                        className="flex items-center gap-1 text-sidebar-foreground hover:bg-atlassian-hover hover:text-foreground w-full p-2 rounded-md transition-colors text-sm"
                                                    >
                                                        <Plus size={16} /> Create
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </DragDropContext>
        </div>
    );
}

export default Board;