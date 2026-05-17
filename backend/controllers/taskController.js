const Task = require('../models/tasks');

exports.createTask = async (req, res) => {
    try {
        const { title, description, assignTo, project, startDate, priority, storyPoints, epicName, epicColor } = req.body;

        if (!title || !description || !assignTo || !project || !startDate || !priority) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newTask = new Task({
            title, description, assignTo, project, startDate, priority, storyPoints, epicName, epicColor, user: req.user.userId
        });

        await newTask.save();
        res.status(201).json({ message: 'Task added successfully', task: newTask });
    } catch (error) {
        console.error('Create Task Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.userId })
            .populate('assignTo', 'firstName lastName email profilePic')
            .populate('project', 'title status')
            .populate('comments.author', 'firstName lastName profilePic');
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Get Tasks Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user.userId })
            .populate('assignTo', 'firstName lastName email profilePic')
            .populate('project', 'title status')
            .populate('comments.author', 'firstName lastName profilePic');
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.status(200).json(task);
    } catch (error) {
        console.error('Get Task Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user.userId }, req.body, { new: true, runValidators: true });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.status(200).json({ message: 'Task updated successfully', task });
    } catch (error) {
        console.error('Update Task Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete Task Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ message: 'Status is required' });

        const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user.userId }, { status }, { new: true });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.status(200).json(task);
    } catch (error) {
        console.error('Update Task Status Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addTaskComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        const task = await Task.findOne({ _id: req.params.id, user: req.user.userId });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        
        task.comments.push({ text, author: req.user.userId, createdAt: new Date() });
        await task.save();
        
        // Populate the new comment's author before returning
        await task.populate('comments.author', 'firstName lastName profilePic');
        
        res.status(200).json(task);
    } catch (error) {
        console.error('Add Task Comment Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.editTaskComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        const task = await Task.findOne({ _id: req.params.id, user: req.user.userId });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const comment = task.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        // Ensure user owns comment
        if (comment.author.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to edit this comment' });
        }

        comment.text = text;
        await task.save();
        await task.populate('comments.author', 'firstName lastName profilePic');
        
        res.status(200).json(task);
    } catch (error) {
        console.error('Edit Task Comment Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteTaskComment = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user.userId });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const comment = task.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        // Ensure user owns comment
        if (comment.author.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        task.comments.pull(req.params.commentId);
        await task.save();
        await task.populate('comments.author', 'firstName lastName profilePic');

        res.status(200).json(task);
    } catch (error) {
        console.error('Delete Task Comment Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
