import express from 'express';
import Habit from '../models/Habit.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/habits
// @desc    Create new habit
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { name, category, frequency, targetCount } = req.body;

        const habit = await Habit.create({
            userId: req.user._id,
            name,
            category,
            frequency: frequency || 'daily',
            targetCount: targetCount || 1
        });

        res.status(201).json(habit);
    } catch (error) {
        console.error('Create habit error:', error);
        res.status(500).json({ message: 'Error creating habit' });
    }
});

// @route   GET /api/habits
// @desc    Get all user habits
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { active } = req.query;

        const filter = { userId: req.user._id };
        if (active !== undefined) {
            filter.isActive = active === 'true';
        }

        const habits = await Habit.find(filter).sort({ createdAt: -1 });
        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching habits' });
    }
});

// @route   GET /api/habits/:id
// @desc    Get single habit
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        if (habit.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(habit);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching habit' });
    }
});

// @route   POST /api/habits/:id/log
// @desc    Log habit completion
// @access  Private
router.post('/:id/log', protect, async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        if (habit.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { count = 1, notes, isWin = true } = req.body;

        habit.completionHistory.push({
            date: new Date(),
            count,
            notes
        });

        habit.totalCompletions += count;

        // Track wins/losses
        if (isWin) {
            habit.wins += 1;
        } else {
            habit.losses += 1;
        }

        habit.updateStreaks();
        await habit.save();

        res.json(habit);
    } catch (error) {
        console.error('Log habit error:', error);
        res.status(500).json({ message: 'Error logging habit' });
    }
});

// @route   GET /api/habits/:id/analytics
// @desc    Get habit analytics
// @access  Private
router.get('/:id/analytics', protect, async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        if (habit.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Calculate analytics
        const last30Days = habit.completionHistory
            .filter(entry => {
                const daysDiff = (new Date() - new Date(entry.date)) / (1000 * 60 * 60 * 24);
                return daysDiff <= 30;
            });

        const analytics = {
            totalCompletions: habit.totalCompletions,
            currentStreak: habit.currentStreak,
            longestStreak: habit.longestStreak,
            wins: habit.wins,
            losses: habit.losses,
            winRate: habit.wins + habit.losses > 0
                ? ((habit.wins / (habit.wins + habit.losses)) * 100).toFixed(1)
                : 0,
            last30DaysCount: last30Days.length,
            completionHistory: habit.completionHistory.slice(-30) // Last 30 entries
        };

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

// @route   PUT /api/habits/:id
// @desc    Update habit
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        if (habit.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { name, category, frequency, targetCount, isActive } = req.body;

        if (name) habit.name = name;
        if (category) habit.category = category;
        if (frequency) habit.frequency = frequency;
        if (targetCount) habit.targetCount = targetCount;
        if (isActive !== undefined) habit.isActive = isActive;

        await habit.save();
        res.json(habit);
    } catch (error) {
        res.status(500).json({ message: 'Error updating habit' });
    }
});

// @route   DELETE /api/habits/:id
// @desc    Delete habit
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        if (habit.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await habit.deleteOne();
        res.json({ message: 'Habit deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting habit' });
    }
});

export default router;
