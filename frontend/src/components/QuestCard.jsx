import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Trophy, Play } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const QuestCard = ({ quest, onUpdate }) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const [completingTask, setCompletingTask] = useState(null);

    const toggleTask = async (taskIndex) => {
        const newCompleted = !quest.tasks[taskIndex].completed;

        // Show animation
        setCompletingTask(taskIndex);

        try {
            await api.put(`/quests/${quest._id}`, {
                taskIndex,
                completed: newCompleted
            });

            // Keep animation visible for a moment
            setTimeout(() => {
                setCompletingTask(null);
                onUpdate();
            }, 600);
        } catch (error) {
            console.error('Failed to update task:', error);
            setCompletingTask(null);
        }
    };

    const startPomodoro = (task) => {
        const duration = parseInt(task.estimatedTime) || 25;
        navigate(`/pomodoro?task=${quest._id}&name=${encodeURIComponent(task.title)}&duration=${duration}`);
    };

    const completeQuest = async () => {
        try {
            await api.post(`/quests/${quest._id}/complete`);
            onUpdate();
        } catch (error) {
            console.error('Failed to complete quest:', error);
        }
    };

    const getStatusColor = () => {
        switch (quest.status) {
            case 'completed':
                return 'var(--accent)';
            case 'in-progress':
                return 'var(--primary)';
            case 'failed':
                return '#ef4444';
            default:
                return 'var(--text-secondary)';
        }
    };

    const completedTasks = quest.tasks.filter(t => t.completed).length;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{ cursor: 'pointer' }}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <div className="flex" style={{ gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <h4>{quest.title}</h4>
                        <span className={`badge badge-${quest.difficulty === 'Easy' ? 'success' : quest.difficulty === 'Medium' ? 'primary' : 'danger'}`}>
                            {quest.difficulty}
                        </span>
                    </div>
                    <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        {quest.description}
                    </p>
                    <div className="flex" style={{ gap: '1rem', fontSize: '0.75rem' }}>
                        <span className="text-secondary">
                            <Trophy size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                            {quest.xpReward} XP
                        </span>
                        <span className="text-secondary">
                            <Clock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                            {new Date(quest.endDate).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="progress-bar" style={{ marginBottom: '1rem' }}>
                <div className="progress-fill" style={{ width: `${quest.progress}%` }}></div>
            </div>

            <div className="flex-between">
                <span className="text-secondary" style={{ fontSize: '0.875rem' }}>
                    {completedTasks}/{quest.tasks.length} tasks complete
                </span>
                <span style={{ color: getStatusColor(), fontSize: '0.875rem', fontWeight: 600, textTransform: 'capitalize' }}>
                    {quest.status.replace('-', ' ')}
                </span>
            </div>

            {isExpanded && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}
                >
                    <h5 style={{ marginBottom: '0.75rem' }}>Tasks</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {quest.tasks.map((task, index) => (
                            <motion.div
                                key={index}
                                animate={completingTask === index ? {
                                    x: [0, 8, -8, 4, 0],
                                    backgroundColor: [
                                        'var(--bg-tertiary)',
                                        'rgba(16, 184, 166, 0.2)',
                                        'rgba(16, 184, 166, 0.3)',
                                        'rgba(16, 184, 166, 0.2)',
                                        task.completed ? 'rgba(16, 184, 166, 0.1)' : 'var(--bg-tertiary)'
                                    ]
                                } : {}}
                                transition={{ duration: 0.6, ease: 'easeInOut' }}
                                className="flex"
                                style={{
                                    gap: '0.75rem',
                                    padding: '0.75rem',
                                    background: task.completed ? 'rgba(20, 184, 166, 0.1)' : 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                    position: 'relative'
                                }}
                            >
                                {/* Checkmark Button */}
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => toggleTask(index)}
                                    style={{ cursor: 'pointer', flexShrink: 0 }}
                                >
                                    <AnimatePresence mode="wait">
                                        {task.completed ? (
                                            <motion.div
                                                key="checked"
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: 180 }}
                                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                            >
                                                <CheckCircle2 size={20} color="var(--accent)" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="unchecked"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                            >
                                                <Circle size={20} color="var(--text-secondary)" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Task Content */}
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontWeight: 500,
                                        textDecoration: task.completed ? 'line-through' : 'none',
                                        color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)'
                                    }}>
                                        {task.title}
                                    </div>
                                    <div className="text-secondary" style={{ fontSize: '0.875rem' }}>
                                        {task.description}
                                    </div>
                                    <div className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                        <Clock size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                        {task.estimatedTime}
                                    </div>
                                </div>

                                {/* Pomodoro Button */}
                                {!task.completed && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            startPomodoro(task);
                                        }}
                                        className="btn btn-secondary"
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            fontSize: '0.75rem',
                                            alignSelf: 'center'
                                        }}
                                    >
                                        <Play size={14} />
                                        Start
                                    </motion.button>
                                )}

                                {/* Completion Flash Effect */}
                                <AnimatePresence>
                                    {completingTask === index && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 2 }}
                                            exit={{ opacity: 0, scale: 3 }}
                                            transition={{ duration: 0.6 }}
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                fontSize: '2rem',
                                                pointerEvents: 'none'
                                            }}
                                        >
                                            ✓
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>

                    {quest.status !== 'completed' && quest.progress === 100 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                completeQuest();
                            }}
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            <Trophy size={20} />
                            Complete Quest
                        </button>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};

export default QuestCard;
