const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    assignTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    priority: {
        type: String,
        enum: ['Most Important', 'Important', 'Least Important'],
        required: true,
    },
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Testing', 'Done'],
        default: 'To Do',
    },
    storyPoints: {
        type: Number,
        default: 0,
    },
    epicName: {
        type: String,
    },
    epicColor: {
        type: String,
    },
    comments: [{
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],
    activityLog: [{
        action: String,
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
        at: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('Task', taskSchema);
