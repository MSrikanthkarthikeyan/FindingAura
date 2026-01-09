import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Award, Star, Crown, Zap, Target, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const RARITY_COLORS = {
    common: '#71717a',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b'
};

const RARITY_ICONS = {
    common: Star,
    rare: Zap,
    epic: Award,
    legendary: Crown
};

const Achievements = () => {
    const navigate = useNavigate();
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            const response = await api.get('/achievements/available');
            setAchievements(response.data);
        } catch (error) {
            console.error('Failed to fetch achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    const unlockedAchievements = achievements.filter(a => a.unlocked);
    const lockedAchievements = achievements.filter(a => !a.unlocked);

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Header */}
            <div style={{
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--glass-border)'
            }}>
                <div className="container">
                    <div className="flex" style={{ gap: '0.75rem', alignItems: 'center', padding: '1rem 0' }}>
                        <button onClick={() => navigate('/dashboard')} className="btn btn-ghost">
                            <ArrowLeft size={20} />
                        </button>
                        <Trophy size={24} color="#f59e0b" />
                        <h2>Achievements</h2>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                {/* Stats */}
                <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
                    <div className="card text-center">
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏆</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{unlockedAchievements.length}</div>
                        <div className="text-secondary">Unlocked</div>
                    </div>
                    <div className="card text-center">
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{achievements.length}</div>
                        <div className="text-secondary">Total</div>
                    </div>
                    <div className="card text-center">
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚡</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                            {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
                        </div>
                        <div className="text-secondary">Completion</div>
                    </div>
                </div>

                {/* Unlocked Achievements */}
                {unlockedAchievements.length > 0 && (
                    <div style={{ marginBottom: '3rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Unlocked Achievements</h3>
                        <div className="grid grid-2" style={{ gap: '1rem' }}>
                            {unlockedAchievements.map((achievement) => {
                                const RarityIcon = RARITY_ICONS[achievement.rarity];
                                return (
                                    <motion.div
                                        key={achievement.type}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="card"
                                        style={{
                                            borderColor: RARITY_COLORS[achievement.rarity],
                                            borderWidth: '2px'
                                        }}
                                    >
                                        <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                            <div style={{ fontSize: '2.5rem' }}>{achievement.icon}</div>
                                            <div
                                                className="badge"
                                                style={{
                                                    background: `${RARITY_COLORS[achievement.rarity]}20`,
                                                    color: RARITY_COLORS[achievement.rarity],
                                                    textTransform: 'capitalize'
                                                }}
                                            >
                                                <RarityIcon size={12} style={{ marginRight: '0.25rem' }} />
                                                {achievement.rarity}
                                            </div>
                                        </div>
                                        <h4 style={{ marginBottom: '0.5rem' }}>{achievement.name}</h4>
                                        <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                                            {achievement.description}
                                        </p>
                                        <div className="flex-between">
                                            <span style={{ fontSize: '0.875rem', color: 'var(--accent)' }}>
                                                +{achievement.xpBonus} XP
                                            </span>
                                            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Locked Achievements */}
                {lockedAchievements.length > 0 && (
                    <div>
                        <h3 style={{ marginBottom: '1.5rem' }}>In Progress</h3>
                        <div className="grid grid-2" style={{ gap: '1rem' }}>
                            {lockedAchievements.map((achievement) => (
                                <motion.div
                                    key={achievement.type}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="card"
                                    style={{ opacity: 0.7 }}
                                >
                                    <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '2.5rem', filter: 'grayscale(1)' }}>
                                            {achievement.icon}
                                        </div>
                                        <div
                                            className="badge badge-secondary"
                                            style={{ textTransform: 'capitalize' }}
                                        >
                                            {achievement.rarity}
                                        </div>
                                    </div>
                                    <h4 style={{ marginBottom: '0.5rem' }}>{achievement.name}</h4>
                                    <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                                        {achievement.description}
                                    </p>

                                    {/* Progress bar */}
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                            <span className="text-secondary">Progress</span>
                                            <span>{achievement.percentage}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${achievement.percentage}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="flex-between">
                                        <span className="text-secondary" style={{ fontSize: '0.875rem' }}>
                                            {achievement.progress.current} / {achievement.progress.target}
                                        </span>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            +{achievement.xpBonus} XP
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Achievements;
