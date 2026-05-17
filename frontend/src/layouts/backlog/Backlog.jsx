import React, { useState, useEffect } from 'react';
import { List, MoreVertical, Plus, User, AlertCircle, ArrowUp, ArrowDown, AlignJustify, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';
import AddTaskModal from '../tasks/modals/AddTask';
import ReadTaskDrawer from '../tasks/modals/ReadTask';
import { toast } from 'react-toastify';
import Avatar from '../../components/common/Avatar';
import DropdownMenu from '../../components/common/DropdownMenu';

function Backlog() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('api/tasks');
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;
    try {
      await axios.delete(`api/task/${id}`);
      toast.success("Task deleted successfully");
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error("Failed to delete task");
    }
  };

  const openEditTask = (task) => {
    setTaskToEdit(task);
    setIsAddTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsAddTaskModalOpen(false);
    setTaskToEdit(null);
    fetchTasks();
  };

  const getPriorityIcon = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'highest': return <ArrowUp size={16} className="text-red-500" />;
      case 'high': return <ArrowUp size={16} className="text-orange-500" />;
      case 'low': return <ArrowDown size={16} className="text-green-500" />;
      case 'lowest': return <ArrowDown size={16} className="text-blue-500" />;
      default: return <AlignJustify size={16} className="text-yellow-500" />; // Medium
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'to do': return 'bg-secondary text-sidebar-foreground';
      case 'in progress': return 'bg-blue-500/10 text-blue-500';
      case 'testing': return 'bg-yellow-500/10 text-yellow-500';
      case 'done': return 'bg-green-500/10 text-green-500';
      default: return 'bg-secondary text-sidebar-foreground';
    }
  };

  return (
    <div className="w-full">
      <AddTaskModal isOpen={isAddTaskModalOpen} onClose={closeTaskModal} taskToEdit={taskToEdit} />
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <List className="text-atlassian-blue" size={24} />
              Backlog
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Prioritize and plan upcoming work.</p>
          </div>
        </div>

        {/* Sprint Board */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="bg-sidebar px-6 py-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-4">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                Active Sprint
                <span className="bg-secondary text-sidebar-foreground text-xs px-2 py-0.5 rounded-full">Sprint 1</span>
              </h3>
            </div>
            <button onClick={() => toast.info("Sprint completion workflow coming soon!")} className="text-sm font-medium bg-secondary text-foreground hover:bg-secondary/80 px-3 py-1.5 rounded transition-colors">
              Complete Sprint
            </button>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading tasks...</div>
            ) : tasks.filter(t => t.status !== 'Done').length > 0 ? (
              tasks.filter(t => t.status !== 'Done').map(task => (
                <div key={task._id} className="p-3 hover:bg-secondary/50 transition-colors flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0" title={`Priority: ${task.priority || 'Medium'}`}>
                      {getPriorityIcon(task.priority)}
                    </div>
                    <span className="font-medium text-foreground text-sm">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${getStatusColor(task.status)}`}>
                      {task.status || 'To Do'}
                    </span>
                    <Avatar 
                      className="w-6 h-6 rounded-full" 
                      src={task.assignTo?.profilePic} 
                      name={typeof task.assignTo === 'object' ? task.assignTo.firstName : task.assignTo} 
                      size={12}
                    />
                      <DropdownMenu 
                        actions={[
                          { label: 'Edit', icon: Edit2, onClick: () => openEditTask(task) },
                          { label: 'Delete', icon: Trash2, onClick: () => handleDeleteTask(task._id), color: 'text-red-500' }
                        ]}
                        buttonClassName="opacity-40 group-hover:opacity-100 transition-opacity"
                      />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm border-2 border-dashed border-border m-4 rounded-lg">
                Your sprint is empty. Drag tasks here to start.
              </div>
            )}
          </div>
        </div>

        {/* Backlog Items */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="bg-sidebar px-6 py-4 flex items-center justify-between border-b border-border">
            <h3 className="font-bold text-foreground text-sm">Backlog</h3>
          </div>
          <div className="p-2 border-b border-border">
            <button onClick={() => setIsAddTaskModalOpen(true)} className="w-full flex items-center gap-2 p-2 text-sm text-muted-foreground hover:bg-secondary rounded transition-colors">
              <Plus size={16} /> Create issue
            </button>
          </div>
          <div className="divide-y divide-border">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Loading backlog...</div>
              ) : tasks.filter(t => t.status === 'To Do').length > 0 ? (
                tasks.filter(t => t.status === 'To Do').map(task => (
                  <div key={task._id} className="p-3 hover:bg-secondary/50 transition-colors flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0" title={`Priority: ${task.priority || 'Medium'}`}>
                        {getPriorityIcon(task.priority)}
                      </div>
                      <span className="font-medium text-foreground text-sm">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${getStatusColor(task.status)}`}>
                        {task.status || 'To Do'}
                      </span>
                      <Avatar 
                        className="w-6 h-6 rounded-full" 
                        src={task.assignTo?.profilePic} 
                        name={typeof task.assignTo === 'object' ? task.assignTo.firstName : task.assignTo} 
                        size={12}
                      />
                      <DropdownMenu 
                        actions={[
                          { label: 'Edit', icon: Edit2, onClick: () => openEditTask(task) },
                          { label: 'Delete', icon: Trash2, onClick: () => handleDeleteTask(task._id), color: 'text-red-500' }
                        ]}
                        buttonClassName="opacity-40 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm border-2 border-dashed border-border m-4 rounded-lg">
                  Your backlog is empty. Create issues to plan your next sprint.
                </div>
              )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Backlog;
