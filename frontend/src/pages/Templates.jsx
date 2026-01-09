import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Library, Plus, Filter, Search, ArrowLeft, X } from 'lucide-react';
import api from '../services/api';

const Templates = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [filteredTemplates, setFilteredTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    useEffect(() => {
        filterTemplates();
    }, [templates, searchTerm, selectedCategory, selectedType]);

    const fetchTemplates = async () => {
        try {
            const response = await api.get('/templates');
            setTemplates(response.data);
            setFilteredTemplates(response.data);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterTemplates = () => {
        let filtered = templates;

        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(t => t.category === selectedCategory);
        }

        if (selectedType !== 'all') {
            filtered = filtered.filter(t => t.type === selectedType);
        }

        setFilteredTemplates(filtered);
    };

    const useTemplate = async (templateId) => {
        try {
            await api.post(`/templates/${templateId}/use`);
            navigate('/quests');
        } catch (error) {
            console.error('Failed to use template:', error);
            alert('Failed to create quest from template');
        }
    };

    const categories = ['all', ...new Set(templates.map(t => t.category))];
    const types = ['all', 'daily', 'weekly', 'monthly', 'yearly'];

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
                borderBottom: '1px solid var(--glass-border)'
            }}>
                <div className="container">
                    <div className="flex-between" style={{ padding: '1rem 0' }}>
                        <div className="flex" style={{ gap: '0.75rem', alignItems: 'center' }}>
                            <button onClick={() => navigate('/quests')} className="btn btn-ghost">
                                <ArrowLeft size={20} />
                            </button>
                            <Library size={24} color="#6366f1" />
                            <h2>Quest Templates</h2>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div style={{ paddingBottom: '1rem' }}>
                        <div className="flex" style={{ gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Search templates..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>
                            <select
                                className="form-select"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={{ minWidth: '150px' }}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'all' ? 'All Categories' : cat}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="form-select"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                style={{ minWidth: '120px' }}
                            >
                                {types.map(type => (
                                    <option key={type} value={type}>
                                        {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                    <div>
                        <h3>Available Templates ({filteredTemplates.length})</h3>
                        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                            Choose a pre-built quest template to get started quickly
                        </p>
                    </div>
                </div>

                {filteredTemplates.length > 0 ? (
                    <div className="grid grid-2" style={{ gap: '1rem' }}>
                        {filteredTemplates.map((template) => (
                            <motion.div
                                key={template._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card"
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSelectedTemplate(template)}
                            >
                                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                    <div className="flex" style={{ gap: '0.5rem' }}>
                                        <span className="badge badge-primary">{template.category}</span>
                                        <span className={`badge badge-${template.difficulty === 'Easy' ? 'success' : template.difficulty === 'Medium' ? 'warning' : 'danger'}`}>
                                            {template.difficulty}
                                        </span>
                                    </div>
                                    <span className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
                                        {template.type}
                                    </span>
                                </div>

                                <h4 style={{ marginBottom: '0.5rem' }}>{template.name}</h4>
                                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                                    {template.description}
                                </p>

                                <div className="flex-between">
                                    <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                        {template.tasks.length} tasks • Used {template.usageCount} times
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            useTemplate(template._id);
                                        }}
                                        className="btn btn-primary"
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                    >
                                        <Plus size={16} />
                                        Use Template
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center" style={{ padding: '3rem' }}>
                        <Library size={64} color="var(--text-secondary)" style={{ margin: '0 auto 1rem' }} />
                        <h4 style={{ marginBottom: '0.5rem' }}>No templates found</h4>
                        <p className="text-secondary">Try adjusting your filters</p>
                    </div>
                )}
            </div>

            {/* Template Details Modal */}
            <AnimatePresence>
                {selectedTemplate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '1rem'
                        }}
                        onClick={() => setSelectedTemplate(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="card"
                            style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                                <h3>{selectedTemplate.name}</h3>
                                <button onClick={() => setSelectedTemplate(null)} className="btn btn-ghost">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex" style={{ gap: '0.5rem', marginBottom: '1rem' }}>
                                <span className="badge badge-primary">{selectedTemplate.category}</span>
                                <span className={`badge badge-${selectedTemplate.difficulty === 'Easy' ? 'success' : selectedTemplate.difficulty === 'Medium' ? 'warning' : 'danger'}`}>
                                    {selectedTemplate.difficulty}
                                </span>
                                <span className="badge badge-secondary" style={{ textTransform: 'capitalize' }}>
                                    {selectedTemplate.type}
                                </span>
                            </div>

                            <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                                {selectedTemplate.description}
                            </p>

                            <h4 style={{ marginBottom: '1rem' }}>Tasks ({selectedTemplate.tasks.length})</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                {selectedTemplate.tasks.map((task, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: '1rem',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: 'var(--radius-md)'
                                        }}
                                    >
                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                            {index + 1}. {task.title}
                                        </div>
                                        <div className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                            {task.description}
                                        </div>
                                        <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                            ⏱️ {task.estimatedTime}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => useTemplate(selectedTemplate._id)}
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                            >
                                <Plus size={20} />
                                Use This Template
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Templates;
