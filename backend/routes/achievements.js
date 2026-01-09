import express from 'express';
import Achievement from '../models/Achievement.js';
import User from '../models/User.js';
import Quest from '../models/Quest.js';
import Habit from '../models/Habit.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Achievement definitions
const ACHIEVEMENTS = {
    first_quest: {
        name: 'First Steps',
        description: 'Complete your first quest',
        icon: '🎯',
        rarity: 'common',
        xpBonus: 50,
        target: 1
    },
    quest_master: {
        name: 'Quest Master',
        description: 'Complete 50 quests',
        icon: '👑',
        rarity: 'epic',
        xpBonus: 500,
        target: 50
    },
    streak_warrior: {
        name: 'Streak Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        rarity: 'rare',
        xpBonus: 250,
        target: 7
    },
    habit_builder: {
        name: 'Habit Builder',
        description: 'Create 10 habits',
        icon: '🏗️',
        rarity: 'rare',
        xpBonus: 200,
        target: 10
    },
    consistency_king: {
        name: 'Consistency King',
        description: 'Maintain a 30-day streak',
        icon: '👑',
        rarity: 'legendary',
        xpBonus: 1000,
        target: 30
    },
    level_up: {
        name: 'Rising Star',
        description: 'Reach level 10',
        icon: '⭐',
        rarity: 'epic',
        xpBonus: 500,
        target: 10
    },
    perfectionist: {
        name: 'Perfectionist',
        description: 'Complete 20 quests with 100% task completion',
        icon: '💯',
        rarity: 'epic',
        xpBonus: 400,
        target: 20
    }
};

// Check and award achievements
const checkAchievements = async (userId) => {
    const user = await User.findById(userId);
    const quests = await Quest.find({ userId, status: 'completed' });
    const habits = await Habit.find({ userId });

    const achievements = [];

    // First quest
    if (quests.length >= 1) {
        achievements.push({ type: 'first_quest', progress: quests.length });
    }

    // Quest master
    if (quests.length >= 50) {
        achievements.push({ type: 'quest_master', progress: quests.length });
    }

    // Streak warrior
    if (user.stats.currentStreak >= 7) {
        achievements.push({ type: 'streak_warrior', progress: user.stats.currentStreak });
    }

    // Consistency king
    if (user.stats.currentStreak >= 30) {
        achievements.push({ type: 'consistency_king', progress: user.stats.currentStreak });
    }

    // Habit builder
    if (habits.length >= 10) {
        achievements.push({ type: 'habit_builder', progress: habits.length });
    }

    // Level up
    if (user.stats.level >= 10) {
        achievements.push({ type: 'level_up', progress: user.stats.level });
    }

    // Perfectionist
    const perfectQuests = quests.filter(q => q.progress === 100).length;
    if (perfectQuests >= 20) {
        achievements.push({ type: 'perfectionist', progress: perfectQuests });
    }

    // Award new achievements
    const newAchievements = [];
    for (const ach of achievements) {
        const existing = await Achievement.findOne({ userId, type: ach.type });
        if (!existing && ach.progress >= ACHIEVEMENTS[ach.type].target) {
            const achievement = await Achievement.create({
                userId,
                type: ach.type,
                ...ACHIEVEMENTS[ach.type],
                progress: { current: ach.progress, target: ACHIEVEMENTS[ach.type].target }
            });

            // Award XP bonus
            user.stats.xp += ACHIEVEMENTS[ach.type].xpBonus;
            await user.save();

            newAchievements.push(achievement);
        }
    }

    return newAchievements;
};

// @route   GET /api/achievements
// @desc    Get all user achievements
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        await checkAchievements(req.user._id);
        const achievements = await Achievement.find({ userId: req.user._id });
        res.json(achievements);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching achievements' });
    }
});

// @route   GET /api/achievements/available
// @desc    Get all available achievements with progress
// @access  Private
router.get('/available', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const quests = await Quest.find({ userId: req.user._id, status: 'completed' });
        const habits = await Habit.find({ userId: req.user._id });
        const unlockedAchievements = await Achievement.find({ userId: req.user._id });

        const available = Object.entries(ACHIEVEMENTS).map(([type, data]) => {
            const unlocked = unlockedAchievements.find(a => a.type === type);

            let current = 0;
            switch (type) {
                case 'first_quest':
                case 'quest_master':
                case 'perfectionist':
                    current = type === 'perfectionist'
                        ? quests.filter(q => q.progress === 100).length
                        : quests.length;
                    break;
                case 'streak_warrior':
                case 'consistency_king':
                    current = user.stats.currentStreak;
                    break;
                case 'habit_builder':
                    current = habits.length;
                    break;
                case 'level_up':
                    current = user.stats.level;
                    break;
            }

            return {
                type,
                ...data,
                unlocked: !!unlocked,
                unlockedAt: unlocked?.unlockedAt,
                progress: { current, target: data.target },
                percentage: Math.min(100, Math.round((current / data.target) * 100))
            };
        });

        res.json(available);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching available achievements' });
    }
});

export { checkAchievements };
export default router;
