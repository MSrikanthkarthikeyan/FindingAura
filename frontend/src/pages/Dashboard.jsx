import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Flame, Trophy, Target, LogOut, Menu, X, Moon, Sun, Award } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import QuestCard from '../components/QuestCard';
import MainQuestCard from '../components/MainQuestCard';
import MomentumWidget from '../components/MomentumWidget';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [overview, setOverview] = useState(null);
    const [mainQuest, setMainQuest] = useState(null);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch overview first (critical)
            const overviewRes = await api.get('/analytics/overview');
            setOverview(overviewRes.data);

            // Try to fetch main quest (optional - don't break if fails)
            try {
                const mainQuestRes = await api.get('/quests/main-quest');
                if (mainQuestRes.data?.mainQuest) {
                    setMainQuest(mainQuestRes.data.mainQuest);
                }
            } catch (err) {
                console.log('Main quest not available yet');
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
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
                borderBottom: '1px solid var(--glass-border)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div className="container">
                    <div className="flex-between" style={{ padding: '1rem 0' }}>
                        <div className="flex" style={{ gap: '0.75rem', alignItems: 'center' }}>
                            <Sparkles size={28} color="#6366f1" />
                            <h2 className="text-gradient">FindingAura</h2>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="flex" style={{ gap: '1rem', alignItems: 'center', display: window.innerWidth > 768 ? 'flex' : 'none' }}>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="btn btn-ghost"
                                style={{ fontSize: '0.875rem' }}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => navigate('/quests')}
                                className="btn btn-ghost"
                                style={{ fontSize: '0.875rem' }}
                            >
                                Quests
                            </button>
                            <button
                                onClick={() => navigate('/habits')}
                                className="btn btn-ghost"
                                style={{ fontSize: '0.875rem' }}
                            >
                                Habits
                            </button>
                            <button
                                onClick={() => navigate('/analytics')}
                                className="btn btn-ghost"
                                style={{ fontSize: '0.875rem' }}
                            >
                                Analytics
                            </button>
                            <button
                                onClick={() => navigate('/achievements')}
                                className="btn btn-ghost"
                                style={{ fontSize: '0.875rem' }}
                            >
                                <Award size={18} />
                            </button>
                            <button onClick={toggleTheme} className="btn btn-ghost">
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                            <button onClick={handleLogout} className="btn btn-secondary">
                                <LogOut size={18} />
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="btn btn-ghost"
                            style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}
                        >
                            {menuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {menuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ paddingBottom: '1rem' }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button onClick={() => { navigate('/dashboard'); setMenuOpen(false); }} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }}>
                                    Dashboard
                                </button>
                                <button onClick={() => { navigate('/quests'); setMenuOpen(false); }} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }}>
                                    Quests
                                </button>
                                <button onClick={() => { navigate('/habits'); setMenuOpen(false); }} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }}>
                                    Habits
                                </button>
                                <button onClick={() => { navigate('/analytics'); setMenuOpen(false); }} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }}>
                                    Analytics
                                </button>
                                <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%' }}>
                                    <LogOut size={18} /> Logout
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2rem' }}
                >
                    <h1>Welcome back, {user?.name}! 👋</h1>
                    <p className="text-secondary" style={{ marginTop: '0.5rem' }}>
                        Track your progress and conquer your quests
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
                    <StatsCard
                        icon={Trophy}
                        title="Level"
                        value={overview?.user?.level || 1}
                        subtitle={`${overview?.user?.xp || 0} XP`}
                        gradient="var(--gradient-primary)"
                    />
                    <StatsCard
                        icon={Flame}
                        title="Current Streak"
                        value={`${overview?.user?.currentStreak || 0} days`}
                        subtitle={`Longest: ${overview?.user?.longestStreak || 0} days`}
                        gradient="var(--gradient-warning)"
                    />
                    <StatsCard
                        icon={Target}
                        title="Active Quests"
                        value={overview?.quests?.active || 0}
                        subtitle={`${overview?.quests?.completed || 0} completed`}
                        gradient="var(--gradient-success)"
                    />
                    <StatsCard
                        icon={TrendingUp}
                        title="Completion Rate"
                        value={`${overview?.quests?.completionRate || 0}%`}
                        subtitle={`${overview?.quests?.total || 0} total quests`}
                    />
                </div>

                {/* Main Quest Section */}
                {mainQuest && (
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>🎯 Today's Priority</h3>
                        <MainQuestCard
                            quest={mainQuest}
                            reasoning={mainQuest.intentMapping?.aiReasoning || "Your highest-impact quest for today"}
                        />
                    </div>
                )}

                {/* Momentum Widget */}
                <div style={{ marginBottom: '2rem' }}>
                    <MomentumWidget user={user} insights={insights} />
                </div>

                {/* Recent Quests */}
                <div style={{ marginBottom: '2rem' }}>
                    <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                        <h3>Recent Quests</h3>
                        <button
                            onClick={() => navigate('/quests')}
                            className="btn btn-primary"
                        >
                            View All Quests
                        </button>
                    </div>

                    {overview?.recentQuests?.length > 0 ? (
                        <div className="grid" style={{ gap: '1rem' }}>
                            {overview.recentQuests.slice(0, 3).map((quest) => (
                                <QuestCard
                                    key={quest._id}
                                    quest={quest}
                                    onUpdate={fetchOverview}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="card text-center" style={{ padding: '3rem' }}>
                            <Target size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem' }} />
                            <h4 style={{ marginBottom: '0.5rem' }}>No quests yet</h4>
                            <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                                Start your journey by generating your first quest
                            </p>
                            <button
                                onClick={() => navigate('/quests')}
                                className="btn btn-primary"
                            >
                                Generate Quest
                            </button>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div>
                    <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
                    <div className="grid grid-3">
                        <motion.button
                            whileHover={{ scale: 1.02, y: -4 }}
                            onClick={() => navigate('/quests')}
                            className="card"
                            style={{ textAlign: 'center', padding: '2rem', cursor: 'pointer' }}
                        >
                            <Target size={32} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
                            <div style={{ fontWeight: 600 }}>New Quest</div>
                            <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Generate AI quest</div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02, y: -4 }}
                            onClick={() => navigate('/habits')}
                            className="card"
                            style={{ textAlign: 'center', padding: '2rem', cursor: 'pointer' }}
                        >
                            <TrendingUp size={32} color="var(--accent)" style={{ margin: '0 auto 1rem' }} />
                            <div style={{ fontWeight: 600 }}>Track Habit</div>
                            <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Log completion</div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02, y: -4 }}
                            onClick={() => navigate('/analytics')}
                            className="card"
                            style={{ textAlign: 'center', padding: '2rem', cursor: 'pointer' }}
                        >
                            <Trophy size={32} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
                            <div style={{ fontWeight: 600 }}>View Analytics</div>
                            <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Track progress</div>
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
