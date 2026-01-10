import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    onboardingSettings: {
        goalCategories: [{
            type: String,
            enum: ['Fitness', 'Career', 'Personal Development', 'Health', 'Finance', 'Relationships', 'Creativity', 'Learning', 'Productivity', 'Mindfulness']
        }],
        questFrequency: {
            daily: { type: Boolean, default: true },
            weekly: { type: Boolean, default: true },
            monthly: { type: Boolean, default: true },
            yearly: { type: Boolean, default: false }
        },
        difficultyLevel: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard', 'Mixed'],
            default: 'Medium'
        },
        timeCommitment: {
            type: String,
            enum: ['15min', '30min', '1hour', '2hours', 'Flexible'],
            default: '30min'
        }
    },
    stats: {
        totalQuestsCompleted: { type: Number, default: 0 },
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        level: { type: Number, default: 0 },
        xp: { type: Number, default: 0 },
        lastQuestCompletedDate: Date
    },
    pomodoroSettings: {
        sessionDuration: { type: Number, default: 25 },  // minutes
        shortBreak: { type: Number, default: 5 },
        longBreak: { type: Number, default: 15 },
        sessionsUntilLongBreak: { type: Number, default: 4 }
    },
    pomodoroStats: {
        totalSessions: { type: Number, default: 0 },
        todaySessions: { type: Number, default: 0 },
        lastSessionDate: Date
    },
    questMemory: {
        completedThemes: [{ type: String }],  // e.g., ['cardio', 'meditation', 'python']
        avoidedThemes: [{ type: String }],    // e.g., ['early-morning', 'complex-math']
        successPatterns: {
            type: Map,
            of: new mongoose.Schema({
                totalAttempts: { type: Number, default: 0 },
                completed: { type: Number, default: 0 },
                rate: { type: Number, default: 0 },
                preferredTime: { type: String },
                averageCompletionTime: { type: Number },  // minutes
                lastAttempt: Date
            }, { _id: false }),
            default: {}
        },
        recentCompletions: [{
            questId: mongoose.Schema.Types.ObjectId,
            domain: String,
            difficulty: String,
            completedAt: Date,
            timeTaken: Number,  // minutes
            skipped: { type: Boolean, default: false }
        }],
        adaptationNotes: [{
            note: String,
            createdAt: { type: Date, default: Date.now },
            type: { type: String, enum: ['pattern', 'preference', 'skip', 'success'] }
        }],
        preferredDifficulty: { type: String, default: 'Medium' },
        averageCompletionTime: { type: Number, default: 30 }  // minutes
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
