import { motion } from 'framer-motion';

const StatsCard = ({ icon: Icon, title, value, subtitle, gradient }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="card"
            style={{
                background: gradient || 'var(--bg-elevated)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                    <div
                        style={{
                            padding: '0.75rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            display: 'inline-flex'
                        }}
                    >
                        <Icon size={24} color="white" />
                    </div>
                </div>

                <div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem', color: gradient ? 'white' : 'var(--text-primary)' }}>
                        {value}
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: gradient ? 'rgba(255, 255, 255, 0.9)' : 'var(--text-primary)' }}>
                        {title}
                    </div>
                    {subtitle && (
                        <div className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: gradient ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-secondary)' }}>
                            {subtitle}
                        </div>
                    )}
                </div>
            </div>

            {gradient && (
                <div
                    style={{
                        position: 'absolute',
                        top: '-50%',
                        right: '-10%',
                        width: '150px',
                        height: '150px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%',
                        filter: 'blur(40px)'
                    }}
                />
            )}
        </motion.div>
    );
};

export default StatsCard;
