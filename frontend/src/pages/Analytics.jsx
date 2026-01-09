import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Trophy, Target, Flame, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import StatsCard from '../components/StatsCard';

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#10b981', '#8b5cf6'];

const Analytics = () => {
    const navigate = useNavigate();
    const [overview, setOverview] = useState(null);
    const [trends, setTrends] = useState(null);
    const [winsLosses, setWinsLosses] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [overviewRes, trendsRes, winsRes] = await Promise.all([
                api.get('/analytics/overview'),
                api.get('/analytics/trends'),
                api.get('/analytics/wins-losses')
            ]);
            setOverview(overviewRes.data);
            setTrends(trendsRes.data);
            setWinsLosses(winsRes.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
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

    const categoryData = trends?.categoryBreakdown
        ? Object.entries(trends.categoryBreakdown).map(([name, data]) => ({
            name,
            completions: data.completions,
            wins: data.wins,
            losses: data.losses
        }))
        : [];

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
                        <h2>Analytics</h2>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                {/* Stats Overview */}
                <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
                    <StatsCard
                        icon={Trophy}
                        title="Total Quests"
                        value={overview?.quests?.total || 0}
                        subtitle={`${overview?.quests?.completed || 0} completed`}
                        gradient="var(--gradient-primary)"
                    />
                    <StatsCard
                        icon={Target}
                        title="Completion Rate"
                        value={`${overview?.quests?.completionRate || 0}%`}
                        subtitle="Quest success rate"
                        gradient="var(--gradient-success)"
                    />
                    <StatsCard
                        icon={TrendingUp}
                        title="Total Wins"
                        value={winsLosses?.totalWins || 0}
                        subtitle={`${winsLosses?.winRate || 0}% win rate`}
                        gradient="var(--gradient-warning)"
                    />
                    <StatsCard
                        icon={Flame}
                        title="Active Habits"
                        value={overview?.habits?.active || 0}
                        subtitle={`${overview?.habits?.totalCompletions || 0} completions`}
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
                    {/* Trend Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card"
                    >
                        <h3 style={{ marginBottom: '1.5rem' }}>Habit Completion Trend (30 Days)</h3>
                        {trends?.dailyData?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={trends.dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="var(--text-secondary)"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => new Date(value).getDate()}
                                    />
                                    <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'var(--bg-elevated)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: 'var(--radius-md)'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="completions"
                                        stroke="#6366f1"
                                        strokeWidth={2}
                                        dot={{ fill: '#6366f1', r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center text-secondary" style={{ padding: '3rem' }}>
                                No data available yet
                            </div>
                        )}
                    </motion.div>

                    {/* Category Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card"
                    >
                        <h3 style={{ marginBottom: '1.5rem' }}>Category Breakdown</h3>
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="completions"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: 'var(--bg-elevated)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: 'var(--radius-md)'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center text-secondary" style={{ padding: '3rem' }}>
                                No category data yet
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Wins vs Losses */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                    style={{ marginBottom: '2rem' }}
                >
                    <h3 style={{ marginBottom: '1.5rem' }}>Wins vs Losses</h3>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                                <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--bg-elevated)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: 'var(--radius-md)'
                                    }}
                                />
                                <Bar dataKey="wins" fill="#10b981" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="losses" fill="#ef4444" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center text-secondary" style={{ padding: '3rem' }}>
                            No wins/losses data yet
                        </div>
                    )}
                </motion.div>

                {/* Top Performing Habits */}
                {winsLosses?.topHabits?.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card"
                    >
                        <h3 style={{ marginBottom: '1.5rem' }}>Top Performing Habits</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {winsLosses.topHabits.map((habit, index) => (
                                <div
                                    key={index}
                                    className="flex-between"
                                    style={{
                                        padding: '1rem',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        border: index === 0 ? '2px solid var(--accent)' : '1px solid var(--glass-border)'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                            {index === 0 && '🏆 '}{habit.name}
                                        </div>
                                        <div className="text-secondary" style={{ fontSize: '0.875rem' }}>
                                            {habit.wins} wins / {habit.losses} losses
                                        </div>
                                    </div>
                                    <div
                                        className="badge badge-success"
                                        style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}
                                    >
                                        {habit.winRate}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
