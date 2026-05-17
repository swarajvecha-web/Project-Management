const Settings = require('../models/settings');

exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne({ user: req.user.userId });
        if (!settings) {
            settings = await Settings.create({ user: req.user.userId });
        }
        res.status(200).json(settings);
    } catch (err) {
        console.error('Get Settings Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne({ user: req.user.userId });
        if (!settings) {
            settings = new Settings({ user: req.user.userId });
        }
        
        const { title, description, version, company, contactEmail } = req.body;
        
        if (title !== undefined) settings.title = title;
        if (description !== undefined) settings.description = description;
        if (version !== undefined) settings.version = version;
        if (company !== undefined) settings.company = company;
        if (contactEmail !== undefined) settings.contactEmail = contactEmail;
        
        await settings.save();
        res.status(200).json(settings);
    } catch (err) {
        console.error('Update Settings Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};
