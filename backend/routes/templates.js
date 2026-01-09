import express from 'express';
import QuestTemplate from '../models/QuestTemplate.js';
import Quest from '../models/Quest.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/templates
// @desc    Get all quest templates
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, type, difficulty } = req.query;

        const filter = { isPublic: true };
        if (category) filter.category = category;
        if (type) filter.type = type;
        if (difficulty) filter.difficulty = difficulty;

        const templates = await QuestTemplate.find(filter).sort({ usageCount: -1 });
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching templates' });
    }
});

// @route   POST /api/templates/:id/use
// @desc    Create quest from template
// @access  Private
router.post('/:id/use', protect, async (req, res) => {
    try {
        const template = await QuestTemplate.findById(req.params.id);

        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        // Calculate end date based on quest type
        const now = new Date();
        let endDate;
        switch (template.type) {
            case 'daily':
                endDate = new Date(now.setHours(23, 59, 59, 999));
                break;
            case 'weekly':
                endDate = new Date(now.setDate(now.getDate() + 7));
                break;
            case 'monthly':
                endDate = new Date(now.setMonth(now.getMonth() + 1));
                break;
            case 'yearly':
                endDate = new Date(now.setFullYear(now.getFullYear() + 1));
                break;
        }

        const xpRewards = {
            daily: { Easy: 50, Medium: 75, Hard: 100 },
            weekly: { Easy: 200, Medium: 300, Hard: 400 },
            monthly: { Easy: 800, Medium: 1200, Hard: 1600 },
            yearly: { Easy: 5000, Medium: 7500, Hard: 10000 }
        };

        const quest = await Quest.create({
            userId: req.user._id,
            type: template.type,
            title: template.name,
            description: template.description,
            category: template.category,
            difficulty: template.difficulty,
            tasks: template.tasks,
            endDate,
            xpReward: xpRewards[template.type][template.difficulty],
            aiGenerated: false
        });

        // Increment usage count
        template.usageCount += 1;
        await template.save();

        res.status(201).json(quest);
    } catch (error) {
        res.status(500).json({ message: 'Error creating quest from template' });
    }
});

// @route   GET /api/templates/popular
// @desc    Get popular templates
// @access  Public
router.get('/popular', async (req, res) => {
    try {
        const templates = await QuestTemplate.find({ isPublic: true })
            .sort({ usageCount: -1 })
            .limit(10);
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching popular templates' });
    }
});

export default router;
