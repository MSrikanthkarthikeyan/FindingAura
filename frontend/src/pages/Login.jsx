import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', padding: '1rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: '420px' }}
            >
                <div className="text-center mb-3">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        style={{ display: 'inline-block', marginBottom: '1rem' }}
                    >
                        <Sparkles size={48} color="#6366f1" />
                    </motion.div>
                    <h1 className="text-gradient" style={{ marginBottom: '0.5rem' }}>FindingAura</h1>
                    <p className="text-secondary">Welcome back! Continue your journey.</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{
                                    padding: '0.75rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: 'var(--radius-md)',
                                    color: '#f87171',
                                    marginBottom: '1rem',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="form-group">
                            <label className="form-label">
                                <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Lock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '0.5rem' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    Log In
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-3">
                        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                            Don't have an account?{' '}
                            <Link to="/signup" style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 600 }}>
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
