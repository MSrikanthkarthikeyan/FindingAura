import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, X, ArrowLeft, Coffee, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Pomodoro = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useContext(AuthContext);

    const taskId = searchParams.get('task');
    const taskName = searchParams.get('name') || 'Focus Session';
    const taskDuration = parseInt(searchParams.get('duration')) || 25;

    const [settings, setSettings] = useState({
        sessionDuration: 25,
        shortBreak: 5,
        longBreak: 15,
        sessionsUntilLongBreak: 4
    });

    const [totalSessions, setTotalSessions] = useState(1);
    const [currentSession, setCurrentSession] = useState(1);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [sessionType, setSessionType] = useState('work'); // 'work' | 'shortBreak' | 'longBreak'

    useEffect(() => {
        // Load user's Pomodoro settings
        if (user?.pomodoroSettings) {
            setSettings(user.pomodoroSettings);
            setTimeLeft(user.pomodoroSettings.sessionDuration * 60);

            // Calculate total sessions needed
            const sessionsNeeded = Math.ceil(taskDuration / user.pomodoroSettings.sessionDuration);
            setTotalSessions(sessionsNeeded);
        }
    }, [user, taskDuration]);

    useEffect(() => {
        let interval;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(t => t - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleSessionComplete();
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const handleSessionComplete = () => {
        setIsRunning(false);

        // Play notification sound
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUR');
        audio.play().catch(e => console.log('Audio play failed:', e));

        if (sessionType === 'work') {
            // Work session completed
            if (currentSession < totalSessions) {
                // Start break
                const isLongBreak = currentSession % settings.sessionsUntilLongBreak === 0;
                setSessionType(isLongBreak ? 'longBreak' : 'shortBreak');
                setTimeLeft((isLongBreak ? settings.longBreak : settings.shortBreak) * 60);
                alert(isLongBreak ? '🎉 Time for a long break!' : '☕ Time for a short break!');
            } else {
                // All sessions complete!
                alert('🎉 All Pomodoro sessions completed! Great job!');
                if (taskId) {
                    markTaskComplete();
                }
            }
        } else {
            // Break completed
            setCurrentSession(prev => prev + 1);
            setSessionType('work');
            setTimeLeft(settings.sessionDuration * 60);
            alert('💪 Break over! Time to focus again!');
        }
    };

    const markTaskComplete = async () => {
        try {
            // This would mark the specific task as complete
            // Implementation depends on your task structure
            navigate('/quests');
        } catch (error) {
            console.error('Error marking task complete:', error);
        }
    };

    const handleStart = () => setIsRunning(true);
    const handlePause = () => setIsRunning(false);
    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(
            sessionType === 'work'
                ? settings.sessionDuration * 60
                : sessionType === 'longBreak'
                    ? settings.longBreak * 60
                    : settings.shortBreak * 60
        );
    };

    const handleSkip = () => {
        setIsRunning(false);
        if (sessionType === 'work') {
            const isLongBreak = currentSession % settings.sessionsUntilLongBreak === 0;
            setSessionType(isLongBreak ? 'longBreak' : 'shortBreak');
            setTimeLeft((isLongBreak ? settings.longBreak : settings.shortBreak) * 60);
        } else {
            setCurrentSession(prev => prev + 1);
            setSessionType('work');
            setTimeLeft(settings.sessionDuration * 60);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = sessionType === 'work'
        ? ((settings.sessionDuration * 60 - timeLeft) / (settings.sessionDuration * 60)) * 100
        : ((sessionType === 'longBreak' ? settings.longBreak : settings.shortBreak) * 60 - timeLeft) /
        ((sessionType === 'longBreak' ? settings.longBreak : settings.shortBreak) * 60) * 100;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Header */}
            <div style={{
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--glass-border)',
                padding: '1rem 0'
            }}>
                <div className="container">
                    <div className="flex-between">
                        <div className="flex" style={{ gap: '0.75rem', alignItems: 'center' }}>
                            <button onClick={() => navigate(-1)} className="btn btn-ghost">
                                <ArrowLeft size={20} />
                            </button>
                            <Zap size={24} color={sessionType === 'work' ? '#6366f1' : '#14b8a6'} />
                            <h2>Pomodoro Timer</h2>
                        </div>
                        <button onClick={() => navigate('/quests')} className="btn btn-ghost">
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Timer Content */}
            <div className="container" style={{ paddingTop: '3rem', paddingBottom: '2rem' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    {/* Task Name */}
                    <div className="text-center" style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>{taskName}</h3>
                        <p className="text-secondary">
                            {sessionType === 'work' ? '🎯 Focus Time' : sessionType === 'longBreak' ? '☕ Long Break' : '☕ Short Break'}
                        </p>
                    </div>

                    {/* Session Progress */}
                    <div className="text-center" style={{ marginBottom: '2rem' }}>
                        <div className="flex-center" style={{ gap: '0.5rem', marginBottom: '0.5rem' }}>
                            {Array.from({ length: totalSessions }).map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        background: i < currentSession
                                            ? 'var(--primary)'
                                            : i === currentSession - 1
                                                ? 'var(--primary-light)'
                                                : 'var(--bg-tertiary)'
                                    }}
                                />
                            ))}
                        </div>
                        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                            Session {currentSession} of {totalSessions}
                        </p>
                    </div>

                    {/* Circular Timer */}
                    <motion.div
                        animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
                        transition={{ repeat: isRunning ? Infinity : 0, duration: 2 }}
                        style={{
                            position: 'relative',
                            width: '300px',
                            height: '300px',
                            margin: '0 auto 3rem'
                        }}
                    >
                        {/* Progress Circle */}
                        <svg width="300" height="300" style={{ transform: 'rotate(-90deg)' }}>
                            <circle
                                cx="150"
                                cy="150"
                                r="140"
                                fill="transparent"
                                stroke="var(--bg-tertiary)"
                                strokeWidth="12"
                            />
                            <circle
                                cx="150"
                                cy="150"
                                r="140"
                                fill="transparent"
                                stroke={sessionType === 'work' ? 'var(--primary)' : 'var(--accent)'}
                                strokeWidth="12"
                                strokeDasharray={`${2 * Math.PI * 140}`}
                                strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 0.3s' }}
                            />
                        </svg>

                        {/* Time Display */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '4rem', fontWeight: 700, lineHeight: 1 }}>
                                {formatTime(timeLeft)}
                            </div>
                            <div className="text-secondary" style={{ marginTop: '0.5rem' }}>
                                {Math.floor(timeLeft / 60)} minutes left
                            </div>
                        </div>
                    </motion.div>

                    {/* Controls */}
                    <div className="flex-center" style={{ gap: '1rem', marginBottom: '2rem' }}>
                        {!isRunning ? (
                            <button onClick={handleStart} className="btn btn-primary" style={{ padding: '1rem 3rem' }}>
                                <Play size={24} />
                                Start
                            </button>
                        ) : (
                            <button onClick={handlePause} className="btn btn-secondary" style={{ padding: '1rem 3rem' }}>
                                <Pause size={24} />
                                Pause
                            </button>
                        )}

                        <button onClick={handleReset} className="btn btn-secondary">
                            <RotateCcw size={20} />
                        </button>

                        <button onClick={handleSkip} className="btn btn-ghost">
                            Skip
                        </button>
                    </div>

                    {/* Session Info */}
                    <div className="card text-center">
                        <div className="grid grid-3" style={{ gap: '1.5rem' }}>
                            <div>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                                    {settings.sessionDuration}m
                                </div>
                                <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Work</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                                    {settings.shortBreak}m
                                </div>
                                <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Short Break</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                                    {settings.longBreak}m
                                </div>
                                <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Long Break</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pomodoro;
