import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, BufferGeometry, Float32BufferAttribute, LineBasicMaterial, Line } from 'three';
import { ColorManager, RALPH_COLORS } from './ColorManager';

interface FlowFieldProps {
  colorManager: ColorManager;
  count?: number;
  length?: number;
}

export function FlowField({ colorManager, count = 50, length = 100 }: FlowFieldProps) {
  const linesRef = useRef<Line[]>([]);
  const timeRef = useRef(0);

  // Create initial ribbon positions
  const positions = useMemo(() => {
    const pos: number[] = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      pos.push(x, y, z);
    }
    return pos;
  }, [count]);

  // Create geometries and materials for each ribbon
  const geometries = useMemo(() => {
    return Array.from({ length: count }, () => {
      const geometry = new BufferGeometry();
      const points = new Float32Array(length * 3);
      geometry.setAttribute('position', new Float32BufferAttribute(points, 3));
      return geometry;
    });
  }, [count, length]);

  const materials = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const color = i % 2 === 0 ? RALPH_COLORS.primary : RALPH_COLORS.secondary;
      return new LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
    });
  }, [count]);

  useFrame((state, delta) => {
    timeRef.current += delta;
    colorManager.update(delta);

    linesRef.current.forEach((line, i) => {
      const positions = line.geometry.attributes.position.array as Float32Array;
      const basePos = new Vector3(
        positions[0],
        positions[1],
        positions[2]
      );

      // Update each point in the ribbon
      for (let j = 0; j < length; j++) {
        const t = j / length;
        const time = timeRef.current + i * 0.1;
        
        // Create flowing motion using noise-like functions
        const x = basePos.x + Math.sin(time * 0.5 + t * 5) * 0.5;
        const y = basePos.y + Math.cos(time * 0.3 + t * 4) * 0.5;
        const z = basePos.z + Math.sin(time * 0.4 + t * 3) * 0.5;

        positions[j * 3] = x;
        positions[j * 3 + 1] = y;
        positions[j * 3 + 2] = z;
      }

      line.geometry.attributes.position.needsUpdate = true;
      
      // Update material color with time-based effects
      const material = line.material as LineBasicMaterial;
      const color = colorManager.getGradient('primary', 'secondary', 
        (Math.sin(timeRef.current * 0.5 + i * 0.1) + 1) * 0.5
      );
      material.color = color;
    });
  });

  return (
    <group>
      {geometries.map((geometry, i) => (
        <primitive
          key={i}
          ref={(el: Line) => {
            if (el) linesRef.current[i] = el;
          }}
          object={new Line(geometry, materials[i])}
        />
      ))}
    </group>
  );
} 