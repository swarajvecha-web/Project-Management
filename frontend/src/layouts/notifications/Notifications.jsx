import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, AlertCircle, CheckCircle, Clock, Trash2, Check } from 'lucide-react';
import axios from 'axios';

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  // Fetch from backend (currently returns [])
  const fetchNotifications = async () => {
    try {
      const response = await axios.get('api/notifications');
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'comment': return <MessageSquare size={20} className="text-blue-500" />;
      case 'alert': return <AlertCircle size={20} className="text-red-500" />;
      case 'success': return <CheckCircle size={20} className="text-green-500" />;
      default: return <Bell size={20} className="text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Bell className="text-atlassian-blue" size={24} />
              Notifications
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Stay updated with activity across your workspace.</p>
          </div>
          <button 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-sidebar-foreground rounded hover:bg-secondary/80 transition-colors font-medium text-sm disabled:opacity-50"
          >
            <Check size={16} /> Mark all as read
          </button>
        </div>

        {/* List */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell size={48} className="mx-auto mb-4 opacity-20" />
              <p>You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 flex gap-4 transition-colors hover:bg-secondary/50 ${notification.read ? 'opacity-70' : 'bg-blue-50/5 dark:bg-blue-900/10'}`}
              >
                <div className="mt-1 flex-shrink-0">
                  <div className={`p-2 rounded-full ${notification.read ? 'bg-secondary' : 'bg-background shadow-sm border border-border'}`}>
                    {getIcon(notification.type)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-sm font-semibold ${notification.read ? 'text-sidebar-foreground' : 'text-foreground'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={12} /> {notification.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                  
                  {!notification.read && (
                    <div className="mt-3">
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs font-medium text-atlassian-blue hover:underline"
                      >
                        Mark as read
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;
