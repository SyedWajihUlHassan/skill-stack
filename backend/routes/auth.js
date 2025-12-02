import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// ===== HELPER FUNCTION =====
// Generate JWT token for authentication
const generateToken = (id) => {
    return jwt.sign(
        { id },                 // Payload (data stored in token)
        process.env.JWT_SECRET, // Secret key from .env
        { expiresIn: '30d'}     // Token expires in 30 days
    );
};

// ===== REGISTER ROUTE =====
// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        console.log('Registration attempt:', req.body);

        const { username, email, password } = req.body;

        //Validation: Check if all fields are provided
        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'Please provide username, email, and password'
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (userExists) {
            const field = userExists.email === email ? 'Email' : 'Username';
            return res.status(400).json({
                message: `${field} is already taken`
            });
        }

        // Create new user
        const user = await User.create({
            username,
            email,
            password // Will be hashed by pre-save hook
        });

        // Send response with user data and token
        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                level: user.level,
                xp: user.xp,
                streak: user.streak,
                profile: user.profile
            },
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// ===== LOGIN ROUTE =====
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                message: 'Please provide email and password'
            });
        }

        // Find user and include password (select: false by default)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordCorrect = await user.correctPassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Update last active and check streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastActive = new Date(user.lastActive);
        lastActive.setHours(0, 0, 0, 0);

        // Calculate days since last activity
        const dayDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

        if (dayDiff === 1) {
            // User was active yesterday - increase streak
            user.streak += 1;
        } else if (dayDiff > 1) {
            // User missed days - reset streak
            user.streak = 1;
        }

        user.lastActive = new Date();
        await user.save();

        // Remove password from response
        user.password = undefined;

        res.json({
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                level: user.level,
                xp: user.xp,
                streak: user.streak,
                profile: user.profile
            },
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error('login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// ===== GET CURRENT USER =====
// Get /api/auth/me (protected - needs token)
router.get('/me', async (req, res) => {
    try {
        // For now, we'll implement this after adding auth middleware
        res.json({ message: 'This will return current user data' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export { router as default };