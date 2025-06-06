import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, Float32BufferAttribute, PointsMaterial, Points, Vector3 } from 'three';
import { ColorManager } from './ColorManager';

interface ParticleSystemProps {
  colorManager: ColorManager;
  count?: number;
  size?: number;
}

export function ParticleSystem({ colorManager, count = 1000, size = 0.05 }: ParticleSystemProps) {
  const pointsRef = useRef<Points>(null);
  const timeRef = useRef(0);

  // Create particle positions
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 10;
      pos[i3 + 1] = (Math.random() - 0.5) * 10;
      pos[i3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [count]);

  // Create geometry and material
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const material = useMemo(() => {
    return new PointsMaterial({
      size,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });
  }, [size]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    timeRef.current += delta;
    colorManager.update(delta);

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = timeRef.current;

    // Update particle positions
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = positions[i3];
      const y = positions[i3 + 1];
      const z = positions[i3 + 2];

      // Create organic movement using multiple sine waves
      positions[i3] = x + Math.sin(time * 0.5 + y * 0.1) * 0.01;
      positions[i3 + 1] = y + Math.cos(time * 0.3 + z * 0.1) * 0.01;
      positions[i3 + 2] = z + Math.sin(time * 0.4 + x * 0.1) * 0.01;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Update particle colors
    const material = pointsRef.current.material as PointsMaterial;
    const color = colorManager.getGradient('accent1', 'accent2', 
      (Math.sin(time * 0.2) + 1) * 0.5
    );
    material.color = color;
  });

  return (
    <primitive
      ref={pointsRef}
      object={new Points(geometry, material)}
    />
  );
} 