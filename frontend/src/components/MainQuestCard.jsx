import { motion } from 'framer-motion';
import { Target, Play, Clock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MainQuestCard = ({ quest, reasoning }) => {
    const navigate = useNavigate();

    if (!quest) return null;

    const completedTasks = quest.tasks?.filter(t => t.completed).length || 0;
    const totalTasks = quest.tasks?.length || 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card"
            style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 184, 166, 0.15) 100%)',
                border: '2px solid var(--primary)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Main Quest Badge */}
            <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'var(--primary)',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 600
            }}>
                🎯 MAIN QUEST
            </div>

            <div style={{ marginBottom: '1rem', paddingRight: '7rem' }}>
                <div className="flex" style={{ gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <Target size={28} color="var(--primary)" />
                    <h2 style={{ fontSize: '1.5rem' }}>{quest.title}</h2>
                </div>
                <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                    {quest.description}
                </p>
            </div>

            {/* Why This Matters */}
            {reasoning && (
                <div style={{
                    padding: '1rem',
                    background: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                    borderLeft: '3px solid var(--primary)'
                }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                        Why this matters today:
                    </div>
                    <div className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                        {reasoning}
                    </div>
                </div>
            )}

            {/* Quest Stats */}
            <div className="flex" style={{ gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div className="flex" style={{ gap: '0.5rem', alignItems: 'center' }}>
                    <Zap size={16} color="var(--accent)" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        +{quest.xpReward} XP
                    </span>
                </div>
                <div className="flex" style={{ gap: '0.5rem', alignItems: 'center' }}>
                    <Clock size={16} color="var(--primary)" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        {quest.userInputs?.timeAvailable || '30'} min
                    </span>
                </div>
                <div className="flex" style={{ gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                        {completedTasks}/{totalTasks} tasks
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar" style={{ marginBottom: '1rem', height: '8px' }}>
                <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${quest.progress || 0}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    style={{ background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)' }}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex" style={{ gap: '1rem' }}>
                <button
                    onClick={() => navigate('/quests')}
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: '1rem', padding: '1rem' }}
                >
                    <Play size={20} />
                    Start Main Quest
                </button>
                {quest.status === 'pending' && (
                    <button
                        onClick={() => navigate('/quests')}
                        className="btn btn-secondary"
                    >
                        View Details
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default MainQuestCard;
