import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, CatmullRomCurve3, TubeGeometry, Mesh, Group, MeshPhongMaterial, Object3D } from 'three';
import { ColorManager, RALPH_COLORS } from './ColorManager';

interface FlowFieldProps {
  count?: number;
  length?: number;
  radius?: number;
  segments?: number;
}

export function FlowField({ 
  count = 20, 
  length = 10, 
  radius = 0.1, 
  segments = 64 
}: FlowFieldProps) {
  const groupRef = useRef<Group>(null);
  const [colorManager, setColorManager] = useState<ColorManager | null>(null);
  const time = useRef(0);

  useEffect(() => {
    setColorManager(ColorManager.getInstance());
  }, []);

  // Create initial ribbon paths
  const ribbons = useMemo(() => {
    return Array.from({ length: count }, () => {
      const points: Vector3[] = [];
      const startPoint = new Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      
      // Generate points for the ribbon path
      for (let i = 0; i < length; i++) {
        const t = i / (length - 1);
        const point = new Vector3(
          startPoint.x + Math.sin(t * Math.PI * 2) * 2,
          startPoint.y + Math.cos(t * Math.PI * 2) * 2,
          startPoint.z + Math.sin(t * Math.PI * 4) * 1
        );
        points.push(point);
      }

      const curve = new CatmullRomCurve3(points);
      const geometry = new TubeGeometry(curve, segments, radius, 8, false);
      
      return {
        curve,
        geometry,
        speed: 0.2 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
      };
    });
  }, [count, length, radius, segments]);

  useFrame((state, delta) => {
    if (!groupRef.current || !colorManager) return;
    
    time.current += delta;
    colorManager.update(delta);

    // Update ribbon positions and colors
    groupRef.current.children.forEach((child: Object3D, index: number) => {
      if (!(child instanceof Mesh)) return;
      
      const ribbon = ribbons[index];
      const material = child.material as MeshPhongMaterial;
      
      // Update ribbon position
      const t = (time.current * ribbon.speed + ribbon.phase) % 1;
      const position = ribbon.curve.getPoint(t);
      child.position.copy(position);
      
      // Update color
      material.color = colorManager.getInterpolatedColor(position, time.current);
      material.emissive = material.color.clone().multiplyScalar(0.2);
    });
  });

  if (!colorManager) return null;

  return (
    <group ref={groupRef}>
      {ribbons.map((ribbon, index) => (
        <mesh key={index} geometry={ribbon.geometry}>
          <meshPhongMaterial
            color={RALPH_COLORS.primary}
            emissive={RALPH_COLORS.primary}
            emissiveIntensity={0.2}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
} 