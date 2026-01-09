import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Calendar, CalendarDays, CalendarRange, CalendarClock, ArrowLeft, Library } from 'lucide-react';
import api from '../services/api';
import QuestCard from '../components/QuestCard';
import QuestGenerationWizard from '../components/QuestGenerationWizard';

const QUEST_TYPES = [
    { value: 'daily', label: 'Daily', icon: Calendar },
    { value: 'weekly', label: 'Weekly', icon: CalendarDays },
    { value: 'monthly', label: 'Monthly', icon: CalendarRange },
    { value: 'yearly', label: 'Yearly', icon: CalendarClock }
];

const QuestView = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('daily');
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [wizardOpen, setWizardOpen] = useState(false);

    useEffect(() => {
        fetchQuests();
    }, [activeTab]);

    const fetchQuests = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/quests?type=${activeTab}`);
            setQuests(response.data);
        } catch (error) {
            console.error('Failed to fetch quests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuestCreated = (newQuest) => {
        setQuests([newQuest, ...quests]);
    };

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
                            <Sparkles size={24} color="#6366f1" />
                            <h2>Quests</h2>
                        </div>
                        <div className="flex" style={{ gap: '0.75rem' }}>
                            <button
                                onClick={() => navigate('/templates')}
                                className="btn btn-secondary"
                            >
                                <Library size={20} />
                                Browse Templates
                            </button>
                            <button
                                onClick={() => setWizardOpen(true)}
                                className="btn btn-primary"
                            >
                                <Plus size={20} />
                                Generate Quest
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex" style={{ gap: '0.5rem', paddingBottom: '1rem', overflowX: 'auto' }}>
                        {QUEST_TYPES.map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => setActiveTab(value)}
                                className={`btn ${activeTab === value ? 'btn-primary' : 'btn-ghost'}`}
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                <Icon size={18} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                {loading ? (
                    <div className="flex-center" style={{ padding: '3rem' }}>
                        <div className="spinner"></div>
                    </div>
                ) : quests.length > 0 ? (
                    <div className="grid" style={{ gap: '1rem' }}>
                        {quests.map((quest) => (
                            <QuestCard key={quest._id} quest={quest} onUpdate={fetchQuests} />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card text-center"
                        style={{ padding: '3rem' }}
                    >
                        <Sparkles size={64} color="var(--text-secondary)" style={{ margin: '0 auto 1.5rem' }} />
                        <h3 style={{ marginBottom: '0.75rem' }}>No {activeTab} quests yet</h3>
                        <p className="text-secondary" style={{ marginBottom: '2rem' }}>
                            Create your first {activeTab} quest with our AI wizard!
                        </p>
                        <button
                            onClick={() => setWizardOpen(true)}
                            className="btn btn-primary"
                        >
                            <Plus size={20} />
                            Generate {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Quest
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Quest Generation Wizard */}
            <QuestGenerationWizard
                isOpen={wizardOpen}
                onClose={() => setWizardOpen(false)}
                questType={activeTab}
                onQuestCreated={handleQuestCreated}
            />
        </div>
    );
};

export default QuestView;
