import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamic import of 3D loading component
const Loading3D = dynamic(() => import('./3d/Loading3D'), {
  ssr: false,
  loading: () => <SimpleLoader />,
});

const SimpleLoader: React.FC = () => {
  return (
    <div className="loading-container">
      {/* Animated geometric shape */}
      <motion.div
        style={{
          width: 60,
          height: 60,
          border: '2px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          position: 'relative',
        }}
        animate={{
          rotate: 360,
          borderRadius: ['12px', '30px', '12px'],
        }}
        transition={{
          rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
          borderRadius: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        {/* Inner dot */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 8,
            height: 8,
            background: 'white',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Loading text */}
      <motion.p
        className="loading-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Loading
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ...
        </motion.span>
      </motion.p>
    </div>
  );
};

const Loading: React.FC = () => {
  return (
    <Suspense fallback={<SimpleLoader />}>
      <Loading3D />
    </Suspense>
  );
};

export default Loading;
