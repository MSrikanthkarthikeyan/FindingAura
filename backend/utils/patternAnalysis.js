// Pattern Analysis Utilities for AuraQuest
// Analyzes user quest history to provide intelligent recommendations

/**
 * Update user's quest memory after quest completion or skip
 */
export const updateQuestMemory = async (user, quest, result) => {
    const domain = quest.domain || quest.category;

    // Initialize pattern if doesn't exist
    if (!user.questMemory.successPatterns) {
        user.questMemory.successPatterns = new Map();
    }

    let pattern = user.questMemory.successPatterns.get(domain) || {
        totalAttempts: 0,
        completed: 0,
        rate: 0,
        preferredTime: null,
        averageCompletionTime: 0,
        lastAttempt: new Date()
    };

    pattern.totalAttempts += 1;
    pattern.lastAttempt = new Date();

    if (result.completed) {
        pattern.completed += 1;

        // Add to completed themes
        const theme = quest.title.toLowerCase();
        if (!user.questMemory.completedThemes.includes(theme)) {
            user.questMemory.completedThemes.push(theme);
        }

        // Update average completion time
        if (result.timeTaken) {
            const totalTime = pattern.averageCompletionTime * (pattern.completed - 1);
            pattern.averageCompletionTime = (totalTime + result.timeTaken) / pattern.completed;
        }

        // Track preferred time
        const hour = new Date().getHours();
        if (hour < 12) pattern.preferredTime = 'morning';
        else if (hour < 17) pattern.preferredTime = 'afternoon';
        else pattern.preferredTime = 'evening';
    } else if (result.skipped) {
        // Track avoided themes
        const theme = quest.title.toLowerCase();
        if (!user.questMemory.avoidedThemes.includes(theme)) {
            user.questMemory.avoidedThemes.push(theme);
        }
    }

    // Calculate success rate
    pattern.rate = pattern.completed / pattern.totalAttempts;

    // Update pattern
    user.questMemory.successPatterns.set(domain, pattern);

    // Add to recent completions (keep last 20)
    user.questMemory.recentCompletions.unshift({
        questId: quest._id,
        domain: domain,
        difficulty: quest.difficulty,
        completedAt: result.completed ? new Date() : null,
        timeTaken: result.timeTaken || 0,
        skipped: result.skipped || false
    });

    if (user.questMemory.recentCompletions.length > 20) {
        user.questMemory.recentCompletions.pop();
    }

    // Add adaptation note
    if (result.completed && pattern.rate > 0.8) {
        user.questMemory.adaptationNotes.push({
            note: `Strong performance in ${domain} (${Math.round(pattern.rate * 100)}% success rate)`,
            type: 'success',
            createdAt: new Date()
        });
    } else if (result.skipped) {
        user.questMemory.adaptationNotes.push({
            note: `Skipped ${domain} quest (${quest.difficulty} difficulty). Consider easier alternatives.`,
            type: 'skip',
            createdAt: new Date()
        });
    }

    // Keep only last 50 notes
    if (user.questMemory.adaptationNotes.length > 50) {
        user.questMemory.adaptationNotes = user.questMemory.adaptationNotes.slice(0, 50);
    }

    await user.save();
    return user;
};

/**
 * Get behavioral insights for user
 */
export const getBehavioralInsights = (user) => {
    const insights = [];

    // Check for high-performing domains
    if (user.questMemory.successPatterns) {
        for (const [domain, pattern] of user.questMemory.successPatterns) {
            if (pattern.rate > 0.8 && pattern.totalAttempts >= 5) {
                insights.push({
                    type: 'strength',
                    message: `Your ${domain} consistency is incredible! ${Math.round(pattern.rate * 100)}% success rate`,
                    action: 'Keep that momentum going 💪',
                    domain: domain
                });
            } else if (pattern.rate < 0.5 && pattern.totalAttempts >= 3) {
                insights.push({
                    type: 'opportunity',
                    message: `${domain} quests seem challenging (${Math.round(pattern.rate * 100)}% completion)`,
                    action: 'Try easier difficulty or shorter time frames',
                    domain: domain
                });
            }
        }
    }

    // Check for time patterns
    const recentCompletions = user.questMemory.recentCompletions?.slice(0, 10) || [];
    const avgTime = recentCompletions.reduce((sum, c) => sum + (c.timeTaken || 0), 0) / recentCompletions.length;

    if (avgTime > 0 && avgTime < 30) {
        insights.push({
            type: 'pattern',
            message: `You complete ${Math.round((recentCompletions.filter(c => c.timeTaken < 30).length / recentCompletions.length) * 100)}% of quests under 30 minutes`,
            action: 'Focus on shorter, high-impact tasks',
            domain: null
        });
    }

    // Check for unexplored domains
    const onboardingDomains = user.onboardingSettings?.goalCategories || [];
    const exploredDomains = Array.from(user.questMemory.successPatterns?.keys() || []);
    const unexplored = onboardingDomains.filter(d => !exploredDomains.includes(d));

    if (unexplored.length > 0) {
        insights.push({
            type: 'opportunity',
            message: `You haven't tried ${unexplored[0]} quests yet`,
            action: 'Ready to explore something new?',
            domain: unexplored[0]
        });
    }

    return insights.slice(0, 3);  // Top 3 insights
};

/**
 * Calculate impact score for quest prioritization
 */
export const calculateImpactScore = (quest, user) => {
    let score = 0;
    const domain = quest.domain || quest.category;

    // High alignment with successful patterns
    const pattern = user.questMemory.successPatterns?.get(domain);
    if (pattern && pattern.rate > 0.7) {
        score += 30;
    }

    // Freshness (haven't done this domain recently)
    const recentDomains = user.questMemory.recentCompletions?.slice(0, 5).map(c => c.domain) || [];
    if (!recentDomains.includes(domain)) {
        score += 20;
    }

    // Momentum (current streaks in this domain)
    const recentInDomain = user.questMemory.recentCompletions?.filter(c =>
        c.domain === domain && !c.skipped
    ).slice(0, 7) || [];
    if (recentInDomain.length >= 3) {
        score += 25;  // Active in this domain
    }

    // Difficulty match
    if (quest.difficulty === user.questMemory.preferredDifficulty) {
        score += 15;
    }

    // Time feasibility
    const estimatedMinutes = parseInt(quest.userInputs?.timeAvailable) || 30;
    if (estimatedMinutes <= user.questMemory.averageCompletionTime) {
        score += 10;
    }

    return score;
};

/**
 * Generate gentler alternative for skipped quest
 */
export const generateGentlerAlternative = (skippedQuest) => {
    const suggestions = {
        difficulty: skippedQuest.difficulty === 'Hard' ? 'Medium' :
            skippedQuest.difficulty === 'Medium' ? 'Easy' : 'Easy',
        timeReduction: 0.5,  // Reduce time by 50%
        taskSimplification: true,
        encouragement: [
            "This is a gentler start. You got this! 💪",
            "Smaller steps, same direction 🚀",
            "Progress over perfection ✨"
        ]
    };

    return suggestions;
};

/**
 * Generate momentum message based on streaks
 */
export const getMomentumMessage = (streak) => {
    if (streak >= 30) return "👑 Monthly legend - you're unstoppable!";
    if (streak >= 14) return "💪 Two weeks strong - you're building habits!";
    if (streak >= 7) return "⭐ Week warrior - that's consistency!";
    if (streak >= 3) return "🔥 You're on fire!";
    return "🌟 Great start!";
};

export default {
    updateQuestMemory,
    getBehavioralInsights,
    calculateImpactScore,
    generateGentlerAlternative,
    getMomentumMessage
};
