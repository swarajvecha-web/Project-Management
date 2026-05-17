const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    day: { type: String, required: true },
    timeIn: { type: String },
    timeOut: { type: String },
    workingHours: { type: String}
});

module.exports = mongoose.model('Attendance', attendanceSchema);
