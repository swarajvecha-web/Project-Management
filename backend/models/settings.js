const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: { type: String, default: 'About Task Management System' },
    description: { type: String, default: 'This Task Management System is designed to streamline your workflow, track employee performance, and manage projects effectively. Our goal is to provide a seamless orchestration of task creation, assignment, and tracking.' },
    version: { type: String, default: '1.0.0' },
    company: { type: String, default: 'Swaraj Vecha Tech' },
    contactEmail: { type: String, default: 'swarajvecha@gmail.com' }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
