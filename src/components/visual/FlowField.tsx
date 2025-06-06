import React, { useRef, useMemo, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
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

  // Use fixed screen dimensions for coordinate space
  const screenDimensions = useMemo(() => ({
    width: 20,  // Fixed coordinate space width
    height: 12  // 16:9-ish ratio
  }), []); // Empty dependency array since these are constants

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

  // Create static positions for particles using manual screen coordinates
  const { positions, colors } = useMemo(() => {
    const { width, height } = screenDimensions;
    const pos = new Float32Array([
      // Bottom row
      -width/2, -height/2, 0,    // Bottom left
      0, -height/2, 0,           // Bottom center
      width/2, -height/2, 0,     // Bottom right
      // Middle row
      -width/2, 0, 0,            // Middle left
      0, 0, 0,                   // Center
      width/2, 0, 0,             // Middle right
      // Top row
      -width/2, height/2, 0,     // Top left
      0, height/2, 0,            // Top center
      width/2, height/2, 0       // Top right
    ]);
    
    // Define colors (RGB pattern)
    const cols = new Float32Array([
      // Bottom row
      1, 0, 0,     // Red
      0, 1, 0,     // Green
      0, 0, 1,     // Blue
      // Middle row
      1, 0, 0,     // Red
      0, 1, 0,     // Green
      0, 0, 1,     // Blue
      // Top row
      1, 0, 0,     // Red
      0, 1, 0,     // Green
      0, 0, 1      // Blue
    ]);
    
    return { positions: pos, colors: cols };
  }, [screenDimensions]); // Only recompute if screen dimensions change

  // Create geometry and material
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  const material = useMemo(() => {
    return new PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      sizeAttenuation: true
    });
  }, []); // Empty dependency array since material properties are static

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