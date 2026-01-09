import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const PomodoroSettings = () => {
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);

    const [settings, setSettings] = useState({
        sessionDuration: 25,
        shortBreak: 5,
        longBreak: 15,
        sessionsUntilLongBreak: 4
    });

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (user?.pomodoroSettings) {
            setSettings(user.pomodoroSettings);
        }
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await api.put('/auth/pomodoro-settings', settings);

            // Update user context
            setUser(prev => ({
                ...prev,
                pomodoroSettings: settings
            }));

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: parseInt(value) }));
        setSaved(false);
    };

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
                            <Zap size={24} color="#6366f1" />
                            <h2>Pomodoro Settings</h2>
                        </div>
                        <button
                            onClick={handleSave}
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                                    Saving...
                                </>
                            ) : saved ? (
                                <>✓ Saved</>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Settings Content */}
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card"
                    >
                        <h3 style={{ marginBottom: '1.5rem' }}>Timer Durations</h3>

                        {/* Work Session Duration */}
                        <div className="form-group">
                            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                <label className="form-label">Work Session Duration</label>
                                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                    {settings.sessionDuration} minutes
                                </span>
                            </div>
                            <input
                                type="range"
                                min="15"
                                max="60"
                                step="5"
                                value={settings.sessionDuration}
                                onChange={(e) => updateSetting('sessionDuration', e.target.value)}
                                style={{ width: '100%' }}
                            />
                            <div className="flex-between text-secondary" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                <span>15 min</span>
                                <span>60 min</span>
                            </div>
                        </div>

                        {/* Short Break */}
                        <div className="form-group">
                            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                <label className="form-label">Short Break Duration</label>
                                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
                                    {settings.shortBreak} minutes
                                </span>
                            </div>
                            <input
                                type="range"
                                min="3"
                                max="15"
                                step="1"
                                value={settings.shortBreak}
                                onChange={(e) => updateSetting('shortBreak', e.target.value)}
                                style={{ width: '100%' }}
                            />
                            <div className="flex-between text-secondary" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                <span>3 min</span>
                                <span>15 min</span>
                            </div>
                        </div>

                        {/* Long Break */}
                        <div className="form-group">
                            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                <label className="form-label">Long Break Duration</label>
                                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
                                    {settings.longBreak} minutes
                                </span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="30"
                                step="5"
                                value={settings.longBreak}
                                onChange={(e) => updateSetting('longBreak', e.target.value)}
                                style={{ width: '100%' }}
                            />
                            <div className="flex-between text-secondary" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                <span>10 min</span>
                                <span>30 min</span>
                            </div>
                        </div>

                        {/* Sessions Until Long Break */}
                        <div className="form-group">
                            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                <label className="form-label">Sessions Until Long Break</label>
                                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                    {settings.sessionsUntilLongBreak} sessions
                                </span>
                            </div>
                            <input
                                type="range"
                                min="2"
                                max="8"
                                step="1"
                                value={settings.sessionsUntilLongBreak}
                                onChange={(e) => updateSetting('sessionsUntilLongBreak', e.target.value)}
                                style={{ width: '100%' }}
                            />
                            <div className="flex-between text-secondary" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                <span>2</span>
                                <span>8</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card"
                        style={{
                            marginTop: '1.5rem',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}
                    >
                        <h4 style={{ marginBottom: '0.75rem' }}>💡 Pomodoro Technique</h4>
                        <p className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                            The Pomodoro Technique uses focused work sessions followed by short breaks to maintain
                            peak productivity and prevent burnout. After several work sessions, take a longer break
                            to fully recharge.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PomodoroSettings;
