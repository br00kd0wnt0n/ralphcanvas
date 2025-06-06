import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { BufferGeometry, Float32BufferAttribute, PointsMaterial, Points, Vector3, Color } from 'three';
import { ColorManager } from './ColorManager';

interface ParticleSystemProps {
  colorManager: ColorManager;
  count?: number;
  size?: number;
}

export function ParticleSystem({ colorManager, count = 1000, size = 0.05 }: ParticleSystemProps) {
  console.log('ParticleSystem component mounting...', { count, size });
  
  const pointsRef = useRef<Points>(null);
  const timeRef = useRef(0);
  const { viewport, size: canvasSize } = useThree();

  useEffect(() => {
    console.log('ParticleSystem component mounted and initialized', {
      viewport,
      canvasSize,
      particleCount: count,
      particleSize: size,
      componentState: {
        hasPointsRef: !!pointsRef.current,
        timeRef: timeRef.current
      }
    });
  }, [viewport, canvasSize, count, size]);

  // Debug logging for particle system
  useEffect(() => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const bounds = {
        minX: Infinity, maxX: -Infinity,
        minY: Infinity, maxY: -Infinity,
        minZ: Infinity, maxZ: -Infinity
      };

      // Calculate bounds
      for (let i = 0; i < positions.length; i += 3) {
        bounds.minX = Math.min(bounds.minX, positions[i]);
        bounds.maxX = Math.max(bounds.maxX, positions[i]);
        bounds.minY = Math.min(bounds.minY, positions[i + 1]);
        bounds.maxY = Math.max(bounds.maxY, positions[i + 1]);
        bounds.minZ = Math.min(bounds.minZ, positions[i + 2]);
        bounds.maxZ = Math.max(bounds.maxZ, positions[i + 2]);
      }

      console.log('Particle System Debug:', {
        totalParticles: count,
        particleSize: size,
        canvasSize: {
          width: canvasSize.width,
          height: canvasSize.height
        },
        viewportSize: {
          width: viewport.width,
          height: viewport.height,
          factor: viewport.factor
        },
        particleBounds: bounds,
        distribution: {
          xRange: bounds.maxX - bounds.minX,
          yRange: bounds.maxY - bounds.minY,
          zRange: bounds.maxZ - bounds.minZ
        }
      });
    }
  }, [count, size, viewport, canvasSize]);

  // Create particle positions with full viewport distribution
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    // Calculate viewport bounds
    const halfWidth = viewport.width / 2;
    const halfHeight = viewport.height / 2;
    const depth = Math.min(viewport.width, viewport.height) * 0.1; // 10% of viewport size for depth
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Distribute particles across the full viewport
      pos[i3] = (Math.random() - 0.5) * viewport.width; // X: -width/2 to +width/2
      pos[i3 + 1] = (Math.random() - 0.5) * viewport.height; // Y: -height/2 to +height/2
      pos[i3 + 2] = (Math.random() - 0.5) * depth; // Z: small depth range
      
      // Assign bright colors for visibility
      const color = new Color();
      if (i % 3 === 0) {
        color.setRGB(1, 1, 1); // White
      } else if (i % 3 === 1) {
        color.setRGB(1, 0, 0); // Red
      } else {
        color.setRGB(0, 1, 1); // Cyan
      }
      
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }
    return { positions: pos, colors };
  }, [count, viewport]);

  // Create geometry and material
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(positions.positions, 3));
    geo.setAttribute('color', new Float32BufferAttribute(positions.colors, 3));
    return geo;
  }, [positions]);

  const material = useMemo(() => {
    return new PointsMaterial({
      size,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      sizeAttenuation: true,
      blending: 2, // Additive blending for brighter particles
    });
  }, [size]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    timeRef.current += delta;
    colorManager.update(delta);

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = timeRef.current;
    const movementScale = Math.min(viewport.width, viewport.height) * 0.01; // Scale movement to viewport

    // Update particle positions with more visible movement
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = positions[i3];
      const y = positions[i3 + 1];
      const z = positions[i3 + 2];

      // Create more pronounced movement scaled to viewport
      positions[i3] = x + Math.sin(time * 0.5 + y * 0.1) * movementScale;
      positions[i3 + 1] = y + Math.cos(time * 0.3 + z * 0.1) * movementScale;
      positions[i3 + 2] = z + Math.sin(time * 0.4 + x * 0.1) * (movementScale * 0.5);
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