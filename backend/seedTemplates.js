import QuestTemplate from './models/QuestTemplate.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const templates = [
    {
        name: 'Morning Workout Routine',
        category: 'Fitness',
        type: 'daily',
        difficulty: 'Medium',
        description: 'Start your day with an energizing workout session',
        tasks: [
            { title: 'Warm-up stretches', description: 'Dynamic stretching for 5 minutes', estimatedTime: '5 minutes' },
            { title: 'Cardio session', description: 'Running, cycling, or jumping jacks', estimatedTime: '20 minutes' },
            { title: 'Cool down', description: 'Light stretching and breathing exercises', estimatedTime: '5 minutes' }
        ],
        tags: ['fitness', 'morning', 'health']
    },
    {
        name: 'Weekly Career Sprint',
        category: 'Career',
        type: 'weekly',
        difficulty: 'Hard',
        description: 'Advance your career with focused weekly goals',
        tasks: [
            { title: 'Set weekly objectives', description: 'Define 3 key career goals for the week', estimatedTime: '30 minutes' },
            { title: 'Skill development', description: 'Learn something new related to your field', estimatedTime: '2 hours' },
            { title: 'Networking', description: 'Connect with 2 industry professionals', estimatedTime: '1 hour' },
            { title: 'Progress review', description: 'Evaluate achievements and adjust plans', estimatedTime: '30 minutes' }
        ],
        tags: ['career', 'professional', 'growth']
    },
    {
        name: 'Mindfulness Daily Practice',
        category: 'Mindfulness',
        type: 'daily',
        difficulty: 'Easy',
        description: 'Cultivate peace and presence through daily mindfulness',
        tasks: [
            { title: 'Morning meditation', description: '10 minutes of quiet meditation', estimatedTime: '10 minutes' },
            { title: 'Gratitude journaling', description: 'Write 3 things you\'re grateful for', estimatedTime: '5 minutes' },
            { title: 'Mindful breathing', description: 'Evening breathing exercise', estimatedTime: '5 minutes' }
        ],
        tags: ['mindfulness', 'meditation', 'wellness']
    },
    {
        name: 'Monthly Financial Review',
        category: 'Finance',
        type: 'monthly',
        difficulty: 'Medium',
        description: 'Take control of your finances with monthly check-ins',
        tasks: [
            { title: 'Track expenses', description: 'Review all spending from the past month', estimatedTime: '1 hour' },
            { title: 'Budget planning', description: 'Create budget for next month', estimatedTime: '45 minutes' },
            { title: 'Savings goals', description: 'Review and adjust savings targets', estimatedTime: '30 minutes' },
            { title: 'Investment review', description: 'Check portfolio performance', estimatedTime: '45 minutes' }
        ],
        tags: ['finance', 'budgeting', 'savings']
    },
    {
        name: 'Creative Daily Practice',
        category: 'Creativity',
        type: 'daily',
        difficulty: 'Easy',
        description: 'Nurture your creativity with daily creative exercises',
        tasks: [
            { title: 'Creative warm-up', description: 'Doodle, freewrite, or brainstorm', estimatedTime: '10 minutes' },
            { title: 'Main project work', description: 'Work on your creative project', estimatedTime: '30 minutes' },
            { title: 'Inspiration time', description: 'Consume inspiring content', estimatedTime: '15 minutes' }
        ],
        tags: ['creativity', 'art', 'inspiration']
    },
    {
        name: 'Learning Sprint',
        category: 'Learning',
        type: 'weekly',
        difficulty: 'Medium',
        description: 'Master new skills through structured weekly learning',
        tasks: [
            { title: 'Course selection', description: 'Choose topic and resources', estimatedTime: '30 minutes' },
            { title: 'Study sessions', description: 'Complete 3 study sessions this week', estimatedTime: '3 hours' },
            { title: 'Practice projects', description: 'Apply what you learned', estimatedTime: '2 hours' },
            { title: 'Knowledge test', description: 'Quiz yourself on new concepts', estimatedTime: '30 minutes' }
        ],
        tags: ['learning', 'education', 'skills']
    },
    {
        name: 'Health Check Weekly',
        category: 'Health',
        type: 'weekly',
        difficulty: 'Easy',
        description: 'Monitor and improve your overall health weekly',
        tasks: [
            { title: 'Meal planning', description: 'Plan healthy meals for the week', estimatedTime: '45 minutes' },
            { title: 'Exercise routine', description: 'Complete 3 workout sessions', estimatedTime: '3 hours' },
            { title: 'Sleep tracking', description: 'Monitor sleep quality each night', estimatedTime: '10 minutes' },
            { title: 'Wellness reflection', description: 'Journal about physical & mental health', estimatedTime: '15 minutes' }
        ],
        tags: ['health', 'wellness', 'fitness']
    },
    {
        name: 'Productivity Powerhouse',
        category: 'Productivity',
        type: 'daily',
        difficulty: 'Medium',
        description: 'Maximize your daily productivity and efficiency',
        tasks: [
            { title: 'Priority planning', description: 'Identify top 3 tasks for the day', estimatedTime: '10 minutes' },
            { title: 'Deep work session', description: 'Focused work on important task', estimatedTime: '90 minutes' },
            { title: 'Quick wins', description: 'Complete 5 small tasks', estimatedTime: '30 minutes' },
            { title: 'Day review', description: 'Reflect on accomplishments', estimatedTime: '10 minutes' }
        ],
        tags: ['productivity', 'focus', 'efficiency']
    },
    {
        name: 'Relationship Builder',
        category: 'Relationships',
        type: 'weekly',
        difficulty: 'Easy',
        description: 'Strengthen your relationships with intentional connection',
        tasks: [
            { title: 'Quality time', description: 'Spend dedicated time with loved ones', estimatedTime: '2 hours' },
            { title: 'Reach out', description: 'Contact 3 friends or family members', estimatedTime: '30 minutes' },
            { title: 'Acts of kindness', description: 'Do something thoughtful for someone', estimatedTime: '1 hour' },
            { title: 'Reflection', description: 'Journal about your connections', estimatedTime: '15 minutes' }
        ],
        tags: ['relationships', 'connection', 'social']
    },
    {
        name: 'Year of Transformation',
        category: 'Personal Development',
        type: 'yearly',
        difficulty: 'Hard',
        description: 'Transform your life over the next year with consistent growth',
        tasks: [
            { title: 'Vision creation', description: 'Define your year-long vision and goals', estimatedTime: '3 hours' },
            { title: 'Quarterly planning', description: 'Break down into quarterly milestones', estimatedTime: '2 hours' },
            { title: 'Monthly reviews', description: 'Review progress each month', estimatedTime: '12 hours' },
            { title: 'Skill mastery', description: 'Master one major skill or area', estimatedTime: '200 hours' },
            { title: 'Year-end reflection', description: 'Comprehensive review and celebration', estimatedTime: '4 hours' }
        ],
        tags: ['transformation', 'annual', 'goals']
    }
];

const seedTemplates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await QuestTemplate.deleteMany({});
        console.log('Cleared existing templates');

        await QuestTemplate.insertMany(templates);
        console.log('Seeded quest templates successfully!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding templates:', error);
        process.exit(1);
    }
};

seedTemplates();
