import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Domain-specific prompt templates for actionable, measurable quests
const DOMAIN_PROMPTS = {
    'Fitness': {
        focus: 'specific exercises, reps, sets, duration, heart rate targets, measurable physical metrics',
        example: 'Complete 3 sets of 15 push-ups, 20 squats, and 10-minute plank hold, targeting 140+ BPM',
        avoid: 'generic "workout" or "exercise" - be specific about movements and targets'
    },
    'Career': {
        focus: 'deliverables, skills to learn, projects to complete, networking goals, certifications',
        example: 'Build and deploy a REST API with authentication, write 3 unit tests, document endpoints',
        avoid: 'vague "improve skills" - specify exact skills and how to demonstrate them'
    },
    'Learning': {
        focus: 'chapters read, concepts mastered, practice problems solved, projects built',
        example: 'Complete Python chapters 5-7, solve 10 LeetCode easy problems, build a CLI tool',
        avoid: 'generic "study" - specify what to learn and how to verify understanding'
    },
    'Finance': {
        focus: 'amounts saved, budget categories reviewed, investments researched, transactions tracked',
        example: 'Review last month expenses, create budget for 3 categories, research 2 index funds',
        avoid: 'vague "manage money" - specify exact financial actions and numbers'
    },
    'Personal Development': {
        focus: 'journaling entries, self-reflection prompts, habits tracked, books read',
        example: 'Journal 3 gratitude items daily, read 30 pages of "Atomic Habits", track mood daily',
        avoid: 'generic "self-improvement" - specify activities and measurements'
    },
    'Health': {
        focus: 'meals logged, water intake, sleep hours, meditation minutes, health metrics',
        example: 'Log 3 meals daily in app, drink 8 glasses water, sleep 7-8 hours, 10-min meditation',
        avoid: 'vague "be healthy" - specify trackable health behaviors'
    },
    'Creativity': {
        focus: 'pieces created, techniques practiced, ideas generated, projects completed',
        example: 'Sketch 5 character designs, practice shading technique, complete 1 full illustration',
        avoid: 'generic "be creative" - specify what to create and how much'
    },
    'Productivity': {
        focus: 'tasks completed, time blocks scheduled, distractions eliminated, systems implemented',
        example: 'Complete 3 priority tasks, use Pomodoro for 4 sessions, zero inbox by EOD',
        avoid: 'vague "be productive" - specify tasks and time management techniques'
    },
    'Relationships': {
        focus: 'quality time scheduled, conversations had, activities done together, gestures made',
        example: 'Call 2 friends for 15min each, plan date night, write thank-you note to family',
        avoid: 'generic "connect" - specify who, how, and for how long'
    },
    'Mindfulness': {
        focus: 'meditation minutes, breathing exercises, mindful moments, awareness practices',
        example: '10-minute guided meditation, 5 mindful breaths every 2 hours, evening gratitude',
        avoid: 'vague "be mindful" - specify practices, duration, and frequency'
    }
};

class AIService {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    }

    /**
     * Generate quests with explicit user inputs (new enhanced method)
     */
    async generateQuestsWithInputs(user, inputs) {
        const { domain, specificGoal, difficulty, timeAvailable, constraints, preferences, questType } = inputs;

        const domainGuidance = DOMAIN_PROMPTS[domain] || DOMAIN_PROMPTS['Personal Development'];

        const timeMinutes = parseInt(timeAvailable) || 30;

        const prompt = `You are AuraQuest, an AI that generates hyper-specific, actionable, and measurable productivity quests.

USER INPUT:
- Domain: ${domain}
- Specific Goal: "${specificGoal}"
- Difficulty: ${difficulty}
- Time Available: ${timeMinutes} minutes
- Constraints: ${constraints || 'None'}
- Preferences: ${preferences || 'None'}
- Quest Type: ${questType}
- User Level: ${user.stats.level}

DOMAIN GUIDANCE FOR ${domain}:
- Focus on: ${domainGuidance.focus}
- Example: ${domainGuidance.example}
- AVOID: ${domainGuidance.avoid}

CRITICAL REQUIREMENTS:
1. Title must be SPECIFIC to the goal (not generic like "Daily ${domain} Challenge")
2. Each task must have MEASURABLE outcomes (numbers, deliverables, completion criteria)
3. Tasks must be ACTIONABLE (verbs: complete, build, write, track, measure, not "work on")
4. Include SUCCESS CRITERIA that can be objectively verified
5. Total task time should sum to approximately ${timeMinutes} minutes
6. Respect user constraints and preferences
7. NO vague phrases like "work on your goal" or "practice"

GENERATE:
- A quest title that reflects the SPECIFIC goal
- A description explaining WHY this quest matters for their growth
- 3-5 concrete tasks with measurable outcomes
- Success criteria (what "done" looks like)
- A brief reasoning explaining why this quest was generated

Return ONLY valid JSON (no markdown, no code blocks):
{
  "title": "Specific quest title related to: ${specificGoal}",
  "description": "Why this quest helps achieve ${specificGoal}",
  "category": "${domain}",
  "difficulty": "${difficulty}",
  "tasks": [
    {
      "title": "Specific task 1",
      "description": "Measurable action with clear outcome",
      "estimatedTime": "10 minutes"
    }
  ],
  "successCriteria": [
    "Criterion 1 - measurable",
    "Criterion 2 - measurable"
  ],
  "reasoning": "This quest was generated because..."
}`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            let cleanedText = text.trim();
            if (cleanedText.startsWith('```json')) {
                cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (cleanedText.startsWith('```')) {
                cleanedText = cleanedText.replace(/```\n?/g, '');
            }

            const parsed = JSON.parse(cleanedText);

            // Add metadata
            parsed.domain = domain;
            parsed.userInputs = { specificGoal, timeAvailable, constraints, preferences };

            return parsed;
        } catch (error) {
            console.error('AI Generation Error:', error);
            return this.generateFallbackQuestWithInputs(domain, specificGoal, difficulty, timeMinutes);
        }
    }

    /**
     * Original quest generation (kept for backward compatibility with templates)
     */
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

    generateFallbackQuestWithInputs(domain, specificGoal, difficulty, timeMinutes) {
        const domainGuidance = DOMAIN_PROMPTS[domain] || DOMAIN_PROMPTS['Personal Development'];

        return {
            title: `${domain}: ${specificGoal}`,
            description: `Work towards your goal: ${specificGoal}. Follow the structured tasks below.`,
            category: domain,
            difficulty: difficulty,
            domain: domain,
            tasks: [
                {
                    title: 'Research and Plan',
                    description: `Research best practices for ${specificGoal}`,
                    estimatedTime: `${Math.floor(timeMinutes * 0.3)} minutes`
                },
                {
                    title: 'Take Action',
                    description: `Work on ${specificGoal} with focus`,
                    estimatedTime: `${Math.floor(timeMinutes * 0.5)} minutes`
                },
                {
                    title: 'Review and Reflect',
                    description: 'Document progress and learnings',
                    estimatedTime: `${Math.floor(timeMinutes * 0.2)} minutes`
                }
            ],
            successCriteria: [
                'Completed all tasks within time limit',
                'Made measurable progress toward goal'
            ],
            reasoning: `This quest was generated based on your ${domain} goal: ${specificGoal}`
        };
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
