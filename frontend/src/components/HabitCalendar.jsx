import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import api from '../services/api';

const HabitCalendar = ({ habitId }) => {
    const [calendarData, setCalendarData] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [streakInfo, setStreakInfo] = useState({ current: 0, longest: 0 });

    useEffect(() => {
        fetchCalendarData();
    }, [habitId, currentDate]);

    const fetchCalendarData = async () => {
        setLoading(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const response = await api.get(`/habits/${habitId}/calendar?year=${year}&month=${month}`);
            setCalendarData(response.data.calendarData || []);
            setStreakInfo({
                current: response.data.currentStreak || 0,
                longest: response.data.longestStreak || 0
            });
        } catch (error) {
            console.error('Failed to fetch calendar:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const isDateLogged = (day) => {
        const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return calendarData.find(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getDate() === day &&
                entryDate.getMonth() === dateToCheck.getMonth() &&
                entryDate.getFullYear() === dateToCheck.getFullYear();
        });
    };

    const getDateColor = (day) => {
        const logEntry = isDateLogged(day);
        if (!logEntry) return 'var(--bg-tertiary)';

        // Color intensity based on streak day
        const opacity = Math.min(logEntry.streakDay / 10, 1);
        return `rgba(16, 184, 166, ${opacity * 0.6})`;
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Create array of day numbers including empty cells for alignment
    const calendarDays = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    if (loading) {
        return (
            <div className="card">
                <div className="flex-center" style={{ padding: '2rem' }}>
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            {/* Header */}
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <div className="flex" style={{ gap: '0.5rem', alignItems: 'center' }}>
                    <CalendarIcon size={20} color="var(--primary)" />
                    <h4>{monthName}</h4>
                </div>
                <div className="flex" style={{ gap: '0.5rem' }}>
                    <button onClick={previousMonth} className="btn btn-ghost" style={{ padding: '0.5rem' }}>
                        <ChevronLeft size={18} />
                    </button>
                    <button onClick={nextMonth} className="btn btn-ghost" style={{ padding: '0.5rem' }}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Streak Info */}
            <div className="flex" style={{ gap: '2rem', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                        {streakInfo.current} 🔥
                    </div>
                    <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Current Streak</div>
                </div>
                <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {streakInfo.longest} 👑
                    </div>
                    <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Longest Streak</div>
                </div>
            </div>

            {/* Day Labels */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '0.5rem',
                marginBottom: '0.5rem'
            }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div
                        key={day}
                        className="text-secondary"
                        style={{
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 600
                        }}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '0.5rem'
            }}>
                {calendarDays.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} style={{ aspectRatio: '1' }}></div>;
                    }

                    const logEntry = isDateLogged(day);
                    const isToday = day === new Date().getDate() &&
                        currentDate.getMonth() === new Date().getMonth() &&
                        currentDate.getFullYear() === new Date().getFullYear();

                    return (
                        <motion.div
                            key={day}
                            whileHover={{ scale: 1.1 }}
                            style={{
                                aspectRatio: '1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: getDateColor(day),
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.875rem',
                                fontWeight: isToday ? 700 : 500,
                                border: isToday ? '2px solid var(--primary)' : 'none',
                                position: 'relative',
                                cursor: logEntry ? 'pointer' : 'default'
                            }}
                            title={logEntry ? `Streak Day ${logEntry.streakDay}` : undefined}
                        >
                            {day}
                            {logEntry && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '2px',
                                    right: '2px',
                                    fontSize: '0.5rem'
                                }}>
                                    🔥
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex" style={{ gap: '1.5rem', marginTop: '1.5rem', fontSize: '0.75rem' }}>
                <div className="flex" style={{ gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{
                        width: '16px',
                        height: '16px',
                        background: 'rgba(16, 184, 166, 0.6)',
                        borderRadius: '4px'
                    }}></div>
                    <span className="text-secondary">Logged</span>
                </div>
                <div className="flex" style={{ gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{
                        width: '16px',
                        height: '16px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '4px'
                    }}></div>
                    <span className="text-secondary">Missed</span>
                </div>
                <div className="flex" style={{ gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid var(--primary)',
                        borderRadius: '4px'
                    }}></div>
                    <span className="text-secondary">Today</span>
                </div>
            </div>
        </div>
    );
};

export default HabitCalendar;
