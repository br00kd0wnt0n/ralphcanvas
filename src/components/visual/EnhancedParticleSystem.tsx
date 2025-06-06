'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, BufferGeometry, Float32BufferAttribute, PointsMaterial, Color, Vector3 } from 'three';

interface EnhancedParticleSystemProps {
  count?: number;
  size?: number;
  speed?: number;
  colors?: string[];
  distribution?: 'cube' | 'sphere' | 'random';
}

export function EnhancedParticleSystem({
  count = 1000,
  size = 0.05,
  speed = 0.5,
  colors = ['#ff0000', '#00ff00', '#0000ff'],
  distribution = 'random'
}: EnhancedParticleSystemProps) {
  const pointsRef = useRef<Points>(null);
  const timeRef = useRef(0);

  // Create particle positions based on distribution type
  const { positions, particleColors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const colorObjects = colors.map(c => new Color(c));
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let x = 0, y = 0, z = 0;
      
      switch (distribution) {
        case 'cube':
          // Create points in a 2x2x2 cube
          x = (Math.random() - 0.5) * 2;
          y = (Math.random() - 0.5) * 2;
          z = (Math.random() - 0.5) * 2;
          break;
          
        case 'sphere':
          // Create points in a sphere using spherical coordinates
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const radius = Math.random();
          x = radius * Math.sin(phi) * Math.cos(theta);
          y = radius * Math.sin(phi) * Math.sin(theta);
          z = radius * Math.cos(phi);
          break;
          
        case 'random':
        default:
          // Random distribution in a larger space
          x = (Math.random() - 0.5) * 4;
          y = (Math.random() - 0.5) * 4;
          z = (Math.random() - 0.5) * 4;
      }
      
      pos[i3] = x;
      pos[i3 + 1] = y;
      pos[i3 + 2] = z;
      
      // Assign colors cyclically
      const color = colorObjects[i % colorObjects.length];
      cols[i3] = color.r;
      cols[i3 + 1] = color.g;
      cols[i3 + 2] = color.b;
    }
    
    return { positions: pos, particleColors: cols };
  }, [count, colors, distribution]);

  // Create geometry and material
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new Float32BufferAttribute(particleColors, 3));
    return geo;
  }, [positions, particleColors]);

  const material = useMemo(() => {
    return new PointsMaterial({
      size,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: 2, // Additive blending for brighter particles
    });
  }, [size]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    timeRef.current += delta;
    const time = timeRef.current;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    // Update particle positions with organic movement
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = positions[i3];
      const y = positions[i3 + 1];
      const z = positions[i3 + 2];
      
      // Create organic movement based on time and position
      positions[i3] = x + Math.sin(time * speed + y * 0.1) * speed * 0.1;
      positions[i3 + 1] = y + Math.cos(time * speed + z * 0.1) * speed * 0.1;
      positions[i3 + 2] = z + Math.sin(time * speed + x * 0.1) * speed * 0.05;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <primitive
      ref={pointsRef}
      object={new Points(geometry, material)}
    />
  );
} 