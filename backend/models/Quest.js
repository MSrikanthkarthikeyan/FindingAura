import mongoose from 'mongoose';

const questSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    tasks: [{
        title: String,
        description: String,
        estimatedTime: String,
        completed: { type: Boolean, default: false },
        completedAt: Date
    }],
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'failed'],
        default: 'pending'
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    xpReward: {
        type: Number,
        default: 50
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    completedAt: Date,
    aiGenerated: {
        type: Boolean,
        default: true
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    // New fields for enhanced quest generation
    domain: {
        type: String,
        default: null
    },
    reasoning: {
        type: String,
        default: null
    },
    successCriteria: [{
        type: String
    }],
    userInputs: {
        specificGoal: String,
        timeAvailable: String,
        constraints: String,
        preferences: String
    },
    intentMapping: {
        userSelections: {
            domain: String,
            specificGoal: String,
            timeAvailable: String,
            difficulty: String,
            constraints: String
        },
        aiReasoning: String,
        pastPatterns: {
            domainSuccessRate: Number,
            preferredTime: String,
            lastCompletedInDomain: Date,
            consecutiveDays: Number
        },
        impactScore: { type: Number, default: 0 },
        isMainQuest: { type: Boolean, default: false },
        confirmed: { type: Boolean, default: false },  // User confirmed intent
        confirmedAt: Date
    },
    // Reality-aware quest fields
    outputType: {
        type: String,
        enum: [
            'WRITTEN_NOTE', 'CHECKLIST', 'EXERCISE_SET', 'METRIC_LOGGED',
            'DECISION_MADE', 'FILE_CREATED', 'CODE_SNIPPET', 'PROTOTYPE',
            'PLAN_CREATED', 'LIST_COMPILED', null
        ],
        default: null
    },
    deliverable: {
        type: String,  // Concrete description of what user will produce
        default: null
    },
    energyRequired: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    validation: {
        validated: { type: Boolean, default: false },
        validatedAt: Date,
        score: { type: Number, default: 0 },  // 0-100 validation quality score
        issues: [{
            type: String,
            severity: String,
            message: String
        }],
        autoRescoped: { type: Boolean, default: false },
        rescopeChanges: [String]
    },
    estimatedTime: {  // Total estimated minutes (not in tasks)
        type: Number,
        default: 30
    },
    skipped: { type: Boolean, default: false },
    skipReason: String,
    timeTaken: Number,  // actual minutes taken to complete
    editCount: { type: Number, default: 0 }  // Track how many times user edited
}, {
    timestamps: true
});

// Calculate progress based on completed tasks
questSchema.methods.updateProgress = function () {
    if (this.tasks.length === 0) {
        this.progress = 0;
    } else {
        const completedTasks = this.tasks.filter(task => task.completed).length;
        this.progress = Math.round((completedTasks / this.tasks.length) * 100);
    }

    if (this.progress === 100 && this.status !== 'completed') {
        this.status = 'completed';
        this.completedAt = new Date();
    } else if (this.progress > 0 && this.status === 'pending') {
        this.status = 'in-progress';
    }
};

const Quest = mongoose.model('Quest', questSchema);
export default Quest;
