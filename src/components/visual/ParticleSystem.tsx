import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, Float32BufferAttribute, Points, Vector3, BufferAttribute } from 'three';
import { ColorManager, RALPH_COLORS } from './ColorManager';

interface ParticleSystemProps {
  count?: number;
  size?: number;
  speed?: number;
}

export function ParticleSystem({ 
  count = 1000, 
  size = 0.05, 
  speed = 0.5 
}: ParticleSystemProps) {
  const pointsRef = useRef<Points>(null);
  const [colorManager, setColorManager] = useState<ColorManager | null>(null);
  const time = useRef(0);

  useEffect(() => {
    setColorManager(ColorManager.getInstance());
  }, []);

  // Create particle geometry
  const geometry = useMemo(() => {
    const geometry = new BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      // Velocity
      velocities[i * 3] = (Math.random() - 0.5) * speed;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * speed;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * speed;

      // Phase
      phases[i] = Math.random() * Math.PI * 2;

      // Initial color
      const color = RALPH_COLORS.primary;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    geometry.setAttribute('velocity', new Float32BufferAttribute(velocities, 3));
    geometry.setAttribute('phase', new Float32BufferAttribute(phases, 1));

    return geometry;
  }, [count, speed]);

  useFrame((state, delta) => {
    if (!pointsRef.current || !colorManager) return;

    time.current += delta;
    colorManager.update(delta);

    const positions = geometry.getAttribute('position') as BufferAttribute;
    const colors = geometry.getAttribute('color') as BufferAttribute;
    const velocities = geometry.getAttribute('velocity') as BufferAttribute;
    const phases = geometry.getAttribute('phase') as BufferAttribute;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const position = new Vector3(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      );

      // Update position with velocity and noise
      const phase = phases.getX(i);
      const noise = Math.sin(time.current * 2 + phase) * 0.1;
      
      position.x += velocities.getX(i) * delta + noise;
      position.y += velocities.getY(i) * delta + noise;
      position.z += velocities.getZ(i) * delta + noise;

      // Wrap around boundaries
      if (Math.abs(position.x) > 5) position.x *= -0.9;
      if (Math.abs(position.y) > 5) position.y *= -0.9;
      if (Math.abs(position.z) > 5) position.z *= -0.9;

      // Update position
      positions.setXYZ(i, position.x, position.y, position.z);

      // Update color
      const color = colorManager.getInterpolatedColor(position, time.current + phase);
      colors.setXYZ(i, color.r, color.g, color.b);
    }

    positions.needsUpdate = true;
    colors.needsUpdate = true;
  });

  if (!colorManager) return null;

  return (
    <points ref={pointsRef}>
      <primitive object={geometry} />
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
} 