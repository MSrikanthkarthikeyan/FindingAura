import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    }

    async generateQuests(user, questType, count = 1) {
        const { goalCategories, difficultyLevel, timeCommitment } = user.onboardingSettings;

        const timeMap = {
            '15min': 15,
            '30min': 30,
            '1hour': 60,
            '2hours': 120,
            'Flexible': 45
        };

        const totalTime = timeMap[timeCommitment] || 30;

        const prompt = `You are an AI quest generator for a personal development and habit tracking app called FindingAura.

Generate ${count} ${questType} quest(s) for a user with the following preferences:
- Goal Categories: ${goalCategories.join(', ')}
- Difficulty Level: ${difficultyLevel}
- Time Commitment: ${timeCommitment} per quest
- User Level: ${user.stats.level}
- Current Streak: ${user.stats.currentStreak} days

For each quest, create:
1. A compelling title that motivates action
2. An inspiring description that explains the benefits
3. 3-5 specific, actionable tasks
4. Estimated time for each task (total should be around ${totalTime} minutes)

The quest should be:
- Specific and actionable
- Aligned with their goal categories
- Appropriate for ${questType} timeframe (daily: 1 day, weekly: 7 days, monthly: 30 days, yearly: 365 days)
- Challenging but achievable at ${difficultyLevel} difficulty

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "quests": [
    {
      "title": "Quest Title",
      "description": "Quest description",
      "category": "Category from user's preferences",
      "difficulty": "${difficultyLevel}",
      "tasks": [
        {
          "title": "Task title",
          "description": "Task description",
          "estimatedTime": "15 minutes"
        }
      ]
    }
  ]
}`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up response - remove markdown code blocks if present
            let cleanedText = text.trim();
            if (cleanedText.startsWith('```json')) {
                cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (cleanedText.startsWith('```')) {
                cleanedText = cleanedText.replace(/```\n?/g, '');
            }

            const parsed = JSON.parse(cleanedText);
            return parsed.quests || [];
        } catch (error) {
            console.error('AI Generation Error:', error);
            // Fallback to template-based quest
            return this.generateFallbackQuests(user, questType, count);
        }
    }

    generateFallbackQuests(user, questType, count) {
        const { goalCategories, difficultyLevel } = user.onboardingSettings;
        const category = goalCategories[0] || 'Personal Development';

        const questTemplates = {
            daily: {
                title: `Daily ${category} Challenge`,
                description: `Complete today's ${category.toLowerCase()} focused tasks to build momentum and progress.`,
                tasks: [
                    { title: 'Morning Review', description: 'Review your goals for the day', estimatedTime: '5 minutes' },
                    { title: 'Core Activity', description: `Work on your ${category.toLowerCase()} goal`, estimatedTime: '20 minutes' },
                    { title: 'Evening Reflection', description: 'Reflect on what you accomplished', estimatedTime: '5 minutes' }
                ]
            },
            weekly: {
                title: `Weekly ${category} Sprint`,
                description: `A week-long journey to advance your ${category.toLowerCase()} goals.`,
                tasks: [
                    { title: 'Set Weekly Goals', description: 'Define what you want to achieve this week', estimatedTime: '15 minutes' },
                    { title: 'Daily Practice', description: 'Practice daily for 20 minutes', estimatedTime: '20 minutes' },
                    { title: 'Mid-Week Review', description: 'Check your progress midway', estimatedTime: '10 minutes' },
                    { title: 'Final Push', description: 'Complete remaining tasks', estimatedTime: '30 minutes' }
                ]
            },
            monthly: {
                title: `Monthly ${category} Milestone`,
                description: `Transform your ${category.toLowerCase()} journey over the next 30 days.`,
                tasks: [
                    { title: 'Month Planning', description: 'Create a detailed monthly plan', estimatedTime: '30 minutes' },
                    { title: 'Weekly Checkpoints', description: 'Review progress weekly', estimatedTime: '15 minutes' },
                    { title: 'Skill Development', description: 'Learn something new', estimatedTime: '60 minutes' },
                    { title: 'Month-End Review', description: 'Celebrate and reflect', estimatedTime: '20 minutes' }
                ]
            },
            yearly: {
                title: `${new Date().getFullYear()} ${category} Transformation`,
                description: `Your year-long commitment to mastering ${category.toLowerCase()}.`,
                tasks: [
                    { title: 'Vision Board', description: 'Create your vision for the year', estimatedTime: '45 minutes' },
                    { title: 'Quarterly Goals', description: 'Break down into quarters', estimatedTime: '30 minutes' },
                    { title: 'Monthly Reviews', description: 'Review progress monthly', estimatedTime: '20 minutes' },
                    { title: 'Skill Mastery', description: 'Achieve mastery in key area', estimatedTime: '120 minutes' }
                ]
            }
        };

        const template = questTemplates[questType];
        const quests = [];

        for (let i = 0; i < count; i++) {
            quests.push({
                title: template.title,
                description: template.description,
                category: category,
                difficulty: difficultyLevel,
                tasks: template.tasks
            });
        }

        return quests;
    }

    async generatePersonalizedRecommendations(user, habits) {
        const prompt = `Based on this user's data, provide 3 personalized recommendations:
    
User Stats:
- Level: ${user.stats.level}
- Current Streak: ${user.stats.currentStreak}
- Total Quests Completed: ${user.stats.totalQuestsCompleted}
- Goal Categories: ${user.onboardingSettings.goalCategories.join(', ')}

Recent Habits:
${habits.map(h => `- ${h.name}: ${h.currentStreak} day streak, ${h.wins} wins, ${h.losses} losses`).join('\n')}

Provide actionable recommendations to help them improve. Return JSON format:
{
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            let cleanedText = text.trim();
            if (cleanedText.startsWith('```json')) {
                cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }

            const parsed = JSON.parse(cleanedText);
            return parsed.recommendations || [];
        } catch (error) {
            console.error('Recommendation Error:', error);
            return [
                'Keep up your daily streak to build momentum',
                'Try increasing difficulty for more XP',
                'Focus on your weakest category for balanced growth'
            ];
        }
    }
}

export default new AIService();
