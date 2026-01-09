import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Clock, Trophy, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const GOAL_CATEGORIES = [
    'Fitness', 'Career', 'Personal Development', 'Health',
    'Finance', 'Relationships', 'Creativity', 'Learning',
    'Productivity', 'Mindfulness'
];

const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard', 'Mixed'];
const TIME_COMMITMENTS = ['15min', '30min', '1hour', '2hours', 'Flexible'];

const Onboarding = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useContext(AuthContext);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        goalCategories: [],
        questFrequency: {
            daily: true,
            weekly: true,
            monthly: false,
            yearly: false
        },
        difficultyLevel: 'Medium',
        timeCommitment: '30min'
    });

    const toggleCategory = (category) => {
        setSettings({
            ...settings,
            goalCategories: settings.goalCategories.includes(category)
                ? settings.goalCategories.filter(c => c !== category)
                : [...settings.goalCategories, category]
        });
    };

    const toggleFrequency = (freq) => {
        setSettings({
            ...settings,
            questFrequency: {
                ...settings.questFrequency,
                [freq]: !settings.questFrequency[freq]
            }
        });
    };

    const handleComplete = async () => {
        if (settings.goalCategories.length === 0) {
            alert('Please select at least one goal category');
            return;
        }

        setLoading(true);
        try {
            const response = await api.put('/auth/update-settings', {
                onboardingSettings: settings
            });
            updateUser(response.data);
            navigate('/dashboard');
        } catch (error) {
            console.error('Onboarding error:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="text-center mb-3">
                            <Target size={48} color="#6366f1" style={{ margin: '0 auto 1rem' }} />
                            <h2>Choose Your Goals</h2>
                            <p className="text-secondary">Select the areas you want to improve</p>
                        </div>

                        <div className="grid grid-2" style={{ gap: '0.75rem' }}>
                            {GOAL_CATEGORIES.map((category) => (
                                <motion.button
                                    key={category}
                                    onClick={() => toggleCategory(category)}
                                    className={`card ${settings.goalCategories.includes(category) ? 'selected' : ''}`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        background: settings.goalCategories.includes(category)
                                            ? 'var(--gradient-primary)'
                                            : 'var(--bg-elevated)',
                                        border: settings.goalCategories.includes(category)
                                            ? '2px solid var(--primary)'
                                            : '1px solid var(--glass-border)',
                                        position: 'relative'
                                    }}
                                >
                                    {settings.goalCategories.includes(category) && (
                                        <Check
                                            size={20}
                                            style={{
                                                position: 'absolute',
                                                top: '0.5rem',
                                                right: '0.5rem',
                                                color: 'white'
                                            }}
                                        />
                                    )}
                                    <span style={{ fontWeight: 600, color: settings.goalCategories.includes(category) ? 'white' : 'var(--text-primary)' }}>
                                        {category}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                );

            case 2:
                return (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="text-center mb-3">
                            <Clock size={48} color="#6366f1" style={{ margin: '0 auto 1rem' }} />
                            <h2>Quest Preferences</h2>
                            <p className="text-secondary">Customize your quest experience</p>
                        </div>

                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Quest Frequency</h4>
                            <div className="grid grid-2" style={{ gap: '0.75rem' }}>
                                {Object.keys(settings.questFrequency).map((freq) => (
                                    <motion.button
                                        key={freq}
                                        onClick={() => toggleFrequency(freq)}
                                        className="card"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            padding: '1rem',
                                            cursor: 'pointer',
                                            background: settings.questFrequency[freq]
                                                ? 'var(--gradient-primary)'
                                                : 'var(--bg-tertiary)',
                                            border: settings.questFrequency[freq]
                                                ? '2px solid var(--primary)'
                                                : '1px solid var(--glass-border)'
                                        }}
                                    >
                                        <span style={{
                                            fontWeight: 600,
                                            color: settings.questFrequency[freq] ? 'white' : 'var(--text-primary)',
                                            textTransform: 'capitalize'
                                        }}>
                                            {freq}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Difficulty Level</h4>
                            <div className="grid grid-2" style={{ gap: '0.75rem' }}>
                                {DIFFICULTY_LEVELS.map((level) => (
                                    <motion.button
                                        key={level}
                                        onClick={() => setSettings({ ...settings, difficultyLevel: level })}
                                        className="card"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            padding: '1rem',
                                            cursor: 'pointer',
                                            background: settings.difficultyLevel === level
                                                ? 'var(--gradient-success)'
                                                : 'var(--bg-tertiary)',
                                            border: settings.difficultyLevel === level
                                                ? '2px solid var(--accent)'
                                                : '1px solid var(--glass-border)'
                                        }}
                                    >
                                        <span style={{ fontWeight: 600, color: settings.difficultyLevel === level ? 'white' : 'var(--text-primary)' }}>
                                            {level}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div className="card">
                            <h4 style={{ marginBottom: '1rem' }}>Time Commitment</h4>
                            <div className="grid grid-3" style={{ gap: '0.75rem' }}>
                                {TIME_COMMITMENTS.map((time) => (
                                    <motion.button
                                        key={time}
                                        onClick={() => setSettings({ ...settings, timeCommitment: time })}
                                        className="card"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            padding: '1rem',
                                            cursor: 'pointer',
                                            background: settings.timeCommitment === time
                                                ? 'var(--gradient-warning)'
                                                : 'var(--bg-tertiary)',
                                            border: settings.timeCommitment === time
                                                ? '2px solid #f59e0b'
                                                : '1px solid var(--glass-border)'
                                        }}
                                    >
                                        <span style={{ fontWeight: 600, color: settings.timeCommitment === time ? 'white' : 'var(--text-primary)' }}>
                                            {time}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', padding: '1rem' }}>
            <div style={{ width: '100%', maxWidth: '800px' }}>
                <div className="text-center mb-3">
                    <h1 className="text-gradient">Welcome, {user?.name}!</h1>
                    <p className="text-secondary">Let's personalize your quest experience</p>

                    {/* Progress indicator */}
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                        {[1, 2].map((s) => (
                            <div
                                key={s}
                                style={{
                                    width: step >= s ? '60px' : '40px',
                                    height: '6px',
                                    background: step >= s ? 'var(--gradient-primary)' : 'var(--bg-tertiary)',
                                    borderRadius: '9999px',
                                    transition: 'all 0.3s'
                                }}
                            />
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {renderStep()}
                </AnimatePresence>

                <div className="flex-between mt-3">
                    <button
                        onClick={() => setStep(step - 1)}
                        className="btn btn-secondary"
                        disabled={step === 1}
                        style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
                    >
                        <ArrowLeft size={20} />
                        Back
                    </button>

                    {step < 2 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="btn btn-primary"
                            disabled={step === 1 && settings.goalCategories.length === 0}
                        >
                            Next
                            <ArrowRight size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={handleComplete}
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Trophy size={20} />
                                    Start Your Journey
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
