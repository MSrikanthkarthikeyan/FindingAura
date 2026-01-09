import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Plus, CheckCircle2, Flame, Target, X, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const Habits = () => {
    const navigate = useNavigate();
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newHabit, setNewHabit] = useState({
        name: '',
        category: 'Personal Development',
        frequency: 'daily'
    });

    useEffect(() => {
        fetchHabits();
    }, []);

    const fetchHabits = async () => {
        try {
            const response = await api.get('/habits');
            setHabits(response.data);
        } catch (error) {
            console.error('Failed to fetch habits:', error);
        } finally {
            setLoading(false);
        }
    };

    const createHabit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/habits', newHabit);
            setNewHabit({ name: '', category: 'Personal Development', frequency: 'daily' });
            setShowModal(false);
            fetchHabits();
        } catch (error) {
            console.error('Failed to create habit:', error);
            alert('Failed to create habit. Please try again.');
        }
    };

    const logHabit = async (habitId, isWin = true) => {
        try {
            await api.post(`/habits/${habitId}/log`, { isWin });
            fetchHabits();
        } catch (error) {
            console.error('Failed to log habit:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Header */}
            <div style={{
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--glass-border)'
            }}>
                <div className="container">
                    <div className="flex-between" style={{ padding: '1rem 0' }}>
                        <div className="flex" style={{ gap: '0.75rem', alignItems: 'center' }}>
                            <button onClick={() => navigate('/dashboard')} className="btn btn-ghost">
                                <ArrowLeft size={20} />
                            </button>
                            <TrendingUp size={24} color="#14b8a6" />
                            <h2>Habits</h2>
                        </div>
                        <button onClick={() => setShowModal(true)} className="btn btn-primary">
                            <Plus size={20} />
                            New Habit
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                {habits.length > 0 ? (
                    <div className="grid" style={{ gap: '1rem' }}>
                        {habits.map((habit) => (
                            <motion.div
                                key={habit._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card"
                            >
                                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ marginBottom: '0.25rem' }}>{habit.name}</h4>
                                        <div className="flex" style={{ gap: '0.75rem', fontSize: '0.875rem' }}>
                                            <span className="badge badge-primary">{habit.category}</span>
                                            <span className="text-secondary" style={{ textTransform: 'capitalize' }}>
                                                {habit.frequency}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-3" style={{ gap: '1rem', marginBottom: '1rem' }}>
                                    <div className="text-center">
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                                            <Flame size={20} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                            {habit.currentStreak}
                                        </div>
                                        <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Current Streak</div>
                                    </div>
                                    <div className="text-center">
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                                            {habit.totalCompletions}
                                        </div>
                                        <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Total Completions</div>
                                    </div>
                                    <div className="text-center">
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                                            {habit.wins}/{habit.wins + habit.losses}
                                        </div>
                                        <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Win Rate</div>
                                    </div>
                                </div>

                                <div className="flex" style={{ gap: '0.75rem' }}>
                                    <button
                                        onClick={() => logHabit(habit._id, true)}
                                        className="btn btn-primary"
                                        style={{ flex: 1 }}
                                    >
                                        <CheckCircle2 size={18} />
                                        Win
                                    </button>
                                    <button
                                        onClick={() => logHabit(habit._id, false)}
                                        className="btn btn-secondary"
                                        style={{ flex: 1 }}
                                    >
                                        <X size={18} />
                                        Loss
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card text-center"
                        style={{ padding: '3rem' }}
                    >
                        <Target size={64} color="var(--text-secondary)" style={{ margin: '0 auto 1.5rem' }} />
                        <h3 style={{ marginBottom: '0.75rem' }}>No habits yet</h3>
                        <p className="text-secondary" style={{ marginBottom: '2rem' }}>
                            Start tracking your habits to build consistency and achieve your goals
                        </p>
                        <button onClick={() => setShowModal(true)} className="btn btn-primary">
                            <Plus size={20} />
                            Create Your First Habit
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '1rem'
                        }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="card"
                            style={{ width: '100%', maxWidth: '500px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                                <h3>Create New Habit</h3>
                                <button onClick={() => setShowModal(false)} className="btn btn-ghost">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={createHabit}>
                                <div className="form-group">
                                    <label className="form-label">Habit Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., Morning Meditation"
                                        value={newHabit.name}
                                        onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-select"
                                        value={newHabit.category}
                                        onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
                                    >
                                        <option>Personal Development</option>
                                        <option>Fitness</option>
                                        <option>Health</option>
                                        <option>Career</option>
                                        <option>Finance</option>
                                        <option>Relationships</option>
                                        <option>Creativity</option>
                                        <option>Learning</option>
                                        <option>Productivity</option>
                                        <option>Mindfulness</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Frequency</label>
                                    <select
                                        className="form-select"
                                        value={newHabit.frequency}
                                        onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>

                                <div className="flex" style={{ gap: '0.75rem' }}>
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                        <Plus size={18} />
                                        Create Habit
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Habits;
