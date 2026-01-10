import express from 'express';
import Quest from '../models/Quest.js';
import User from '../models/User.js';
import Habit from '../models/Habit.js';
import aiService from '../services/aiService.js';
import { protect } from '../middleware/auth.js';
import { checkAchievements } from './achievements.js';
import { updateQuestMemory, getBehavioralInsights, calculateImpactScore } from '../utils/patternAnalysis.js';

const router = express.Router();

// Helper function to calculate end date
const calculateEndDate = (type) => {
    const now = new Date();
    switch (type) {
        case 'daily':
            return new Date(now.setHours(23, 59, 59, 999));
        case 'weekly':
            return new Date(now.setDate(now.getDate() + 7));
        case 'monthly':
            return new Date(now.setMonth(now.getMonth() + 1));
        case 'yearly':
            return new Date(now.setFullYear(now.getFullYear() + 1));
        default:
            return new Date(now.setHours(23, 59, 59, 999));
    }
};

// XP rewards based on type and difficulty
const calculateXP = (type, difficulty) => {
    const baseXP = {
        daily: 50,
        weekly: 200,
        monthly: 800,
        yearly: 5000
    };

    const multiplier = {
        Easy: 1,
        Medium: 1.5,
        Hard: 2
    };

    return Math.floor(baseXP[type] * (multiplier[difficulty] || 1));
};

// @route   POST /api/quests/generate-with-inputs
// @desc    Generate quest with explicit user inputs (enhanced)
// @access  Private
router.post('/generate-with-inputs', protect, async (req, res) => {
    try {
        const { domain, specificGoal, difficulty, timeAvailable, constraints, preferences, questType } = req.body;

        // Validation
        if (!domain || !specificGoal || !questType) {
            return res.status(400).json({
                message: 'Missing required fields: domain, specificGoal, questType'
            });
        }

        if (!['daily', 'weekly', 'monthly', 'yearly'].includes(questType)) {
            return res.status(400).json({ message: 'Invalid quest type' });
        }

        const user = await User.findById(req.user._id);

        // Generate quest using enhanced AI with user inputs
        const generatedQuest = await aiService.generateQuestsWithInputs(user, {
            domain,
            specificGoal,
            difficulty: difficulty || 'Medium',
            timeAvailable: timeAvailable || '30',
            constraints: constraints || '',
            preferences: preferences || '',
            questType
        });

        // VALIDATION LAYER - Reality check before showing to user
        const { validateQuest, rescopeQuest } = await import('../utils/questValidator.js');

        const userContext = {
            timeAvailable: parseInt(timeAvailable) || 30,
            selectedDomain: domain,
            energyLevel: req.body.energyLevel || 'Medium'
        };

        const validationResult = validateQuest(generatedQuest, userContext);

        // If validation failed, try to auto-rescope
        if (!validationResult.valid && validationResult.blockers.length > 0) {
            const rescoped = rescopeQuest(generatedQuest, validationResult, userContext);

            if (rescoped.autoFixed) {
                // Use rescoped version
                Object.assign(generatedQuest, rescoped.rescoped);
                generatedQuest.validation = {
                    validated: true,
                    validatedAt: new Date(),
                    score: 70, // Auto-rescoped gets lower score
                    issues: validationResult.issues,
                    autoRescoped: true,
                    rescopeChanges: rescoped.changes
                };
            } else {
                // Reject and return alternative
                const { generateAlternative } = await import('../utils/questValidator.js');
                const alternative = generateAlternative(generatedQuest, validationResult, userContext);

                return res.status(400).json({
                    valid: false,
                    message: 'Quest validation failed',
                    issues: validationResult.blockers,
                    alternative: alternative
                });
            }
        } else {
            // Quest passed validation
            generatedQuest.validation = {
                validated: true,
                validatedAt: new Date(),
                score: validationResult.score,
                issues: validationResult.issues,
                autoRescoped: false
            };
        }

        // Return preview first (don't save yet - user can edit)
        if (req.query.preview === 'true') {
            return res.json({
                preview: generatedQuest,
                validation: generatedQuest.validation,
                isPreview: true
            });
        }

        // Create quest if not preview
        const quest = await Quest.create({
            userId: user._id,
            type: questType,
            title: generatedQuest.title,
            description: generatedQuest.description,
            category: generatedQuest.category,
            difficulty: generatedQuest.difficulty || difficulty || 'Medium',
            tasks: generatedQuest.tasks,
            endDate: calculateEndDate(questType),
            xpReward: calculateXP(questType, generatedQuest.difficulty || difficulty || 'Medium'),
            domain: generatedQuest.domain,
            reasoning: generatedQuest.reasoning,
            successCriteria: generatedQuest.successCriteria || [],
            userInputs: {
                specificGoal,
                timeAvailable,
                constraints,
                preferences
            },
            outputType: generatedQuest.outputType || null,
            deliverable: generatedQuest.deliverable || null,
            energyRequired: generatedQuest.energyRequired || 'Medium',
            validation: generatedQuest.validation,
            estimatedTime: parseInt(timeAvailable) || 30
        });

        res.status(201).json(quest);
    } catch (error) {
        console.error('Enhanced quest generation error:', error);
        res.status(500).json({ message: 'Error generating quest', error: error.message });
    }
});

// @route   POST /api/quests/generate
// @desc    Generate new AI-powered quests (original method)
// @access  Private
router.post('/generate', protect, async (req, res) => {
    try {
        const { type, count = 1 } = req.body;

        if (!['daily', 'weekly', 'monthly', 'yearly'].includes(type)) {
            return res.status(400).json({ message: 'Invalid quest type' });
        }

        const user = await User.findById(req.user._id);

        // Generate quests using AI
        const generatedQuests = await aiService.generateQuests(user, type, count);

        // Create quest documents
        const quests = await Promise.all(
            generatedQuests.map(async (questData) => {
                const quest = await Quest.create({
                    userId: user._id,
                    type,
                    title: questData.title,
                    description: questData.description,
                    category: questData.category,
                    difficulty: questData.difficulty,
                    tasks: questData.tasks,
                    endDate: calculateEndDate(type),
                    xpReward: calculateXP(type, questData.difficulty)
                });
                return quest;
            })
        );

        res.status(201).json(quests);
    } catch (error) {
        console.error('Quest generation error:', error);
        res.status(500).json({ message: 'Error generating quests', error: error.message });
    }
});

// @route   GET /api/quests/main-quest
// @desc    Get today's main quest (highest impact)
// @access  Private
router.get('/main-quest', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // Get all pending quests
        const activeQuests = await Quest.find({
            userId: req.user._id,
            status: { $in: ['pending', 'in-progress'] }
        }).sort({ createdAt: -1 });

        if (activeQuests.length === 0) {
            return res.json({ mainQuest: null });
        }

        // Calculate impact scores for all quests
        const questsWithScores = activeQuests.map(quest => ({
            quest,
            score: calculateImpactScore(quest, user)
        }));

        // Sort by score and get top quest
        questsWithScores.sort((a, b) => b.score - a.score);
        const mainQuest = questsWithScores[0].quest;

        // Mark as main quest
        mainQuest.intentMapping = mainQuest.intentMapping || {};
        mainQuest.intentMapping.isMainQuest = true;
        mainQuest.intentMapping.impactScore = questsWithScores[0].score;
        await mainQuest.save();

        // Generate reasoning for why this is the main quest
        const domain = mainQuest.domain || mainQuest.category;
        const pattern = user.questMemory?.successPatterns?.get(domain);

        let reasoning = '';
        if (pattern && pattern.rate > 0.7) {
            reasoning += `• Continues your strong ${domain} momentum (${Math.round(pattern.rate * 100)}% success rate)\n`;
        }

        const recentInDomain = user.questMemory?.recentCompletions?.filter(c =>
            c.domain === domain && !c.skipped
        ).slice(0, 7) || [];

        if (recentInDomain.length >= 3) {
            reasoning += `• Builds on your recent ${domain} streak (${recentInDomain.length} in last week)\n`;
        }

        if (mainQuest.difficulty === user.questMemory?.preferredDifficulty) {
            reasoning += `• Matched to your ${mainQuest.difficulty} difficulty preference\n`;
        }

        if (!reasoning) {
            reasoning = `• Perfect for exploring ${domain} today\n• ${mainQuest.difficulty} difficulty matches your level`;
        }

        res.json({ mainQuest, reasoning: reasoning.trim() });
    } catch (error) {
        console.error('Main quest error:', error);
        res.status(500).json({ message: 'Error getting main quest' });
    }
});

// @route   GET /api/quests
// @desc    Get user's quests
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { type, status } = req.query;

        const filter = { userId: req.user._id };
        if (type) filter.type = type;
        if (status) filter.status = status;

        const quests = await Quest.find(filter).sort({ createdAt: -1 });
        res.json(quests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching quests' });
    }
});

// @route   GET /api/quests/:id
// @desc    Get single quest
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const quest = await Quest.findById(req.params.id);

        if (!quest) {
            return res.status(404).json({ message: 'Quest not found' });
        }

        if (quest.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(quest);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching quest' });
    }
});

// @route   PUT /api/quests/:id
// @desc    Update quest (toggle task completion)
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const quest = await Quest.findById(req.params.id);

        if (!quest) {
            return res.status(404).json({ message: 'Quest not found' });
        }

        if (quest.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { taskIndex, completed } = req.body;

        if (taskIndex !== undefined && quest.tasks[taskIndex]) {
            quest.tasks[taskIndex].completed = completed;
            if (completed) {
                quest.tasks[taskIndex].completedAt = new Date();
            }
        }

        quest.updateProgress();
        await quest.save();

        res.json(quest);
    } catch (error) {
        res.status(500).json({ message: 'Error updating quest' });
    }
});

// @route   PUT /api/quests/:id/edit
// @desc    Edit quest details (title, description, tasks, etc.)
// @access  Private
router.put('/:id/edit', protect, async (req, res) => {
    try {
        const quest = await Quest.findById(req.params.id);

        if (!quest) {
            return res.status(404).json({ message: 'Quest not found' });
        }

        if (quest.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { title, description, tasks, difficulty, successCriteria } = req.body;

        if (title) quest.title = title;
        if (description) quest.description = description;
        if (tasks) quest.tasks = tasks;
        if (difficulty) {
            quest.difficulty = difficulty;
            // Recalculate XP based on new difficulty
            quest.xpReward = calculateXP(quest.type, difficulty);
        }
        if (successCriteria) quest.successCriteria = successCriteria;

        await quest.save();
        res.json(quest);
    } catch (error) {
        console.error('Quest edit error:', error);
        res.status(500).json({ message: 'Error editing quest' });
    }
});

// @route   POST /api/quests/:id/complete
// @desc    Mark quest as completed
// @access  Private
router.post('/:id/complete', protect, async (req, res) => {
    try {
        const quest = await Quest.findById(req.params.id);

        if (!quest) {
            return res.status(404).json({ message: 'Quest not found' });
        }

        if (quest.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        quest.status = 'completed';
        quest.completedAt = new Date();
        quest.progress = 100;

        // Mark all tasks as completed
        quest.tasks.forEach(task => {
            task.completed = true;
            task.completedAt = new Date();
        });

        await quest.save();

        // Update user stats
        const user = await User.findById(req.user._id);
        user.stats.totalQuestsCompleted += 1;
        user.stats.xp += quest.xpReward;

        // Level up logic (every 1000 XP = 1 level)
        user.stats.level = Math.floor(user.stats.xp / 1000) + 1;

        // Update streak
        const today = new Date().toDateString();
        const lastCompleted = user.stats.lastQuestCompletedDate
            ? new Date(user.stats.lastQuestCompletedDate).toDateString()
            : null;

        if (lastCompleted === today) {
            // Already completed quest today
        } else if (lastCompleted === new Date(Date.now() - 86400000).toDateString()) {
            // Completed yesterday - continue streak
            user.stats.currentStreak += 1;
        } else {
            // Streak broken - reset
            user.stats.currentStreak = 1;
        }

        if (user.stats.currentStreak > user.stats.longestStreak) {
            user.stats.longestStreak = user.stats.currentStreak;
        }

        user.stats.lastQuestCompletedDate = new Date();

        // Track completion in quest memory for pattern learning
        const timeTaken = req.body.timeTaken || quest.tasks.reduce((sum, task) =>
            sum + (parseInt(task.estimatedTime) || 0), 0
        );

        await updateQuestMemory(user, quest, {
            completed: true,
            skipped: false,
            timeTaken: timeTaken
        });

        await user.save();

        // Check for new achievements
        const newAchievements = await checkAchievements(req.user._id);

        // Get behavioral insights
        const insights = getBehavioralInsights(user);

        res.json({ quest, user, newAchievements, insights });
    } catch (error) {
        console.error('Complete quest error:', error);
        res.status(500).json({ message: 'Error completing quest' });
    }
});

// @route   POST /api/quests/:id/skip
// @desc    Skip quest (no penalty, track for adaptation)
// @access  Private
router.post('/:id/skip', protect, async (req, res) => {
    try {
        const quest = await Quest.findById(req.params.id);

        if (!quest) {
            return res.status(404).json({ message: 'Quest not found' });
        }

        if (quest.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { reason } = req.body;

        quest.status = 'failed';
        quest.skipped = true;
        quest.skipReason = reason;
        await quest.save();

        // Update user quest memory - NO PENALTY, just learning
        const user = await User.findById(req.user._id);

        await updateQuestMemory(user, quest, {
            completed: false,
            skipped: true,
            timeTaken: 0
        });

        await user.save();

        // Generate gentler alternative suggestion
        const { generateGentlerAlternative } = await import('../utils/patternAnalysis.js');
        const suggestion = generateGentlerAlternative(quest);

        res.json({
            message: 'Quest skipped - no penalty! We\'ll suggest something lighter next time.',
            quest,
            suggestion,
            encouragement: suggestion.encouragement[Math.floor(Math.random() * suggestion.encouragement.length)]
        });
    } catch (error) {
        console.error('Skip quest error:', error);
        res.status(500).json({ message: 'Error skipping quest' });
    }
});

// @route   DELETE /api/quests/:id
// @desc    Delete quest
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const quest = await Quest.findById(req.params.id);

        if (!quest) {
            return res.status(404).json({ message: 'Quest not found' });
        }

        if (quest.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await quest.deleteOne();
        res.json({ message: 'Quest deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting quest' });
    }
});

export default router;
