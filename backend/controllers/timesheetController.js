const Timesheet = require('../models/timesheets');

exports.createTimesheet = async (req, res) => {
    try {
        const { notes, employee, project, task, progress, timeSpent, date, type } = req.body;

        if (!notes || !employee || !project || !task || progress === undefined || timeSpent === undefined || !date || !type) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newTimesheet = new Timesheet({ notes, employee, project, task, progress, timeSpent, date, type, user: req.user.userId });

        await newTimesheet.save();
        res.status(201).json({ message: 'Timesheet added successfully', timesheet: newTimesheet });
    } catch (error) {
        console.error('Create Timesheet Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getTimesheets = async (req, res) => {
    try {
        const timesheets = await Timesheet.find({ user: req.user.userId })
            .populate('employee', 'firstName lastName')
            .populate('project', 'title')
            .populate('task', 'title');
        res.status(200).json(timesheets);
    } catch (error) {
        console.error('Get Timesheets Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getTimesheetById = async (req, res) => {
    try {
        const timesheet = await Timesheet.findOne({ _id: req.params.id, user: req.user.userId })
            .populate('employee', 'firstName lastName')
            .populate('project', 'title')
            .populate('task', 'title');
        if (!timesheet) return res.status(404).json({ message: 'Timesheet not found' });
        res.status(200).json(timesheet);
    } catch (error) {
        console.error('Get Timesheet Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateTimesheet = async (req, res) => {
    try {
        const timesheet = await Timesheet.findOneAndUpdate({ _id: req.params.id, user: req.user.userId }, req.body, { new: true, runValidators: true });
        if (!timesheet) return res.status(404).json({ message: 'Timesheet not found' });
        res.status(200).json({ message: 'Timesheet updated successfully', timesheet });
    } catch (error) {
        console.error('Update Timesheet Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteTimesheet = async (req, res) => {
    try {
        const timesheet = await Timesheet.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
        if (!timesheet) return res.status(404).json({ message: 'Timesheet not found' });
        res.status(200).json({ message: 'Timesheet deleted successfully' });
    } catch (error) {
        console.error('Delete Timesheet Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getTimesheetsStats = async (req, res) => {
    try {
        const totalTimesheets = await Timesheet.countDocuments({ user: req.user.userId });
        const developmentType = await Timesheet.countDocuments({ type: 'Development', user: req.user.userId });
        const testType = await Timesheet.countDocuments({ type: 'Testing', user: req.user.userId });
        const otherType = await Timesheet.countDocuments({ type: 'Other', user: req.user.userId });

        res.status(200).json({
            totalTimesheets,
            developmentType,
            testType,
            otherType,
        });
    } catch (error) {
        console.error('Get Timesheets Stats Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
