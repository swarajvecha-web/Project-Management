import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Camera, X, Save, Loader2, User as UserIcon, Settings } from 'lucide-react';
import { toast } from 'react-toastify';
import Avatar from '../common/Avatar';

function ProfileModal({ isOpen, onClose, user, onUpdate }) {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePic, setProfilePic] = useState('');
  
  // App Settings State
  const [aboutData, setAboutData] = useState({
    title: '',
    description: '',
    version: '',
    company: '',
    contactEmail: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setProfilePic(user.profilePic || '');
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Fetch about data
      axios.get('/api/about')
        .then(res => {
          if (res.data && res.data._id) {
            setAboutData(res.data);
          }
        })
        .catch(err => console.error('Failed to load about data', err));
    } else {
      // Reset tab on close
      setActiveTab('profile');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('tm_token');
      const response = await axios.put('/api/profile', 
        { firstName, lastName, profilePic },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (onUpdate) {
        onUpdate(response.data.user);
      }
      setIsLoading(false);
      toast.success("Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error('Failed to update profile', error);
      setIsLoading(false);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleSaveApp = async () => {
    try {
      setIsLoading(true);
      await axios.put('/api/about', aboutData);
      setIsLoading(false);
      toast.success("App settings saved!");
      onClose();
    } catch (error) {
      console.error('Failed to save app data', error);
      setIsLoading(false);
      toast.error('Failed to save app settings. Please try again.');
    }
  };

  const handleSave = () => {
    if (activeTab === 'profile') {
      handleSaveProfile();
    } else {
      handleSaveApp();
    }
  };

  const handleAboutChange = (e) => {
    const { name, value } = e.target;
    setAboutData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="bg-background rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-border animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border bg-sidebar/50">
          <h2 className="text-xl font-bold text-foreground">Settings</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-atlassian-hover p-1.5 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6 pt-2 bg-sidebar/30">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'profile' ? 'border-atlassian-blue text-atlassian-blue' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
          >
            <UserIcon size={16} /> Personal Profile
          </button>
          <button 
            onClick={() => setActiveTab('app')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'app' ? 'border-atlassian-blue text-atlassian-blue' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
          >
            <Settings size={16} /> App Details
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[60vh]">
          
          {activeTab === 'profile' ? (
            // Profile Tab Content
            <>
              <div className="flex flex-col items-center">
                <div 
                  className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-md group cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  <Avatar 
                    src={profilePic} 
                    name={`${firstName} ${lastName}`} 
                    className="w-full h-full object-cover transition-opacity group-hover:opacity-75" 
                    size={48}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                  </div>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-2">Click to change picture</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">First Name</label>
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-atlassian-blue focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-atlassian-blue focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-muted-foreground cursor-not-allowed opacity-70"
                    title="Email cannot be changed"
                  />
                </div>
              </div>
            </>
          ) : (
            // App Details Tab Content
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Application Title</label>
                <input 
                  type="text" 
                  name="title"
                  value={aboutData.title} 
                  onChange={handleAboutChange} 
                  className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-atlassian-blue focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <textarea 
                  name="description"
                  value={aboutData.description} 
                  onChange={handleAboutChange} 
                  rows={3}
                  className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-atlassian-blue focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Version</label>
                  <input 
                    type="text" 
                    name="version"
                    value={aboutData.version} 
                    onChange={handleAboutChange} 
                    className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-atlassian-blue focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Company</label>
                  <input 
                    type="text" 
                    name="company"
                    value={aboutData.company} 
                    onChange={handleAboutChange} 
                    className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-atlassian-blue focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Contact Email</label>
                <input 
                  type="email" 
                  name="contactEmail"
                  value={aboutData.contactEmail} 
                  onChange={handleAboutChange} 
                  className="w-full bg-sidebar border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-atlassian-blue focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-sidebar/50 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-atlassian-hover rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-atlassian-blue hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ProfileModal;
