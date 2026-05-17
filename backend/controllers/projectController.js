const Project = require('../models/projects');

exports.createProject = async (req, res) => {
    try {
        const { title, description, clientName, startDate, status, priority } = req.body;

        if (!title || !description || !clientName || !startDate || !status || !priority) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newProject = new Project({
            title, description, clientName, startDate, status, priority, user: req.user.userId
        });

        await newProject.save();
        res.status(201).json({ message: 'Project added successfully', project: newProject });
    } catch (error) {
        console.error('Create Project Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ user: req.user.userId });
        res.status(200).json(projects);
    } catch (error) {
        console.error('Get Projects Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, user: req.user.userId });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json(project);
    } catch (error) {
        console.error('Get Project Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findOneAndUpdate({ _id: req.params.id, user: req.user.userId }, req.body, { new: true, runValidators: true });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json({ message: 'Project updated successfully', project });
    } catch (error) {
        console.error('Update Project Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Delete Project Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateProjectStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ message: 'Status is required' });

        const project = await Project.findOneAndUpdate({ _id: req.params.id, user: req.user.userId }, { status }, { new: true });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json(project);
    } catch (error) {
        console.error('Update Project Status Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
