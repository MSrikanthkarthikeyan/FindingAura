// Quest Validation Layer - Reality Checks Before Display
// Validates quests for time feasibility, concrete outputs, domain isolation, and clarity

const OUTPUT_TYPES = {
    WRITTEN_NOTE: 'Written note or summary',
    CHECKLIST: 'Completed checklist',
    EXERCISE_SET: 'Exercise set logged',
    METRIC_LOGGED: 'Measurement recorded',
    DECISION_MADE: 'Decision documented',
    FILE_CREATED: 'File or document created',
    CODE_SNIPPET: 'Working code written',
    PROTOTYPE: 'Working demo or prototype',
    PLAN_CREATED: 'Action plan documented',
    LIST_COMPILED: 'Curated list created'
};

const VAGUE_WORDS = [
    'work on', 'research', 'improve', 'explore', 'learn about',
    'study', 'look into', 'think about', 'consider', 'try to'
];

const DOMAIN_BOUNDARIES = {
    Fitness: {
        keywords: ['exercise', 'workout', 'cardio', 'strength', 'yoga', 'fitness', 'training', 'gym'],
        forbidden: ['code', 'programming', 'work', 'job', 'study', 'exam']
    },
    Career: {
        keywords: ['job', 'career', 'resume', 'interview', 'networking', 'skills', 'professional'],
        forbidden: ['exercise', 'workout', 'meditation', 'relationship']
    },
    Learning: {
        keywords: ['study', 'course', 'tutorial', 'practice', 'lesson', 'skill', 'concept'],
        forbidden: ['exercise', 'job search', 'meditation']
    },
    'Personal Development': {
        keywords: ['growth', 'habit', 'mindset', 'reflection', 'journal', 'planning'],
        forbidden: ['exercise routine', 'job application', 'code project']
    },
    Health: {
        keywords: ['sleep', 'nutrition', 'meal', 'health', 'wellness', 'medical'],
        forbidden: ['work', 'career', 'coding', 'job']
    },
    Mindfulness: {
        keywords: ['meditation', 'breathing', 'mindfulness', 'relaxation', 'calm'],
        forbidden: ['exercise', 'work', 'study', 'code']
    },
    Creativity: {
        keywords: ['create', 'design', 'art', 'music', 'write', 'craft'],
        forbidden: ['work task', 'job', 'career']
    },
    Productivity: {
        keywords: ['organize', 'plan', 'schedule', 'system', 'workflow', 'efficiency'],
        forbidden: ['exercise', 'meditation']
    }
};

/**
 * Validate quest for realistic constraints and clarity
 */
export const validateQuest = (quest, userContext = {}) => {
    const issues = [];
    const warnings = [];

    // 1. Time Feasibility Check
    if (userContext.timeAvailable) {
        const timeBuffer = userContext.timeAvailable * 1.2; // 20% buffer
        const estimatedTime = quest.tasks?.reduce((sum, task) =>
            sum + (parseInt(task.estimatedTime) || 0), 0
        ) || quest.estimatedTime || 0;

        if (estimatedTime > timeBuffer) {
            issues.push({
                type: 'TIME_UNREALISTIC',
                severity: 'BLOCKING',
                message: `Quest requires ${estimatedTime} min but only ${userContext.timeAvailable} min available`,
                field: 'estimatedTime',
                suggestion: 'Reduce scope or split into multiple quests'
            });
        } else if (estimatedTime > userContext.timeAvailable) {
            warnings.push({
                type: 'TIME_TIGHT',
                message: `Quest uses full time slot (${estimatedTime}/${userContext.timeAvailable} min)`,
                suggestion: 'Consider adding buffer time'
            });
        }
    }

    // 2. Output Type Validation
    if (!quest.outputType && !quest.deliverable) {
        issues.push({
            type: 'VAGUE_OUTPUT',
            severity: 'BLOCKING',
            message: 'Quest has no concrete deliverable or output type defined',
            field: 'outputType',
            suggestion: 'Define what the user will create/produce'
        });
    }

    // 3. Vague Language Detection
    const questText = `${quest.title} ${quest.description} ${quest.tasks?.map(t => t.title).join(' ')}`.toLowerCase();
    const foundVagueWords = VAGUE_WORDS.filter(word => questText.includes(word));

    if (foundVagueWords.length > 0) {
        const hasOutput = quest.outputType || quest.deliverable;
        const severity = hasOutput ? 'WARNING' : 'BLOCKING';

        issues.push({
            type: 'VAGUE_LANGUAGE',
            severity,
            message: `Quest contains vague language: "${foundVagueWords.join('", "')}"`,
            field: 'description',
            suggestion: hasOutput
                ? 'Consider more specific action verbs'
                : 'Replace with concrete actions (Create, Write, Log, Complete, Build)'
        });
    }

    // 4. Domain Boundary Check
    if (quest.domain && userContext.selectedDomain && quest.domain !== userContext.selectedDomain) {
        issues.push({
            type: 'DOMAIN_MISMATCH',
            severity: 'BLOCKING',
            message: `Quest domain (${quest.domain}) doesn't match selected domain (${userContext.selectedDomain})`,
            field: 'domain',
            suggestion: `Generate quest for ${userContext.selectedDomain} instead`
        });
    }

    // Check for domain contamination
    if (quest.domain && DOMAIN_BOUNDARIES[quest.domain]) {
        const boundary = DOMAIN_BOUNDARIES[quest.domain];
        const forbiddenFound = boundary.forbidden.filter(word =>
            questText.includes(word.toLowerCase())
        );

        if (forbiddenFound.length > 0) {
            issues.push({
                type: 'DOMAIN_CONTAMINATION',
                severity: 'WARNING',
                message: `Quest contains elements from other domains: "${forbiddenFound.join('", "')}"`,
                field: 'tasks',
                suggestion: `Keep quest strictly within ${quest.domain} domain`
            });
        }
    }

    // 5. Energy Level Match (if provided)
    if (userContext.energyLevel && quest.energyRequired) {
        const energyMap = { Low: 1, Medium: 2, High: 3 };
        const userEnergy = energyMap[userContext.energyLevel] || 2;
        const questEnergy = energyMap[quest.energyRequired] || 2;

        if (questEnergy > userEnergy + 1) {
            issues.push({
                type: 'ENERGY_MISMATCH',
                severity: 'WARNING',
                message: `Quest requires ${quest.energyRequired} energy but user selected ${userContext.energyLevel}`,
                field: 'energyRequired',
                suggestion: 'Simplify tasks or reduce intensity'
            });
        }
    }

    // 6. Single Objective Check
    const taskCount = quest.tasks?.length || 0;
    if (taskCount > 5) {
        warnings.push({
            type: 'TOO_MANY_TASKS',
            message: `Quest has ${taskCount} tasks - may not be single-session`,
            suggestion: 'Consider splitting into multiple focused quests'
        });
    }

    // 7. Success Criteria Check
    if (!quest.successCriteria || quest.successCriteria.length === 0) {
        warnings.push({
            type: 'NO_SUCCESS_CRITERIA',
            message: 'Quest has no defined success criteria',
            suggestion: 'Add specific completion conditions'
        });
    }

    const blocking = issues.filter(i => i.severity === 'BLOCKING');

    return {
        valid: blocking.length === 0,
        issues,
        warnings,
        blockers: blocking,
        score: calculateValidationScore(quest, issues, warnings)
    };
};

/**
 * Calculate validation quality score (0-100)
 */
const calculateValidationScore = (quest, issues, warnings) => {
    let score = 100;

    issues.forEach(issue => {
        score -= issue.severity === 'BLOCKING' ? 30 : 10;
    });

    warnings.forEach(() => {
        score -= 5;
    });

    // Bonus points
    if (quest.outputType) score += 10;
    if (quest.successCriteria?.length > 0) score += 10;
    if (quest.deliverable) score += 5;

    return Math.max(0, Math.min(100, score));
};

/**
 * Auto-rescope quest to fix validation issues
 */
export const rescopeQuest = (quest, validationResult, userContext) => {
    const rescoped = { ...quest };
    let changes = [];

    validationResult.blockers.forEach(issue => {
        switch (issue.type) {
            case 'TIME_UNREALISTIC':
                // Reduce tasks or time estimates
                const reductionFactor = userContext.timeAvailable / (rescoped.estimatedTime || 30);
                rescoped.tasks = rescoped.tasks?.slice(0, Math.ceil(rescoped.tasks.length * reductionFactor));
                rescoped.estimatedTime = userContext.timeAvailable * 0.9; // 90% of available
                changes.push(`Reduced to fit ${userContext.timeAvailable} minutes`);
                break;

            case 'VAGUE_OUTPUT':
                // Add a default output type based on domain
                rescoped.outputType = 'CHECKLIST';
                rescoped.deliverable = 'Completed action checklist';
                changes.push('Added concrete deliverable');
                break;

            case 'VAGUE_LANGUAGE':
                // Add output description to clarify
                if (!rescoped.deliverable) {
                    rescoped.deliverable = `${rescoped.outputType || 'Document'} showing completion`;
                    changes.push('Specified expected output');
                }
                break;

            case 'ENERGY_MISMATCH':
                // Reduce intensity
                rescoped.difficulty = 'Easy';
                rescoped.energyRequired = userContext.energyLevel;
                changes.push(`Adjusted to ${userContext.energyLevel} energy`);
                break;
        }
    });

    return {
        rescoped,
        changes,
        autoFixed: changes.length > 0
    };
};

/**
 * Generate alternative quest when current one is unrealistic
 */
export const generateAlternative = (failedQuest, validationResult, userContext) => {
    const mainIssue = validationResult.blockers[0];

    const alternatives = {
        TIME_UNREALISTIC: {
            message: `"${failedQuest.title}" cannot fit in ${userContext.timeAvailable} minutes.`,
            suggestions: [
                {
                    title: 'Break it down',
                    description: `Complete just the first step as a standalone quest`,
                    action: 'Create smaller quest'
                },
                {
                    title: 'Shorter version',
                    description: `${failedQuest.title} - Quick Start (${Math.floor(userContext.timeAvailable * 0.8)} min)`,
                    action: 'Generate condensed version'
                }
            ]
        },
        VAGUE_OUTPUT: {
            message: `"${failedQuest.title}" is too vague. What should you produce?`,
            suggestions: [
                {
                    title: 'Create a note',
                    description: 'Write a short summary or list',
                    action: 'Define output as WRITTEN_NOTE'
                },
                {
                    title: 'Make a checklist',
                    description: 'List specific actions or items',
                    action: 'Define output as CHECKLIST'
                }
            ]
        },
        DOMAIN_MISMATCH: {
            message: `This quest is for ${failedQuest.domain} but you selected ${userContext.selectedDomain}.`,
            suggestions: [
                {
                    title: 'Generate for correct domain',
                    description: `Create ${userContext.selectedDomain} quest instead`,
                    action: 'Regenerate with correct domain'
                }
            ]
        }
    };

    return alternatives[mainIssue?.type] || {
        message: 'This quest has validation issues.',
        suggestions: [
            {
                title: 'Try again',
                description: 'Generate a new quest with clearer parameters',
                action: 'Regenerate'
            }
        ]
    };
};

export default {
    validateQuest,
    rescopeQuest,
    generateAlternative,
    OUTPUT_TYPES,
    VAGUE_WORDS,
    DOMAIN_BOUNDARIES
};
