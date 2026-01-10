import { motion } from 'framer-motion';
import { Target, TrendingUp, Flame, Award, Lightbulb } from 'lucide-react';

const MomentumWidget = ({ user, insights = [] }) => {
    const streak = user?.stats?.currentStreak || 0;
    const longestStreak = user?.stats?.longestStreak || 0;

    // Calculate completion rate for this week
    const recentCompletions = user?.questMemory?.recentCompletions?.slice(0, 7) || [];
    const completionRate = recentCompletions.length ?
        Math.round((recentCompletions.filter(c => !c.skipped).length / recentCompletions.length) * 100) : 0;

    // Get momentum message
    const getMomentumMessage = (streak) => {
        if (streak >= 30) return "👑 Monthly legend - you're unstoppable!";
        if (streak >= 14) return "💪 Two weeks strong - you're building habits!";
        if (streak >= 7) return "⭐ Week warrior - that's consistency!";
        if (streak >= 3) return "🔥 You're on fire!";
        return "🌟 Great start!";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 184, 166, 0.1) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.2)'
            }}
        >
            <div className="flex" style={{ gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                <Flame size={24} color="var(--accent)" />
                <h3>Your Momentum</h3>
            </div>

            {/* Streak Display */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {streak} 🔥
                </div>
                <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    {getMomentumMessage(streak)}
                </div>
                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                    Longest: {longestStreak} days
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                <div style={{
                    padding: '1rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)'
                }}>
                    <div className="flex" style={{ gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <TrendingUp size={16} color="var(--primary)" />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Week Rate
                        </span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {completionRate}%
                    </div>
                </div>

                <div style={{
                    padding: '1rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)'
                }}>
                    <div className="flex" style={{ gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <Award size={16} color="var(--accent)" />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Level
                        </span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                        {user?.stats?.level || 1}
                    </div>
                </div>
            </div>

            {/* Behavioral Insights */}
            {insights && insights.length > 0 && (
                <div>
                    <div className="flex" style={{ gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <Lightbulb size={16} color="var(--primary)" />
                        <h5>Insights</h5>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {insights.map((insight, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                style={{
                                    padding: '0.75rem',
                                    background: insight.type === 'strength'
                                        ? 'rgba(16, 184, 166, 0.1)'
                                        : insight.type === 'opportunity'
                                            ? 'rgba(99, 102, 241, 0.1)'
                                            : 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-sm)',
                                    borderLeft: `3px solid ${insight.type === 'strength'
                                            ? 'var(--accent)'
                                            : insight.type === 'opportunity'
                                                ? 'var(--primary)'
                                                : 'var(--text-secondary)'
                                        }`
                                }}
                            >
                                <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                                    {insight.message}
                                </div>
                                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                    {insight.action}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default MomentumWidget;
