import mongoose from 'mongoose';

const questTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    description: {
        type: String,
        required: true
    },
    tasks: [{
        title: String,
        description: String,
        estimatedTime: String
    }],
    tags: [String],
    isPublic: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: String,
        default: 'system'
    },
    usageCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const QuestTemplate = mongoose.model('QuestTemplate', questTemplateSchema);
export default QuestTemplate;
