import React, { useState, useEffect } from 'react';
import { Users, Briefcase, CheckSquare, Clock, Activity, Target, AlertCircle } from 'lucide-react';
import axios from 'axios';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);

  const getDashboard = async () => {
    try {
      const response = await axios.get('api/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    }
  };

  useEffect(() => {
    getDashboard();
  }, []);

  const emp = dashboardData?.employees || {};
  const proj = dashboardData?.projects || {};
  const tasks = dashboardData?.tasks || {};
  const ts = dashboardData?.timesheets || {};

  const pct = (part, total) => total > 0 ? Math.round((part / total) * 100) : 0;

  const StatCard = ({ title, icon: Icon, total, items, colorClass }) => (
    <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col h-full">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-md ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
            <Icon size={20} className={colorClass.replace('bg-', 'text-').replace('-500', '')} />
          </div>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
        </div>
        <span className="text-2xl font-bold text-foreground">{total || 0}</span>
      </div>
      <div className="p-5 flex-1 flex flex-col gap-4">
        {items.map((item, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-sidebar-foreground flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                {item.label}
              </span>
              <span className="font-bold text-foreground">{item.value || 0} <span className="text-muted-foreground font-normal text-xs ml-1">({pct(item.value, total)}%)</span></span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className={`h-full ${item.color}`} style={{ width: `${pct(item.value, total)}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-2">
            <Activity className="text-atlassian-blue" size={24} />
            Workspace Insights
          </h1>
          <p className="text-muted-foreground text-sm">Overview of projects, tasks, and team capacity.</p>
        </div>

        {/* Top Level Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-blue-500/10 rounded-lg"><Briefcase className="text-blue-500" size={24} /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Projects</p>
              <h3 className="text-2xl font-bold text-foreground">{proj.total || 0}</h3>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-green-500/10 rounded-lg"><CheckSquare className="text-green-500" size={24} /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tasks</p>
              <h3 className="text-2xl font-bold text-foreground">{tasks.total || 0}</h3>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-purple-500/10 rounded-lg"><Users className="text-purple-500" size={24} /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Employees</p>
              <h3 className="text-2xl font-bold text-foreground">{emp.total || 0}</h3>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-orange-500/10 rounded-lg"><Clock className="text-orange-500" size={24} /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Timesheets</p>
              <h3 className="text-2xl font-bold text-foreground">{ts.total || 0}</h3>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <StatCard 
            title="Projects Breakdown"
            icon={Target}
            colorClass="bg-blue-500"
            total={proj.total}
            items={[
              { label: 'Completed', value: proj.completed, color: 'bg-green-500' },
              { label: 'In Progress', value: proj.inProgress, color: 'bg-blue-500' },
              { label: 'Testing', value: proj.testing, color: 'bg-yellow-500' },
              { label: 'On Hold', value: proj.onHold, color: 'bg-red-500' },
            ]}
          />

          <StatCard 
            title="Employee Status"
            icon={Users}
            colorClass="bg-purple-500"
            total={emp.total}
            items={[
              { label: 'Active', value: emp.active, color: 'bg-green-500' },
              { label: 'Inactive', value: emp.inactive, color: 'bg-yellow-500' },
              { label: 'Terminated', value: emp.terminated, color: 'bg-red-500' },
            ]}
          />

          <StatCard 
            title="Timesheet Categories"
            icon={Clock}
            colorClass="bg-orange-500"
            total={ts.total}
            items={[
              { label: 'Development', value: ts.development, color: 'bg-blue-500' },
              { label: 'Testing', value: ts.testing, color: 'bg-yellow-500' },
              { label: 'Other', value: ts.other, color: 'bg-sidebar-foreground' },
            ]}
          />

          {/* Additional info or CTA card */}
          <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col h-full justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-atlassian-blue/10 text-atlassian-blue rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckSquare size={32} />
            </div>
            <h2 className="text-xl font-bold text-foreground">You're all caught up!</h2>
            <p className="text-sidebar-foreground text-sm max-w-sm mx-auto">
              Check out the Sprint Board to continue moving tasks across the pipeline, or dive into individual projects.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;