import React, { useState, useEffect } from 'react';
import { Map, GitMerge, Clock, CheckCircle2, ChevronRight, ChevronDown } from 'lucide-react';
import axios from 'axios';

function Roadmap() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, tasksRes] = await Promise.all([
          axios.get('api/projects'),
          axios.get('api/tasks')
        ]);
        setProjects(projRes.data || []);
        setTasks(tasksRes.data || []);
      } catch (error) {
        console.error('Error fetching roadmap data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleExpand = (id) => {
    setExpandedProjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'on hold': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'in progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'testing': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-secondary text-sidebar-foreground border-border';
    }
  };

  const getProgress = (projectId, status) => {
    const projectTasks = tasks.filter(t => t.project?._id === projectId || t.project === projectId);
    if (projectTasks.length === 0) {
      switch(status?.toLowerCase()) {
        case 'on hold': return 10;
        case 'in progress': return 45;
        case 'testing': return 80;
        case 'completed': return 100;
        default: return 0;
      }
    }
    const completedTasks = projectTasks.filter(t => t.status === 'Done').length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  };

  const getNext6Months = () => {
    const months = [];
    const date = new Date();
    for (let i = 0; i < 6; i++) {
      months.push(date.toLocaleString('default', { month: 'short' }));
      date.setMonth(date.getMonth() + 1);
    }
    return months;
  };
  const dynamicMonths = getNext6Months();

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Map className="text-atlassian-blue" size={24} />
              Roadmap
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Visualize project timelines and epic progress.</p>
          </div>
        </div>

        {/* Roadmap Timeline */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          
          {/* Header row */}
          <div className="grid grid-cols-12 bg-sidebar border-b border-border">
            <div className="col-span-4 p-4 font-semibold text-sm text-foreground border-r border-border">
              Epic / Project
            </div>
            <div className="col-span-8 flex text-xs font-semibold text-muted-foreground">
              {dynamicMonths.map(month => (
                <div key={month} className="flex-1 p-4 border-r border-border/50 text-center uppercase tracking-wider">{month}</div>
              ))}
            </div>
          </div>

          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading roadmap...</div>
            ) : projects.length > 0 ? (
              projects.map(project => {
                const isExpanded = expandedProjects[project._id];
                const progress = getProgress(project._id, project.status);
                
                return (
                  <div key={project._id} className="flex flex-col">
                    {/* Project Row */}
                    <div className="grid grid-cols-12 hover:bg-secondary/20 transition-colors">
                      <div className="col-span-4 p-4 border-r border-border flex items-start gap-3 cursor-pointer" onClick={() => toggleExpand(project._id)}>
                        <button className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors">
                          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                            <GitMerge size={16} className="text-purple-500" />
                            {project.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getStatusColor(project.status)}`}>
                              {project.status || 'To Do'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Timeline Area */}
                      <div className="col-span-8 relative py-4 px-2">
                         {/* Background grid lines */}
                        <div className="absolute inset-0 flex">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex-1 border-r border-border/20 pointer-events-none"></div>
                          ))}
                        </div>
                        
                        {/* Timeline Bar */}
                        <div className="relative h-8 rounded-full overflow-hidden bg-secondary shadow-inner mt-1" style={{ width: '80%', marginLeft: `5%`}}>
                          <div 
                            className="h-full bg-purple-500/80 transition-all duration-1000 ease-out flex items-center px-3"
                            style={{ width: `${progress}%` }}
                          >
                             <span className="text-[10px] font-bold text-white shadow-sm">{progress}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Tasks */}
                    {isExpanded && (
                      <div className="bg-secondary/30 grid grid-cols-12 border-t border-border/50">
                        {(() => {
                          const projectTasks = tasks.filter(t => t.project?._id === project._id || t.project === project._id);
                          if (projectTasks.length === 0) {
                            return <div className="col-span-12 p-4 pl-12 text-sm text-sidebar-foreground">No tasks found for this project.</div>
                          }
                          return projectTasks.map((t, idx) => (
                            <React.Fragment key={t._id}>
                              <div className="col-span-4 p-4 pl-12 border-r border-border flex items-center gap-3 border-t border-border/50">
                                {t.status === 'Done' ? <CheckCircle2 size={14} className="text-green-500" /> : <Clock size={14} className="text-blue-500" />}
                                <span className={`text-sm text-foreground ${t.status === 'Done' ? 'line-through opacity-70' : ''}`}>{t.title}</span>
                              </div>
                              <div className="col-span-8 relative py-3 px-2 border-t border-border/50 flex items-center">
                                <div className={`h-2 rounded-full ${t.status === 'Done' ? 'bg-green-500/50' : 'bg-blue-500/50'}`} style={{ width: t.status === 'Done' ? '100%' : '30%', marginLeft: `${(idx % 4) * 10}%`}}></div>
                              </div>
                            </React.Fragment>
                          ))
                        })()}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-muted-foreground border-2 border-dashed border-border m-4 rounded-lg">
                No projects found. Create a project to start planning your roadmap.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Roadmap;
