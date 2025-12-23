'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload, PerformanceMonitor } from '@react-three/drei';
import ParticleField from './ParticleField';
import FloatingShapes from './FloatingShapes';

interface SceneProps {
  scrollProgress?: number;
}

const Scene: React.FC<SceneProps> = ({ scrollProgress = 0 }) => {
  const [dpr, setDpr] = React.useState(1.5);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        dpr={dpr}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        camera={{
          position: [0, 0, 5],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
      >
        <PerformanceMonitor
          onIncline={() => setDpr(Math.min(2, dpr + 0.5))}
          onDecline={() => setDpr(Math.max(1, dpr - 0.5))}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={0.5} />
            <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ffffff" />
            
            <ParticleField scrollProgress={scrollProgress} />
            <FloatingShapes scrollProgress={scrollProgress} />
            
            <Preload all />
          </Suspense>
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
};

export default Scene;


