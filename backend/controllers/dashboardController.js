const Employee = require('../models/employees');
const Project = require('../models/projects');
const Task = require('../models/tasks');
const Timesheet = require('../models/timesheets');

exports.getDashboardStats = async (req, res) => {
    try {
        // Employee stats
        const totalEmployees = await Employee.countDocuments({ user: req.user.userId });
        const activeEmployees = await Employee.countDocuments({ status: 'Active', user: req.user.userId });
        const inactiveEmployees = await Employee.countDocuments({ status: 'InActive', user: req.user.userId });
        const terminatedEmployees = await Employee.countDocuments({ status: 'Terminated', user: req.user.userId });

        // Project stats
        const totalProjects = await Project.countDocuments({ user: req.user.userId });
        const completedProjects = await Project.countDocuments({ status: 'Completed', user: req.user.userId });
        const inProgressProjects = await Project.countDocuments({ status: 'In Progress', user: req.user.userId });
        const testingProjects = await Project.countDocuments({ status: 'Testing', user: req.user.userId });
        const onHoldProjects = await Project.countDocuments({ status: 'On Hold', user: req.user.userId });

        // Task stats
        const totalTasks = await Task.countDocuments({ user: req.user.userId });

        // Timesheet stats
        const totalTimesheets = await Timesheet.countDocuments({ user: req.user.userId });
        const developmentTimesheets = await Timesheet.countDocuments({ type: 'Development', user: req.user.userId });
        const testingTimesheets = await Timesheet.countDocuments({ type: 'Testing', user: req.user.userId });
        const otherTimesheets = await Timesheet.countDocuments({ type: 'Other', user: req.user.userId });

        res.status(200).json({
            employees: {
                total: totalEmployees,
                active: activeEmployees,
                inactive: inactiveEmployees,
                terminated: terminatedEmployees,
            },
            projects: {
                total: totalProjects,
                completed: completedProjects,
                inProgress: inProgressProjects,
                testing: testingProjects,
                onHold: onHoldProjects,
            },
            tasks: {
                total: totalTasks,
            },
            timesheets: {
                total: totalTimesheets,
                development: developmentTimesheets,
                testing: testingTimesheets,
                other: otherTimesheets,
            },
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
