import { Router } from 'express';
import { Page } from '../models/schema.ts';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// --- Page CRUD ---
router.get('/', async (req, res) => {
    try {
        const pages = await Page.find({ userId: req.user._id }).sort({ updatedAt: -1 });
        res.json(pages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const page = await Page.findOne({ _id: req.params.id, userId: req.user._id });
        if (!page) return res.status(404).json({ message: 'Page not found' });
        res.json(page);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', async (req, res) => {
    const page = new Page({
        userId: req.user._id,
        title: req.body.title || 'Untitled',
        notes: req.body.notes || []
    });
    try {
        const newPage = await page.save();
        res.status(201).json(newPage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const page = await Page.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );
        if (!page) return res.status(404).json({ message: 'Page not found' });
        res.json(page);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const page = await Page.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!page) return res.status(404).json({ message: 'Page not found' });
        res.json({ message: 'Page deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
