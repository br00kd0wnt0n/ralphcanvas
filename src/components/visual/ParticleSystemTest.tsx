'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { EnhancedParticleSystem } from './EnhancedParticleSystem';

function RotatingScene() {
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2; // Gentle rotation
      groupRef.current.rotation.x += delta * 0.1; // Slight tilt
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      
      {/* Test different particle distributions */}
      <EnhancedParticleSystem
        count={2000}
        size={0.05}
        speed={0.3}
        colors={['#ff0000', '#00ff00', '#0000ff']}
        distribution="cube"
      />
      
      <EnhancedParticleSystem
        count={1000}
        size={0.08}
        speed={0.5}
        colors={['#ff00ff', '#00ffff', '#ffff00']}
        distribution="sphere"
      />
      
      <EnhancedParticleSystem
        count={1500}
        size={0.03}
        speed={0.4}
        colors={['#ffffff', '#ff8800', '#88ff00']}
        distribution="random"
      />
    </group>
  );
}

export function ParticleSystemTest() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [3, 3, 3], fov: 75 }}
        dpr={[1, 2]}
        style={{ background: '#000000' }}
      >
        <RotatingScene />
      </Canvas>
    </div>
  );
} 