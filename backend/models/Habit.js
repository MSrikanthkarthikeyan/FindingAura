import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add a habit name'],
        trim: true
    },
    category: {
        type: String,
        required: true
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'daily'
    },
    targetCount: {
        type: Number,
        default: 1
    },
    completionHistory: [{
        date: {
            type: Date,
            default: Date.now
        },
        count: {
            type: Number,
            default: 1
        },
        notes: String
    }],
    currentStreak: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    totalCompletions: {
        type: Number,
        default: 0
    },
    wins: {
        type: Number,
        default: 0
    },
    losses: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLoggedDate: {
        type: Date,
        default: null
    },
    calendarData: [{
        date: Date,
        logged: Boolean,
        streakDay: Number
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate streaks
habitSchema.methods.updateStreaks = function () {
    if (this.completionHistory.length === 0) {
        this.currentStreak = 0;
        return;
    }

    // Sort by date descending
    const sorted = this.completionHistory.sort((a, b) => b.date - a.date);
    let streak = 0;
    let currentDate = new Date();

    for (let i = 0; i < sorted.length; i++) {
        const completionDate = new Date(sorted[i].date);
        const daysDiff = Math.floor((currentDate - completionDate) / (1000 * 60 * 60 * 24));

        if (daysDiff === i) {
            streak++;
        } else {
            break;
        }
    }

    this.currentStreak = streak;
    if (streak > this.longestStreak) {
        this.longestStreak = streak;
    }
};

const Habit = mongoose.model('Habit', habitSchema);
export default Habit;
