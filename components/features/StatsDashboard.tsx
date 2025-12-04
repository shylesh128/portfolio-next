import React from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import Card from '@/components/ui/Card';
import { FaBriefcase, FaCode, FaCertificate, FaAward } from 'react-icons/fa';

/**
 * Stats Dashboard Component
 * Displays key metrics with animated counters
 * Responsive grid layout
 */

interface Stat {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
}

const StatsDashboard: React.FC = () => {
  const stats: Stat[] = [
    {
      label: 'Years Experience',
      value: 3,
      suffix: '+',
      icon: <FaBriefcase />,
      color: '#3b82f6',
    },
    {
      label: 'Projects Completed',
      value: 20,
      suffix: '+',
      icon: <FaCode />,
      color: '#10b981',
    },
    {
      label: 'Technologies',
      value: 25,
      suffix: '+',
      icon: <FaAward />,
      color: '#f59e0b',
    },
    {
      label: 'Certifications',
      value: 12,
      suffix: '',
      icon: <FaCertificate />,
      color: '#8b5cf6',
    },
  ];

  return (
    <section className="stats-dashboard">
      <motion.div
        className="stats-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          By the Numbers
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 20px',
          }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                variant="elevated"
                hover
                style={{
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  background: 'linear-gradient(135deg, var(--background-color) 0%, rgba(var(--border-color-rgb, 200, 200, 200), 0.1) 100%)',
                  transition: 'all 0.3s ease',
                }}
              >
                <div
                  style={{
                    fontSize: '3.5rem',
                    color: stat.color,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '80px',
                  }}
                >
                  {stat.icon}
                </div>
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: 'var(--text-color)',
                    lineHeight: '1',
                  }}
                >
                  <AnimatedCounter
                    end={stat.value}
                    suffix={stat.suffix}
                    duration={2.5}
                    className="stat-value"
                  />
                </div>
                <div
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--sub-text-color)',
                    fontWeight: '500',
                    letterSpacing: '0.5px',
                  }}
                >
                  {stat.label}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default StatsDashboard;
