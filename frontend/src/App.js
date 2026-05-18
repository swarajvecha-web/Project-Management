import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react';
import Register from './layouts/auth/Register.jsx';
import Login from './layouts/auth/Login.jsx';
import Dashboard from './layouts/dashboard/Dashboard.jsx';
import Employees from './layouts/employees/Employees.jsx'
import Projects from './layouts/projects/Projects.jsx'
import Tasks from './layouts/tasks/Tasks.jsx'
import Timesheets from './layouts/timesheets/Timesheets.jsx'
import Attendance from './layouts/attendance/Attendance.jsx'
import About from './layouts/about/About.jsx';
import AppLayout from './components/layout/AppLayout.jsx';

import Burndown from './layouts/burndown/Burndown.jsx';
import Notifications from './layouts/notifications/Notifications.jsx';
import Backlog from './layouts/backlog/Backlog.jsx';
import Roadmap from './layouts/roadmap/Roadmap.jsx';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" />

      <Router>
        <ScrollToTop />
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/register' element={<Register />} />
          
          <Route path='/admin' element={<AppLayout />}>
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='employees' element={<Employees />} />
            <Route path='projects' element={<Projects />} />
            <Route path='tasks' element={<Tasks />} />
            <Route path='timesheets' element={<Timesheets />} />
            <Route path='attendance' element={<Attendance />} />
            <Route path='about' element={<About />} />
            
            {/* New Jira clone routes */}
            <Route path='board' element={<Tasks />} /> {/* Using Tasks as a placeholder for the Board for now */}
            <Route path='burndown' element={<Burndown />} />
            <Route path='backlog' element={<Backlog />} />
            <Route path='roadmap' element={<Roadmap />} />
            <Route path='notifications' element={<Notifications />} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App;