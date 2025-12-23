import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BiCalendar, BiLinkExternal } from 'react-icons/bi';
import { useInView } from 'react-intersection-observer';
import TiltCard from './ui/TiltCard';

import { Certificate } from '../types';

interface CertificatesSectionProps {
  certificates: Certificate[];
}

const CertificateCard: React.FC<{ certificate: Certificate; index: number }> = ({
  certificate,
  index,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TiltCard
      className="certificate-item"
      maxTilt={6}
      scale={1.02}
      glare
      glareOpacity={0.1}
    >
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ height: '100%' }}
      >
        {/* Platform badge */}
        <motion.div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.75rem',
            background: 'var(--color-certificates-dim)',
            borderRadius: 50,
            fontSize: '0.75rem',
            color: 'var(--color-certificates)',
            marginBottom: '0.75rem',
          }}
        >
          {certificate.platform}
        </motion.div>

        {/* Title */}
        <h3
          className="certificate-header"
          style={{
            fontSize: '1rem',
            marginBottom: '0.75rem',
            lineHeight: 1.4,
          }}
        >
          {certificate.title}
        </h3>

        {/* Date */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            marginBottom: '1rem',
          }}
        >
          <BiCalendar size={14} />
          {certificate.issuedDate}
        </div>

        {/* Skills tags */}
        {certificate.skills && certificate.skills.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            {certificate.skills.slice(0, 3).map((skill, skillIndex) => (
              <span
                key={skillIndex}
                style={{
                  padding: '0.2rem 0.5rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                }}
              >
                {skill}
              </span>
            ))}
            {certificate.skills.length > 3 && (
              <span
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                }}
              >
                +{certificate.skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* View link */}
        <motion.a
          href={certificate.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            color: isHovered ? 'var(--color-certificates)' : 'var(--text-secondary)',
            transition: 'color 0.2s',
          }}
          whileHover={{ x: 3 }}
        >
          View Certificate <BiLinkExternal size={14} />
        </motion.a>
      </motion.div>
    </TiltCard>
  );
};

const CertificatesSection = ({ certificates }: CertificatesSectionProps) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [showAll, setShowAll] = useState(false);
  const displayedCerts = showAll ? certificates : certificates.slice(0, 6);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section id="certificates" style={{ padding: 'var(--section-padding) 0' }}>
      <motion.div
        ref={ref}
        style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto', padding: '0 2rem' }}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={containerVariants}
      >
        <motion.h2 variants={itemVariants}>Certificates</motion.h2>

        <div
          className="certificate-content"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginTop: '1.5rem',
            padding: 0,
          }}
        >
          {displayedCerts.map((certificate, index) => (
            <motion.div
              key={certificate.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring' as const,
                stiffness: 100,
                damping: 15,
                delay: index * 0.08,
              }}
            >
              <CertificateCard certificate={certificate} index={index} />
            </motion.div>
          ))}
        </div>

        {/* Show more button */}
        {certificates.length > 6 && (
          <motion.div
            variants={itemVariants}
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '2rem',
            }}
          >
            <motion.button
              className="btn btn-outline"
              onClick={() => setShowAll(!showAll)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showAll ? 'Show Less' : `View All (${certificates.length})`}
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default CertificatesSection;
