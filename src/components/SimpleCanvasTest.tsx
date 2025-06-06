'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, BufferGeometry, Float32BufferAttribute, PointsMaterial, Group } from 'three';

function TestParticles() {
  const points = useMemo(() => {
    const geometry = new BufferGeometry();
    // Create points at the corners of a 2x2x2 cube to match the box
    const positions = [
      -1, -1, -1,  // Back bottom left
      -1, -1, 1,   // Front bottom left
      -1, 1, -1,   // Back top left
      -1, 1, 1,    // Front top left
      1, -1, -1,   // Back bottom right
      1, -1, 1,    // Front bottom right
      1, 1, -1,    // Back top right
      1, 1, 1,     // Front top right
    ];
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    
    const material = new PointsMaterial({ 
      size: 0.1,  // Smaller points for better visibility
      color: 'red',
      sizeAttenuation: true
    });
    return new Points(geometry, material);
  }, []);

  return <primitive object={points} />;
}

function RotatingScene() {
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5; // Rotate at 0.5 radians per second
      groupRef.current.rotation.x += delta * 0.2; // Add some tilt
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      
      {/* Yellow box */}
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
      
      {/* Red points */}
      <TestParticles />
    </group>
  );
}

export default function SimpleCanvasTest() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black', border: '5px solid red' }}>
      <Canvas
        camera={{ position: [3, 3, 3], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
      >
        <RotatingScene />
      </Canvas>
    </div>
  );
} 