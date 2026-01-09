import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import questRoutes from './routes/quests.js';
import habitRoutes from './routes/habits.js';
import analyticsRoutes from './routes/analytics.js';
import achievementRoutes from './routes/achievements.js';
import templateRoutes from './routes/templates.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/templates', templateRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'FindingAura API',
        version: '1.0',
        status: 'running',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            quests: '/api/quests',
            habits: '/api/habits',
            analytics: '/api/analytics',
            achievements: '/api/achievements',
            templates: '/api/templates'
        },
        documentation: 'https://github.com/MSrikanthkarthikeyan/findingaura'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'FindingAura API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const PORT = process.env.PORT || 5000;

// Only start server if not in production (Vercel uses serverless functions)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
}

// Export the Express app for Vercel serverless functions
export default app;
