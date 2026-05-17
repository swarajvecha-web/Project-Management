import React, { useState, useEffect } from 'react';
import { Pencil, Save, Info } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

function About() {
  const [isEditing, setIsEditing] = useState(false);
  const [aboutData, setAboutData] = useState({
    title: 'About Task Management System',
    description: 'This Task Management System is designed to streamline your workflow, track employee performance, and manage projects effectively. Our goal is to provide a seamless orchestration of task creation, assignment, and tracking.',
    version: '1.0.0',
    company: 'Swaraj Vecha Tech',
    contactEmail: 'swarajvecha@gmail.com'
  });

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const response = await axios.get('api/about');
      if (response.data && response.data._id) {
        setAboutData(response.data);
      }
    } catch (error) {
      console.error('Failed to load about data', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await axios.put('api/about', aboutData);
      setIsEditing(false);
      toast.success("Changes saved successfully!");
    } catch (error) {
      console.error('Failed to save about data', error);
      toast.error('Failed to save changes. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAboutData({
      ...aboutData,
      [name]: value
    });
  };

  return (
    <div className="flex-1 p-8 bg-background min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Info className="text-atlassian-blue" size={24} />
              Application Details
            </h1>
            <p className="text-muted-foreground mt-1">System configuration and application information</p>
          </div>
          {!isEditing ? (
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors font-medium text-sm"
              onClick={handleEdit}
            >
              <Pencil size={16} /> Edit Details
            </button>
          ) : (
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-atlassian-blue text-white rounded hover:bg-blue-600 transition-colors font-medium text-sm"
              onClick={handleSave}
            >
              <Save size={16} /> Save Changes
            </button>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground uppercase tracking-wider">Application Title</label>
            {isEditing ? (
              <input 
                type="text" 
                name="title" 
                value={aboutData.title} 
                onChange={handleChange} 
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-atlassian-blue focus:ring-1 focus:ring-atlassian-blue transition-colors"
              />
            ) : (
              <p className="text-foreground bg-secondary/30 px-4 py-3 rounded-md border border-border/50">{aboutData.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground uppercase tracking-wider">Description</label>
            {isEditing ? (
              <textarea 
                name="description" 
                value={aboutData.description} 
                onChange={handleChange} 
                rows="4"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-atlassian-blue focus:ring-1 focus:ring-atlassian-blue transition-colors resize-none"
              />
            ) : (
              <p className="text-foreground bg-secondary/30 px-4 py-3 rounded-md border border-border/50 whitespace-pre-wrap leading-relaxed">{aboutData.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground uppercase tracking-wider">Version</label>
              {isEditing ? (
                <input 
                  type="text" 
                  name="version" 
                  value={aboutData.version} 
                  onChange={handleChange} 
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-atlassian-blue focus:ring-1 focus:ring-atlassian-blue transition-colors"
                />
              ) : (
                <p className="text-foreground bg-secondary/30 px-4 py-3 rounded-md border border-border/50">{aboutData.version}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground uppercase tracking-wider">Company Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  name="company" 
                  value={aboutData.company} 
                  onChange={handleChange} 
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-atlassian-blue focus:ring-1 focus:ring-atlassian-blue transition-colors"
                />
              ) : (
                <p className="text-foreground bg-secondary/30 px-4 py-3 rounded-md border border-border/50">{aboutData.company}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-foreground uppercase tracking-wider">Contact Email</label>
              {isEditing ? (
                <input 
                  type="email" 
                  name="contactEmail" 
                  value={aboutData.contactEmail} 
                  onChange={handleChange} 
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-atlassian-blue focus:ring-1 focus:ring-atlassian-blue transition-colors"
                />
              ) : (
                <p className="text-foreground bg-secondary/30 px-4 py-3 rounded-md border border-border/50">{aboutData.contactEmail}</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default About;
