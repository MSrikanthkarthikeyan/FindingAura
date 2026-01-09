import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronRight, ChevronLeft, Sparkles, Target, Clock, AlertCircle,
    Zap, TrendingUp, BookOpen, DollarSign, Heart, Users, Palette, Brain, Activity
} from 'lucide-react';
import api from '../services/api';

const DOMAINS = [
    { name: 'Fitness', icon: Activity, color: '#ef4444', description: 'Physical health and exercise' },
    { name: 'Career', icon: TrendingUp, color: '#3b82f6', description: 'Professional growth and skills' },
    { name: 'Learning', icon: BookOpen, color: '#8b5cf6', description: 'Education and knowledge' },
    { name: 'Finance', icon: DollarSign, color: '#10b981', description: 'Money and budgeting' },
    { name: 'Personal Development', icon: Brain, color: '#f59e0b', description: 'Self-improvement' },
    { name: 'Health', icon: Heart, color: '#ec4899', description: 'Overall wellness' },
    { name: 'Creativity', icon: Palette, color: '#14b8a6', description: 'Art and creative pursuits' },
    { name: 'Productivity', icon: Zap, color: '#6366f1', description: 'Time and task management' },
    { name: 'Relationships', icon: Users, color: '#f97316', description: 'Social connections' },
    { name: 'Mindfulness', icon: Target, color: '#a855f7', description: 'Mental clarity and presence' }
];

const QuestGenerationWizard = ({ isOpen, onClose, questType, onQuestCreated }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const [formData, setFormData] = useState({
        domain: '',
        specificGoal: '',
        difficulty: 'Medium',
        timeAvailable: '30',
        constraints: '',
        preferences: ''
    });

    const [editableQuest, setEditableQuest] = useState(null);

    const resetWizard = () => {
        setStep(1);
        setFormData({
            domain: '',
            specificGoal: '',
            difficulty: 'Medium',
            timeAvailable: '30',
            constraints: '',
            preferences: ''
        });
        setPreview(null);
        setEditableQuest(null);
    };

    const handleClose = () => {
        resetWizard();
        onClose();
    };

    const handleDomainSelect = (domain) => {
        setFormData({ ...formData, domain });
        setStep(2);
    };

    const handleGeneratePreview = async () => {
        setLoading(true);
        try {
            const response = await api.post('/quests/generate-with-inputs?preview=true', {
                ...formData,
                questType
            });

            setPreview(response.data.preview);
            setEditableQuest({
                ...response.data.preview,
                tasks: response.data.preview.tasks || []
            });
            setStep(4);
        } catch (error) {
            console.error('Preview generation error:', error);
            alert('Failed to generate quest preview. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveQuest = async () => {
        setLoading(true);
        try {
            const response = await api.post('/quests/generate-with-inputs', {
                ...formData,
                questType
            });

            onQuestCreated(response.data);
            handleClose();
        } catch (error) {
            console.error('Quest creation error:', error);
            alert('Failed to create quest. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateTask = (index, field, value) => {
        const updatedTasks = [...editableQuest.tasks];
        updatedTasks[index] = { ...updatedTasks[index], [field]: value };
        setEditableQuest({ ...editableQuest, tasks: updatedTasks });
    };

    const addTask = () => {
        setEditableQuest({
            ...editableQuest,
            tasks: [
                ...editableQuest.tasks,
                { title: '', description: '', estimatedTime: '10 minutes' }
            ]
        });
    };

    const removeTask = (index) => {
        const updatedTasks = editableQuest.tasks.filter((_, i) => i !== index);
        setEditableQuest({ ...editableQuest, tasks: updatedTasks });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.75)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem',
                    overflowY: 'auto'
                }}
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="card"
                    style={{
                        width: '100%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        margin: 'auto'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                        <div className="flex" style={{ gap: '0.5rem', alignItems: 'center' }}>
                            <Sparkles size={24} color="#6366f1" />
                            <h3>Generate {questType.charAt(0).toUpperCase() + questType.slice(1)} Quest</h3>
                        </div>
                        <button onClick={handleClose} className="btn btn-ghost">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex" style={{ gap: '0.5rem', marginBottom: '2rem' }}>
                        {[1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                style={{
                                    flex: 1,
                                    height: '4px',
                                    background: s <= step ? 'var(--primary)' : 'var(--glass-border)',
                                    borderRadius: '2px',
                                    transition: 'background 0.3s'
                                }}
                            />
                        ))}
                    </div>

                    {/* Step 1: Domain Selection */}
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h4 style={{ marginBottom: '1rem' }}>Select Your Domain</h4>
                            <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                                Choose the life area this quest will focus on
                            </p>

                            <div className="grid grid-2" style={{ gap: '1rem' }}>
                                {DOMAINS.map((domain) => {
                                    const Icon = domain.icon;
                                    return (
                                        <button
                                            key={domain.name}
                                            onClick={() => handleDomainSelect(domain.name)}
                                            className="card"
                                            style={{
                                                padding: '1.5rem',
                                                border: '2px solid transparent',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                textAlign: 'left'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = domain.color;
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = 'transparent';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <Icon size={32} color={domain.color} style={{ marginBottom: '0.75rem' }} />
                                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{domain.name}</div>
                                            <div className="text-secondary" style={{ fontSize: '0.875rem' }}>
                                                {domain.description}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Specific Goal */}
                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h4 style={{ marginBottom: '1rem' }}>What's Your Specific Goal?</h4>
                            <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                                Be specific! Instead of "get fit", try "run 5K without stopping"
                            </p>

                            <div className="form-group">
                                <label className="form-label">Specific Goal *</label>
                                <textarea
                                    className="form-input"
                                    rows={4}
                                    placeholder="e.g., Learn Python list comprehensions and use them in 3 real projects"
                                    value={formData.specificGoal}
                                    onChange={(e) => setFormData({ ...formData, specificGoal: e.target.value })}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <div className="flex" style={{ gap: '1rem', marginTop: '2rem' }}>
                                <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>
                                    <ChevronLeft size={18} />
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    className="btn btn-primary"
                                    disabled={!formData.specificGoal.trim()}
                                    style={{ flex: 1 }}
                                >
                                    Next
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Parameters */}
                    {step === 3 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h4 style={{ marginBottom: '1rem' }}>Set Quest Parameters</h4>

                            <div className="form-group">
                                <label className="form-label">
                                    <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                    Time Available (minutes)
                                </label>
                                <input
                                    type="number"
                                    className="form-input"
                                    min="10"
                                    max="240"
                                    value={formData.timeAvailable}
                                    onChange={(e) => setFormData({ ...formData, timeAvailable: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Difficulty</label>
                                <div className="flex" style={{ gap: '1rem' }}>
                                    {['Easy', 'Medium', 'Hard'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setFormData({ ...formData, difficulty: level })}
                                            className={`btn ${formData.difficulty === level ? 'btn-primary' : 'btn-ghost'}`}
                                            style={{ flex: 1 }}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Constraints (optional)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., No screen time after 9pm, limited budget"
                                    value={formData.constraints}
                                    onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Preferences (optional)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Prefer hands-on projects over theory"
                                    value={formData.preferences}
                                    onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                                />
                            </div>

                            <div className="flex" style={{ gap: '1rem', marginTop: '2rem' }}>
                                <button onClick={() => setStep(2)} className="btn btn-secondary" style={{ flex: 1 }}>
                                    <ChevronLeft size={18} />
                                    Back
                                </button>
                                <button
                                    onClick={handleGeneratePreview}
                                    className="btn btn-primary"
                                    disabled={loading}
                                    style={{ flex: 1 }}
                                >
                                    {loading ? (
                                        <>
                                            <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={18} />
                                            Generate Preview
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Preview & Edit */}
                    {step === 4 && editableQuest && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h4 style={{ marginBottom: '1rem' }}>Review & Edit Your Quest</h4>

                            {/* Reasoning */}
                            {preview?.reasoning && (
                                <div
                                    style={{
                                        padding: '1rem',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: '1.5rem',
                                        borderLeft: '4px solid var(--primary)'
                                    }}
                                >
                                    <div className="flex" style={{ gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <AlertCircle size={18} color="var(--primary)" />
                                        <strong>Why this quest?</strong>
                                    </div>
                                    <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                                        {preview.reasoning}
                                    </p>
                                </div>
                            )}

                            {/* Title */}
                            <div className="form-group">
                                <label className="form-label">Quest Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editableQuest.title}
                                    onChange={(e) => setEditableQuest({ ...editableQuest, title: e.target.value })}
                                />
                            </div>

                            {/* Description */}
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-input"
                                    rows={3}
                                    value={editableQuest.description}
                                    onChange={(e) => setEditableQuest({ ...editableQuest, description: e.target.value })}
                                />
                            </div>

                            {/* Tasks */}
                            <div className="form-group">
                                <label className="form-label">Tasks</label>
                                {editableQuest.tasks.map((task, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: '1rem',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: 'var(--radius-md)',
                                            marginBottom: '1rem'
                                        }}
                                    >
                                        <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                                            <strong style={{ fontSize: '0.875rem' }}>Task {index + 1}</strong>
                                            {editableQuest.tasks.length > 1 && (
                                                <button
                                                    onClick={() => removeTask(index)}
                                                    className="btn btn-ghost"
                                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Task title"
                                            value={task.title}
                                            onChange={(e) => updateTask(index, 'title', e.target.value)}
                                            style={{ marginBottom: '0.5rem' }}
                                        />
                                        <textarea
                                            className="form-input"
                                            rows={2}
                                            placeholder="Task description"
                                            value={task.description}
                                            onChange={(e) => updateTask(index, 'description', e.target.value)}
                                            style={{ marginBottom: '0.5rem' }}
                                        />
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Estimated time"
                                            value={task.estimatedTime}
                                            onChange={(e) => updateTask(index, 'estimatedTime', e.target.value)}
                                        />
                                    </div>
                                ))}
                                <button onClick={addTask} className="btn btn-secondary" style={{ width: '100%' }}>
                                    + Add Task
                                </button>
                            </div>

                            {/* Success Criteria */}
                            {preview?.successCriteria && preview.successCriteria.length > 0 && (
                                <div
                                    style={{
                                        padding: '1rem',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: '1.5rem'
                                    }}
                                >
                                    <strong style={{ display: 'block', marginBottom: '0.75rem' }}>Success Criteria:</strong>
                                    <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                                        {preview.successCriteria.map((criteria, index) => (
                                            <li key={index} className="text-secondary" style={{ marginBottom: '0.5rem' }}>
                                                {criteria}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex" style={{ gap: '1rem', marginTop: '2rem' }}>
                                <button onClick={() => setStep(3)} className="btn btn-secondary" style={{ flex: 1 }}>
                                    <ChevronLeft size={18} />
                                    Back
                                </button>
                                <button
                                    onClick={handleSaveQuest}
                                    className="btn btn-primary"
                                    disabled={loading}
                                    style={{ flex: 1 }}
                                >
                                    {loading ? (
                                        <>
                                            <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Quest'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default QuestGenerationWizard;
