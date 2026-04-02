import express, { json, urlencoded } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Modular Routes
import pageRoutes from './src/routes/pageRoutes.js';
import noteRoutes from './src/routes/noteRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/notely';

app.use(cors());
app.use(json({ limit: '50mb' })); // Higher limit for Image notes (Base64)
app.use(urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/api/health', (_, res) => {
  res.json({ 
    status: 'API is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/upload', uploadRoutes);

// Statically serve uploads folder to allow media streaming (Range requests are handled automatically)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
