import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckSquare, 
  Clock, 
  CalendarDays, 
  Info, 
  LogOut,
  Kanban,
  ListTodo,
  Map as MapIcon,
  LineChart,
  Bell,
  AlertTriangle
} from 'lucide-react';

function Sidenav() {
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const NavItem = ({ to, icon: Icon, label, badge }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
          isActive 
            ? 'bg-atlassian-hover text-atlassian-blue' 
            : 'text-sidebar-foreground hover:bg-atlassian-hover hover:text-white'
        }`}
      >
        <Icon size={18} className={isActive ? 'text-atlassian-blue' : 'text-sidebar-foreground'} />
        <span className="flex-1">{label}</span>
        {badge && (
          <span className="bg-atlassian-blue text-white text-xs px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      <div className="flex flex-col h-full w-64 bg-sidebar border-r border-border shrink-0 overflow-y-auto no-scrollbar hidden md:flex">
        
        {/* Navigation Sections */}
        <div className="flex-1 p-3 space-y-6 mt-4">
          
          <div>
            <h3 className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-sidebar-foreground">Planning</h3>
            <div className="space-y-0.5">
              <NavItem to="/admin/board" icon={Kanban} label="Board" />
              <NavItem to="/admin/backlog" icon={ListTodo} label="Backlog" />
              <NavItem to="/admin/roadmap" icon={MapIcon} label="Roadmap" />
              <NavItem to="/admin/burndown" icon={LineChart} label="Burndown" />
            </div>
          </div>

          <div>
            <h3 className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-sidebar-foreground">Workspace</h3>
            <div className="space-y-0.5">
              <NavItem to="/admin/projects" icon={Briefcase} label="Projects" />
              <NavItem to="/admin/tasks" icon={CheckSquare} label="Tasks" />
              <NavItem to="/admin/employees" icon={Users} label="Employees" />
              <NavItem to="/admin/timesheets" icon={Clock} label="Timesheets" />
              <NavItem to="/admin/attendance" icon={CalendarDays} label="Attendance" />
            </div>
          </div>

          <div>
            <h3 className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-sidebar-foreground">Insights</h3>
            <div className="space-y-0.5">
              <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/admin/notifications" icon={Bell} label="Notifications" />
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-border mt-auto">
          <div className="space-y-0.5">
            <button 
              onClick={() => setShowLogoutConfirm(true)} 
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium text-red-500 hover:bg-red-500/10"
            >
              <LogOut size={18} />
              <span>Log out</span>
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Sidenav Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-border flex justify-around p-3 z-50">
         <Link to="/admin/board" className="p-2 text-atlassian-blue bg-atlassian-hover rounded-md"><Kanban size={24} /></Link>
         <Link to="/admin/projects" className="p-2 text-sidebar-foreground"><Briefcase size={24} /></Link>
         <Link to="/admin/tasks" className="p-2 text-sidebar-foreground"><CheckSquare size={24} /></Link>
         <Link to="/admin/dashboard" className="p-2 text-sidebar-foreground"><LayoutDashboard size={24} /></Link>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex justify-center items-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowLogoutConfirm(false)}></div>
          <div className="relative bg-background border border-border w-full max-w-sm p-6 rounded-lg shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
              <LogOut size={32} className="ml-1" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Ready to leave?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              You will be returned to the login screen. You must sign in again to access your workspace.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 px-4 bg-secondary text-foreground font-medium rounded-md hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem('tm_token');
                  window.location.href = '/';
                }}
                className="flex-1 py-2 px-4 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

export default Sidenav;