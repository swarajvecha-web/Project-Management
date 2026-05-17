const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        
        // Validation
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate default avatar using initials
        const defaultProfilePic = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + '+' + lastName)}&background=random`;
        
        // Create a new user
        const newUser = new User({ 
            firstName, 
            lastName, 
            email, 
            password: hashedPassword,
            profilePic: defaultProfilePic 
        });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
        res.json({ token, user: { firstName: user.firstName, lastName: user.lastName, email: user.email, profilePic: user.profilePic } });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ firstName: user.firstName, lastName: user.lastName, email: user.email, profilePic: user.profilePic });
    } catch (error) {
        console.error('Get Current User Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { firstName, lastName, profilePic } = req.body;
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (profilePic !== undefined) user.profilePic = profilePic;

        await user.save();
        
        res.json({ message: 'Profile updated successfully', user: { firstName: user.firstName, lastName: user.lastName, email: user.email, profilePic: user.profilePic } });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
