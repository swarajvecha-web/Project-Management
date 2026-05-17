const Notification = require('../models/notifications');

exports.createNotification = async (req, res) => {
    try {
        const { recipient, type, message } = req.body;

        if (!recipient || !type || !message) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newNotification = new Notification({ recipient, type, message, user: req.user.userId });
        await newNotification.save();
        res.status(201).json({ message: 'Notification created successfully', notification: newNotification });
    } catch (error) {
        console.error('Create Notification Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        // Typically, we only get notifications for the logged in user, but assuming global for now based on previous MVP requirements.
        // We can optionally filter by recipient if provided in query: ?recipient=ID
        const query = req.query.recipient ? { recipient: req.query.recipient, user: req.user.userId } : { user: req.user.userId };
        
        const notifications = await Notification.find(query)
            .populate('recipient', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Get Notifications Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findOne({ _id: req.params.id, user: req.user.userId }).populate('recipient', 'firstName lastName email');
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.status(200).json(notification);
    } catch (error) {
        console.error('Get Notification Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user.userId }, req.body, { new: true, runValidators: true });
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.status(200).json({ message: 'Notification updated successfully', notification });
    } catch (error) {
        console.error('Update Notification Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Delete Notification Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user.userId }, { read: true }, { new: true });
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.status(200).json(notification);
    } catch (error) {
        console.error('Mark Notification Read Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
