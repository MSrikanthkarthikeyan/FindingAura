import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'first_quest', 'quest_master', 'streak_warrior', 'habit_builder',
            'consistency_king', 'level_up', 'perfectionist', 'early_bird',
            'night_owl', 'social_butterfly', 'leader', 'challenger'
        ],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: '🏆'
    },
    rarity: {
        type: String,
        enum: ['common', 'rare', 'epic', 'legendary'],
        default: 'common'
    },
    xpBonus: {
        type: Number,
        default: 100
    },
    unlockedAt: {
        type: Date,
        default: Date.now
    },
    progress: {
        current: { type: Number, default: 0 },
        target: { type: Number, required: true }
    }
}, {
    timestamps: true
});

const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement;
