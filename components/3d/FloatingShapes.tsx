'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, MeshDistortMaterial } from '@react-three/drei';

interface FloatingShapesProps {
  scrollProgress?: number;
}

interface ShapeData {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  speed: number;
  type: 'icosahedron' | 'octahedron' | 'torus' | 'torusKnot';
}

const FloatingShape: React.FC<{
  shape: ShapeData;
  index: number;
  scrollProgress: number;
}> = ({ shape, index, scrollProgress }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    
    // Unique rotation per shape
    meshRef.current.rotation.x = time * shape.speed * 0.3 + index;
    meshRef.current.rotation.y = time * shape.speed * 0.2 + index * 0.5;
    
    // Subtle position oscillation
    meshRef.current.position.y = shape.position[1] + Math.sin(time * 0.5 + index) * 0.3;
    
    // Move based on scroll
    meshRef.current.position.z = shape.position[2] - scrollProgress * 5;
  });

  const geometry = useMemo(() => {
    switch (shape.type) {
      case 'icosahedron':
        return <icosahedronGeometry args={[1, 0]} />;
      case 'octahedron':
        return <octahedronGeometry args={[1, 0]} />;
      case 'torus':
        return <torusGeometry args={[0.7, 0.3, 16, 32]} />;
      case 'torusKnot':
        return <torusKnotGeometry args={[0.5, 0.15, 64, 16]} />;
      default:
        return <icosahedronGeometry args={[1, 0]} />;
    }
  }, [shape.type]);

  return (
    <Float
      speed={shape.speed}
      rotationIntensity={0.5}
      floatIntensity={0.5}
      floatingRange={[-0.1, 0.1]}
    >
      <mesh
        ref={meshRef}
        position={shape.position}
        rotation={shape.rotation}
        scale={shape.scale}
      >
        {geometry}
        <MeshDistortMaterial
          color="#ffffff"
          wireframe
          transparent
          opacity={0.15}
          distort={0.2}
          speed={2}
        />
      </mesh>
    </Float>
  );
};

const FloatingShapes: React.FC<FloatingShapesProps> = ({ scrollProgress = 0 }) => {
  const shapes: ShapeData[] = useMemo(() => [
    {
      position: [-4, 2, -3],
      rotation: [0.5, 0, 0],
      scale: 1.2,
      speed: 1.5,
      type: 'icosahedron',
    },
    {
      position: [4, -1, -4],
      rotation: [0, 0.5, 0],
      scale: 0.8,
      speed: 2,
      type: 'octahedron',
    },
    {
      position: [-3, -2, -2],
      rotation: [0, 0, 0.5],
      scale: 0.6,
      speed: 1.8,
      type: 'torus',
    },
    {
      position: [3, 3, -5],
      rotation: [0.3, 0.3, 0],
      scale: 1,
      speed: 1.2,
      type: 'torusKnot',
    },
    {
      position: [0, -3, -3],
      rotation: [0, 0.2, 0.2],
      scale: 0.7,
      speed: 1.6,
      type: 'icosahedron',
    },
    {
      position: [-5, 0, -6],
      rotation: [0.1, 0.1, 0.1],
      scale: 1.5,
      speed: 1,
      type: 'octahedron',
    },
    {
      position: [5, 1, -7],
      rotation: [0.2, 0.3, 0.1],
      scale: 0.9,
      speed: 1.4,
      type: 'torus',
    },
  ], []);

  return (
    <group>
      {shapes.map((shape, index) => (
        <FloatingShape
          key={index}
          shape={shape}
          index={index}
          scrollProgress={scrollProgress}
        />
      ))}
    </group>
  );
};

export default FloatingShapes;


