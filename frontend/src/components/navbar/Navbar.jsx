import React, { useState, useEffect } from 'react';
import { Bell, Search, Moon, Sun, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProfileModal from '../sidenav/ProfileModal';
import Avatar from '../common/Avatar';

function Navbar() {
    const [isDark, setIsDark] = useState(false);
    const [user, setUser] = useState({ firstName: '', lastName: '', email: '', profilePic: '' });
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    useEffect(() => {
        // Theme initialization
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'dark') {
            setIsDark(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            setIsDark(false);
            document.documentElement.removeAttribute('data-theme');
        }

        // Fetch user data
        const token = localStorage.getItem('tm_token');
        if (token) {
            axios.get('api/me', {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => setUser(res.data))
            .catch(() => {});
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between px-6 py-3 bg-background border-b border-border shadow-sm sticky top-0 z-50">
                {/* Left Section */}
                <div className="flex items-center gap-6">
                    <Link to="/admin/dashboard" className="font-bold text-xl tracking-tight text-foreground hover:opacity-80 transition-opacity">
                        Jira<span className="text-atlassian-blue">Clone</span>
                    </Link>
                </div>

                {/* Middle Section (Search) */}
                <div className="flex-1 max-w-md mx-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-foreground" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search issues, projects, or people..." 
                            className="w-full bg-sidebar border border-border rounded-md pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-atlassian-blue focus:border-transparent text-foreground transition-all"
                        />
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-atlassian-hover text-sidebar-foreground transition-colors"
                        title="Toggle Theme"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    
                    <div className="relative">
                        <button className="p-2 rounded-full hover:bg-atlassian-hover text-sidebar-foreground transition-colors">
                            <Bell size={20} />
                        </button>
                    </div>

                    {/* Profile Avatar */}
                    <button 
                        onClick={() => setIsProfileModalOpen(true)}
                        className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent hover:border-atlassian-blue transition-colors focus:outline-none focus:ring-2 focus:ring-atlassian-blue focus:ring-offset-1 focus:ring-offset-background ml-2"
                        title={`${user.firstName} ${user.lastName}`}
                    >
                        <Avatar 
                            className="w-full h-full object-cover" 
                            src={user.profilePic} 
                            name={`${user.firstName} ${user.lastName}`} 
                        />
                    </button>
                </div>
            </div>

            <ProfileModal 
                isOpen={isProfileModalOpen} 
                onClose={() => setIsProfileModalOpen(false)} 
                user={user}
                onUpdate={(updatedUser) => setUser(updatedUser)}
            />
        </>
    );
}

export default Navbar;