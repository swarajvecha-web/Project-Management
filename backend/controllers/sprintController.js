const Sprint = require('../models/sprints');

exports.createSprint = async (req, res) => {
    try {
        const { name, startDate, endDate, project, status, tasks } = req.body;

        if (!name || !startDate || !endDate || !project) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newSprint = new Sprint({ name, startDate, endDate, project, status, tasks, user: req.user.userId });
        await newSprint.save();
        res.status(201).json({ message: 'Sprint created successfully', sprint: newSprint });
    } catch (error) {
        console.error('Create Sprint Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getSprints = async (req, res) => {
    try {
        const sprints = await Sprint.find({ user: req.user.userId })
            .populate('project', 'title')
            .populate('tasks', 'title status priority');
        res.status(200).json(sprints);
    } catch (error) {
        console.error('Get Sprints Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getSprintById = async (req, res) => {
    try {
        const sprint = await Sprint.findOne({ _id: req.params.id, user: req.user.userId })
            .populate('project', 'title')
            .populate('tasks', 'title status priority');
        if (!sprint) return res.status(404).json({ message: 'Sprint not found' });
        res.status(200).json(sprint);
    } catch (error) {
        console.error('Get Sprint Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateSprint = async (req, res) => {
    try {
        const sprint = await Sprint.findOneAndUpdate({ _id: req.params.id, user: req.user.userId }, req.body, { new: true, runValidators: true });
        if (!sprint) return res.status(404).json({ message: 'Sprint not found' });
        res.status(200).json({ message: 'Sprint updated successfully', sprint });
    } catch (error) {
        console.error('Update Sprint Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteSprint = async (req, res) => {
    try {
        const sprint = await Sprint.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
        if (!sprint) return res.status(404).json({ message: 'Sprint not found' });
        res.status(200).json({ message: 'Sprint deleted successfully' });
    } catch (error) {
        console.error('Delete Sprint Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
