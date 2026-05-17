import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Target, CheckCircle2, Clock, AlertCircle, LayoutGrid, List, Activity, Edit2, Trash2 } from 'lucide-react';
import AddProjectModal from './modals/AddProject';
import ReadProjectModal from './modals/ReadProject';
import DropdownMenu from '../../components/common/DropdownMenu';
import axios from 'axios';
import { toast } from 'react-toastify';

function Projects() {
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [isReadProjectModalOpen, setIsReadProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectsData, setProjectsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const fetchProjects = async () => {
    try {
      const response = await axios.get('api/projects');
      setProjectsData(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openAddProjectModal = () => setIsAddProjectModalOpen(true);
  const openEditProjectModal = (project) => {
    setProjectToEdit(project);
    setIsAddProjectModalOpen(true);
  };

  const openReadProjectModal = (project) => {
    setSelectedProject(project);
    setIsReadProjectModalOpen(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    try {
      await axios.delete(`api/project/${projectId}`);
      toast.success('Project deleted successfully');
      setIsReadProjectModalOpen(false);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project. Please try again.');
    }
  };

  const closeAddProjectModal = () => {
    setIsAddProjectModalOpen(false);
    setProjectToEdit(null);
    fetchProjects();
  };
  
  const closeReadProjectModal = () => setIsReadProjectModalOpen(false);

  const handleUpdateProjectStatus = async (projectId, newStatus) => {
    try {
      await axios.put(`api/project/${projectId}/status`, { status: newStatus });
      fetchProjects();
      if (selectedProject && selectedProject._id === projectId) {
        setSelectedProject(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'in progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'testing': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'on hold': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-sidebar-foreground/10 text-sidebar-foreground border-border';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'most important': return 'bg-red-500';
      case 'important': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const stats = {
    total: projectsData.length,
    completed: projectsData.filter(p => p.status === 'Completed').length,
    inProgress: projectsData.filter(p => p.status === 'In Progress').length,
    testing: projectsData.filter(p => p.status === 'Testing').length,
    onHold: projectsData.filter(p => p.status === 'On Hold').length,
  };

  return (
    <div className="w-full">
      <AddProjectModal isOpen={isAddProjectModalOpen} onClose={closeAddProjectModal} projectToEdit={projectToEdit} />
      <ReadProjectModal isOpen={isReadProjectModalOpen} onClose={closeReadProjectModal} project={selectedProject} onDelete={handleDeleteProject} onUpdateStatus={handleUpdateProjectStatus} />
      
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Briefcase className="text-atlassian-blue" size={24} />
              Projects
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage and track all company initiatives.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-sidebar rounded-md border border-border p-1">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-sidebar-foreground hover:text-foreground'}`}>
                <LayoutGrid size={16} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-sidebar-foreground hover:text-foreground'}`}>
                <List size={16} />
              </button>
            </div>
            <button 
              onClick={openAddProjectModal}
              className="flex items-center gap-2 px-4 py-2 bg-atlassian-blue text-white rounded hover:bg-blue-600 transition-colors font-medium text-sm shadow-sm"
            >
              <Plus size={16} /> Create Project
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <Target className="text-blue-500 mb-2" size={24} />
            <h3 className="text-2xl font-bold text-foreground">{stats.total}</h3>
            <p className="text-xs font-medium text-muted-foreground uppercase">Total</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <Clock className="text-blue-500 mb-2" size={24} />
            <h3 className="text-2xl font-bold text-foreground">{stats.inProgress}</h3>
            <p className="text-xs font-medium text-muted-foreground uppercase">In Progress</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <Activity className="text-yellow-500 mb-2" size={24} />
            <h3 className="text-2xl font-bold text-foreground">{stats.testing}</h3>
            <p className="text-xs font-medium text-muted-foreground uppercase">Testing</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <AlertCircle className="text-red-500 mb-2" size={24} />
            <h3 className="text-2xl font-bold text-foreground">{stats.onHold}</h3>
            <p className="text-xs font-medium text-muted-foreground uppercase">On Hold</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <CheckCircle2 className="text-green-500 mb-2" size={24} />
            <h3 className="text-2xl font-bold text-foreground">{stats.completed}</h3>
            <p className="text-xs font-medium text-muted-foreground uppercase">Completed</p>
          </div>
        </div>

        {/* Projects Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsData.map(project => (
              <div 
                key={project._id} 
                onClick={() => openReadProjectModal(project)}
                className="bg-card border border-border hover:border-atlassian-blue/50 rounded-lg p-5 cursor-pointer transition-all shadow-sm hover:shadow-md flex flex-col h-full group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-atlassian-blue transition-colors line-clamp-1">{project.title}</h3>
                    <div className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(project.priority)} mt-2`} title={`Priority: ${project.priority}`}></div>
                  </div>
                  <DropdownMenu 
                    actions={[
                      { label: 'Edit', icon: Edit2, onClick: () => openEditProjectModal(project) },
                      { label: 'Delete', icon: Trash2, onClick: () => handleDeleteProject(project._id), color: 'text-red-500' }
                    ]}
                  />
                </div>
                
                <p className="text-sm text-sidebar-foreground line-clamp-2 mb-6 flex-1">
                  {project.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {project.startDate && !isNaN(new Date(project.startDate)) ? new Date(project.startDate).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sidebar border-b border-border">
                  <th className="px-6 py-3 text-xs font-bold text-sidebar-foreground uppercase tracking-wider">Project Name</th>
                  <th className="px-6 py-3 text-xs font-bold text-sidebar-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-bold text-sidebar-foreground uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-xs font-bold text-sidebar-foreground uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-xs font-bold text-sidebar-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projectsData.map(project => (
                  <tr 
                    key={project._id} 
                    onClick={() => openReadProjectModal(project)}
                    className="hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-semibold text-foreground text-sm">{project.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(project.priority)}`}></div>
                        <span className="text-sm text-foreground">{project.priority}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-sidebar-foreground">
                      {project.startDate && !isNaN(new Date(project.startDate)) ? new Date(project.startDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu 
                        horizontal
                        actions={[
                          { label: 'Edit', icon: Edit2, onClick: () => openEditProjectModal(project) },
                          { label: 'Delete', icon: Trash2, onClick: () => handleDeleteProject(project._id), color: 'text-red-500' }
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg text-muted-foreground">
            Loading projects...
          </div>
        ) : projectsData.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Briefcase className="mx-auto text-sidebar-foreground mb-4" size={48} />
            <h3 className="text-lg font-bold text-foreground">No projects yet</h3>
            <p className="text-sidebar-foreground text-sm mt-1">Create your first project to get started.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Projects;