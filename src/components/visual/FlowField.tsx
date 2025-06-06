import React, { useRef, useMemo, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { BufferGeometry, Float32BufferAttribute, PointsMaterial, Points } from 'three';
import { ColorManager } from './ColorManager';

interface FlowFieldProps {
  colorManager: ColorManager;
  count?: number;
  length?: number;
  flowSpeed?: number;
  colorIntensity?: number;
}

export const FlowField = React.memo(function FlowField({ 
  colorManager,
  count = 3,
  length = 1,
  flowSpeed = 1.0,
  colorIntensity = 1.0
}: FlowFieldProps) {
  const pointsRef = useRef<Points>(null);
  const hasLoggedRef = useRef(false);
  const { viewport } = useThree();

  // Use viewport dimensions for coordinate space
  const screenDimensions = useMemo(() => ({
    width: viewport.width,  // Use actual viewport width
    height: viewport.height // Use actual viewport height
  }), [viewport.width, viewport.height]); // Update when viewport changes

  // Log initialization only once
  useEffect(() => {
    if (!hasLoggedRef.current) {
      console.log('FlowField initialized:', { 
        screenDimensions,
        aspectRatio: screenDimensions.width / screenDimensions.height,
        viewport,
        props: { count, length, flowSpeed, colorIntensity }
      });

      // Log sample positions for verification
      console.log('Sample particle positions:', {
        bottomLeft: [-screenDimensions.width/2, -screenDimensions.height/2, 0],
        center: [0, 0, 0],
        topRight: [screenDimensions.width/2, screenDimensions.height/2, 0]
      });

      hasLoggedRef.current = true;
    }
  }, [screenDimensions, viewport, count, length, flowSpeed, colorIntensity]);

  // Create dynamic positions for particles
  const { positions, colors } = useMemo(() => {
    const { width, height } = screenDimensions;
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Distribute particles randomly across the screen
      pos[i3] = (Math.random() - 0.5) * width;
      pos[i3 + 1] = (Math.random() - 0.5) * height;
      pos[i3 + 2] = (Math.random() - 0.5) * 5; // Small z-depth variation
      
      // Use colorManager for dynamic colors
      const colorKeys = ['primary', 'secondary', 'accent1', 'accent2', 'accent3'] as const;
      const colorKey = colorKeys[i % colorKeys.length];
      const color = colorManager.getColor(colorKey);
      cols[i3] = color.r;
      cols[i3 + 1] = color.g;
      cols[i3 + 2] = color.b;
    }
    
    return { positions: pos, colors: cols };
  }, [screenDimensions, count, colorManager]);

  // Create geometry and material
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  const material = useMemo(() => {
    return new PointsMaterial({
      size: 0.2,  // Increased size
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: 2  // Additive blending for better visibility
    });
  }, []);

  // Add animation
  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < positions.length; i += 3) {
      // Add organic movement
      positions[i] += Math.sin(time * flowSpeed + positions[i + 1] * 0.1) * delta * flowSpeed;
      positions[i + 1] += Math.cos(time * flowSpeed + positions[i] * 0.1) * delta * flowSpeed;
      positions[i + 2] += Math.sin(time * flowSpeed * 0.5 + positions[i] * 0.05) * delta * flowSpeed * 0.5;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <primitive
      ref={pointsRef}
      object={new Points(geometry, material)}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.count === nextProps.count &&
    prevProps.length === nextProps.length &&
    prevProps.flowSpeed === nextProps.flowSpeed &&
    prevProps.colorIntensity === nextProps.colorIntensity &&
    prevProps.colorManager === nextProps.colorManager
  );
}); 