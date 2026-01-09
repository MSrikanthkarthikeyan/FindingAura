import express from 'express';
import Quest from '../models/Quest.js';
import Habit from '../models/Habit.js';
import User from '../models/User.js';
import aiService from '../services/aiService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/analytics/overview
// @desc    Get dashboard overview
// @access  Private
router.get('/overview', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // Get quest statistics
        const totalQuests = await Quest.countDocuments({ userId: user._id });
        const completedQuests = await Quest.countDocuments({ userId: user._id, status: 'completed' });
        const activeQuests = await Quest.countDocuments({
            userId: user._id,
            status: { $in: ['pending', 'in-progress'] }
        });

        // Get habit statistics
        const habits = await Habit.find({ userId: user._id });
        const activeHabits = habits.filter(h => h.isActive).length;
        const totalHabitCompletions = habits.reduce((sum, h) => sum + h.totalCompletions, 0);

        // Calculate completion rate
        const completionRate = totalQuests > 0
            ? ((completedQuests / totalQuests) * 100).toFixed(1)
            : 0;

        // Get recent quests
        const recentQuests = await Quest.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(5);

        const overview = {
            user: {
                name: user.name,
                level: user.stats.level,
                xp: user.stats.xp,
                currentStreak: user.stats.currentStreak,
                longestStreak: user.stats.longestStreak
            },
            quests: {
                total: totalQuests,
                completed: completedQuests,
                active: activeQuests,
                completionRate
            },
            habits: {
                active: activeHabits,
                total: habits.length,
                totalCompletions: totalHabitCompletions
            },
            recentQuests
        };

        res.json(overview);
    } catch (error) {
        console.error('Overview error:', error);
        res.status(500).json({ message: 'Error fetching overview' });
    }
});

// @route   GET /api/analytics/trends
// @desc    Get habit trends analysis
// @access  Private
router.get('/trends', protect, async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const daysNum = parseInt(days);

        const habits = await Habit.find({ userId: req.user._id });

        // Calculate daily completions for the past N days
        const dailyData = [];
        const now = new Date();

        for (let i = daysNum - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            let completions = 0;
            habits.forEach(habit => {
                const dayCompletions = habit.completionHistory.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return entryDate >= date && entryDate < nextDate;
                });
                completions += dayCompletions.length;
            });

            dailyData.push({
                date: date.toISOString().split('T')[0],
                completions
            });
        }

        // Category breakdown
        const categoryBreakdown = {};
        habits.forEach(habit => {
            if (!categoryBreakdown[habit.category]) {
                categoryBreakdown[habit.category] = {
                    count: 0,
                    completions: 0,
                    wins: 0,
                    losses: 0
                };
            }
            categoryBreakdown[habit.category].count += 1;
            categoryBreakdown[habit.category].completions += habit.totalCompletions;
            categoryBreakdown[habit.category].wins += habit.wins;
            categoryBreakdown[habit.category].losses += habit.losses;
        });

        res.json({
            dailyData,
            categoryBreakdown,
            totalHabits: habits.length
        });
    } catch (error) {
        console.error('Trends error:', error);
        res.status(500).json({ message: 'Error fetching trends' });
    }
});

// @route   GET /api/analytics/wins-losses
// @desc    Get wins and losses summary
// @access  Private
router.get('/wins-losses', protect, async (req, res) => {
    try {
        const habits = await Habit.find({ userId: req.user._id });

        const totalWins = habits.reduce((sum, h) => sum + h.wins, 0);
        const totalLosses = habits.reduce((sum, h) => sum + h.losses, 0);
        const winRate = totalWins + totalLosses > 0
            ? ((totalWins / (totalWins + totalLosses)) * 100).toFixed(1)
            : 0;

        // Top performing habits
        const topHabits = habits
            .filter(h => h.wins > 0)
            .sort((a, b) => {
                const aRate = a.wins / (a.wins + a.losses);
                const bRate = b.wins / (b.wins + b.losses);
                return bRate - aRate;
            })
            .slice(0, 5)
            .map(h => ({
                name: h.name,
                wins: h.wins,
                losses: h.losses,
                winRate: ((h.wins / (h.wins + h.losses)) * 100).toFixed(1)
            }));

        res.json({
            totalWins,
            totalLosses,
            winRate,
            topHabits
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wins/losses' });
    }
});

// @route   GET /api/analytics/recommendations
// @desc    Get AI-powered recommendations
// @access  Private
router.get('/recommendations', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const habits = await Habit.find({ userId: req.user._id }).limit(10);

        const recommendations = await aiService.generatePersonalizedRecommendations(user, habits);

        res.json({ recommendations });
    } catch (error) {
        console.error('Recommendations error:', error);
        res.status(500).json({ message: 'Error fetching recommendations' });
    }
});

// @route   GET /api/analytics/export
// @desc    Export all user data
// @access  Private
router.get('/export', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        const quests = await Quest.find({ userId: req.user._id });
        const habits = await Habit.find({ userId: req.user._id });

        const exportData = {
            user: {
                name: user.name,
                email: user.email,
                onboardingSettings: user.onboardingSettings,
                stats: user.stats,
                createdAt: user.createdAt
            },
            quests,
            habits,
            exportedAt: new Date(),
            version: '1.0'
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=findingaura-data.json');
        res.json(exportData);
    } catch (error) {
        res.status(500).json({ message: 'Error exporting data' });
    }
});

export default router;
