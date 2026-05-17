const Attendance = require('../models/attendances');

function convertTo24Hour(time12h) {
    if (!time12h) return "00:00";
    const [time, period] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    if (period === 'PM' && hours < 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

function calculateDuration(timeIn, timeOut) {
    const timeInDate = new Date(`2000-01-01T${convertTo24Hour(timeIn)}`);
    const timeOutDate = new Date(`2000-01-01T${convertTo24Hour(timeOut)}`);

    const timeDiff = timeOutDate - timeInDate;
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
}

exports.markAttendance = async (req, res) => {
    try {
        const { employeeId, day, timeIn, timeOut } = req.body;

        if (!employeeId || !day) {
            return res.status(400).json({ message: 'employeeId and day are required' });
        }

        // Find an OPEN attendance record (checked in, but not checked out)
        let openAttendance = await Attendance.findOne({ employee: employeeId, day: day, timeOut: null, user: req.user.userId });

        if (timeOut) {
            if (openAttendance && openAttendance.timeIn) {
                const { hours, minutes } = calculateDuration(openAttendance.timeIn, timeOut);
                openAttendance.timeOut = timeOut;
                openAttendance.workingHours = `${hours} hour:${minutes} minutes`;
                await openAttendance.save();
                res.status(200).json({ message: 'Time Out Marked Successfully', attendance: openAttendance });
            } else {
                res.status(400).json({ message: 'You have not checked in yet, or you already checked out.' });
            }
        } else if (timeIn) {
            if (!openAttendance) {
                // Allow a new check-in because there is no currently OPEN check-in
                const newAttendance = new Attendance({
                    employee: employeeId,
                    day: day,
                    timeIn: timeIn,
                    timeOut: null,
                    workingHours: null,
                    user: req.user.userId
                });
                await newAttendance.save();
                res.status(201).json({ message: 'Time In Marked Successfully', attendance: newAttendance });
            } else {
                res.status(400).json({ message: 'TimeIn Already Exists. Please Time Out first.' });
            }
        } else {
            res.status(400).json({ message: 'TimeIn or TimeOut Is Missing' });
        }
    } catch (error) {
        console.error('Mark Attendance Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAttendances = async (req, res) => {
    try {
        const attendances = await Attendance.find({ user: req.user.userId }).populate('employee', 'firstName lastName email');
        res.status(200).json(attendances);
    } catch (error) {
        console.error('Get Attendances Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAttendanceById = async (req, res) => {
    try {
        const attendance = await Attendance.findOne({ _id: req.params.id, user: req.user.userId }).populate('employee', 'firstName lastName email');
        if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });
        res.status(200).json(attendance);
    } catch (error) {
        console.error('Get Attendance Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateAttendance = async (req, res) => {
    try {
        // Recalculate duration if timeIn and timeOut are both provided in update
        const updateData = { ...req.body };
        if (updateData.timeIn && updateData.timeOut) {
            const { hours, minutes } = calculateDuration(updateData.timeIn, updateData.timeOut);
            updateData.workingHours = `${hours} hour:${minutes} minutes`;
        }

        const attendance = await Attendance.findOneAndUpdate({ _id: req.params.id, user: req.user.userId }, updateData, { new: true, runValidators: true });
        if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });
        res.status(200).json({ message: 'Attendance updated successfully', attendance });
    } catch (error) {
        console.error('Update Attendance Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
        if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });
        res.status(200).json({ message: 'Attendance deleted successfully' });
    } catch (error) {
        console.error('Delete Attendance Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
