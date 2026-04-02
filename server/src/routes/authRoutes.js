import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/schema.ts';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password, tagline, displayName } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const user = new User({ username, password, tagline, displayName });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
        
        res.status(201).json({ token, user: { id: user._id, username, displayName } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        // Use verifyPassword from schema.ts (argon2)
        const isMatch = await user.verifyPassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
        
        res.json({ token, user: { id: user._id, username, displayName: user.displayName } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// FCM Token Update
router.post('/fcm-token', authMiddleware, async (req, res) => {
    try {
        const { fcmToken } = req.body;
        await User.findByIdAndUpdate(req.user._id, { fcmToken });
        res.json({ message: 'FCM Token updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
