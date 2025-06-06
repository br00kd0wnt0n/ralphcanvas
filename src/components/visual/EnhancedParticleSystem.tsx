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
  size = 0.15,
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
          // Create points in a larger 4x4x4 cube
          x = (Math.random() - 0.5) * 4;
          y = (Math.random() - 0.5) * 4;
          z = (Math.random() - 0.5) * 4;
          break;
          
        case 'sphere':
          // Create points in a larger sphere
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const radius = Math.random() * 2; // Increased radius
          x = radius * Math.sin(phi) * Math.cos(theta);
          y = radius * Math.sin(phi) * Math.sin(theta);
          z = radius * Math.cos(phi);
          break;
          
        case 'random':
        default:
          // Random distribution in a larger space with better vertical spread
          x = (Math.random() - 0.5) * 6; // Increased horizontal spread
          y = (Math.random() - 0.5) * 8; // Increased vertical spread
          z = (Math.random() - 0.5) * 6; // Increased depth spread
      }
      
      pos[i3] = x;
      pos[i3 + 1] = y;
      pos[i3 + 2] = z;
      
      // Assign colors cyclically with increased brightness
      const color = colorObjects[i % colorObjects.length].clone();
      color.multiplyScalar(1.5); // Increase brightness
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
      opacity: 0.9, // Increased opacity
      sizeAttenuation: true,
      blending: 2, // Additive blending for brighter particles
    });
  }, [size]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    timeRef.current += delta;
    const time = timeRef.current;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    // Update particle positions with more dynamic movement
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = positions[i3];
      const y = positions[i3 + 1];
      const z = positions[i3 + 2];
      
      // Create more dynamic movement with increased amplitude
      positions[i3] = x + Math.sin(time * speed + y * 0.1) * speed * 0.2;
      positions[i3 + 1] = y + Math.cos(time * speed + z * 0.1) * speed * 0.2;
      positions[i3 + 2] = z + Math.sin(time * speed + x * 0.1) * speed * 0.1;
      
      // Add vertical drift to ensure particles don't get stuck
      positions[i3 + 1] += Math.sin(time * 0.2 + i * 0.01) * 0.01;
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