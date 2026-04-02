import { Router } from 'express';
import { Page } from '../models/schema.ts';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

// --- Sync Endpoint (Double-Buffered Storage Bridge) ---
router.post('/sync', async (req, res) => {
    const { id, remoteId, pageRemoteId, type, content, order, metadata, updatedAt, syncStatus } = req.body;

    if (!pageRemoteId) {
        return res.status(400).json({ message: 'pageRemoteId is required for syncing notes' });
    }

    try {
        const page = await Page.findOne({ _id: pageRemoteId, userId: req.user._id });
        if (!page) return res.status(404).json({ message: 'Target page not found' });

        if (syncStatus === 'deleted') {
            if (remoteId) {
                page.notes.pull({ _id: remoteId });
                await page.save();
                return res.json({ message: 'Note deleted from server', remoteId });
            }
            return res.json({ message: 'Note already gone or not synced' });
        }

        let note = remoteId ? page.notes.id(remoteId) : null;

        if (note) {
            // "Last Write Wins"
            const serverUpdatedAt = new Date(note.updatedAt || 0);
            const clientUpdatedAt = new Date(updatedAt);

            if (clientUpdatedAt > serverUpdatedAt) {
                note.type = type;
                note.content = content;
                note.order = order;
                note.metadata = metadata;
            } else {
                return res.json({ message: 'Server has newer version', remoteId: note._id });
            }
        } else {
            const newNote = page.notes.create({ type, content, order, metadata });
            page.notes.push(newNote);
            note = newNote;
        }

        await page.save();
        res.json({ message: 'Note synced successfully', remoteId: note._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
