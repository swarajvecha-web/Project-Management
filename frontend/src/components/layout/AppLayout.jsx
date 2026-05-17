import React from 'react';
import Sidenav from '../sidenav/Sidenav';
import Navbar from '../navbar/Navbar';
import { Outlet } from 'react-router-dom';

function AppLayout() {
  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden text-foreground">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidenav />
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-atlassian-hover/5">
          <main className="p-6 min-h-full">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
