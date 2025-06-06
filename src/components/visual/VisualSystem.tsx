import React, { useRef, useEffect, useMemo, memo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { FlowField } from './FlowField';
import { ColorManager } from './ColorManager';
import { useCanvasState } from '../../hooks/useCanvasState';
import { EnhancedParticleSystem } from './EnhancedParticleSystem';

export interface VisualParameters {
  particleCount: number;
  flowSpeed: number;
  ribbonLength: number;
  colorIntensity: number;
  zoneDiversity: number;
}

interface VisualSystemProps {
  params: VisualParameters;
}

// Memoized components for better performance
const MemoizedFlowField = memo(FlowField);
const MemoizedParticleSystem = memo(EnhancedParticleSystem);

function calculateZoneParams(params: VisualParameters, viewport: { width: number; height: number }) {
  const zones = [];
  const zoneCount = Math.max(1, Math.floor(params.zoneDiversity * 4));
  
  for (let i = 0; i < zoneCount; i++) {
    const angle = (i / zoneCount) * Math.PI * 2;
    const radius = Math.min(viewport.width, viewport.height) * 0.6;
    
    const verticalOffset = (Math.random() - 0.5) * viewport.height * 0.4;
    
    zones.push({
      position: new Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius + verticalOffset,
        0
      ),
      scale: new Vector3(1.2, 1.2, 1.2),
      params: {
        ...params,
        particleCount: Math.floor(params.particleCount / zoneCount),
        flowSpeed: params.flowSpeed * (0.9 + Math.random() * 0.4),
        ribbonLength: params.ribbonLength * (0.8 + Math.random() * 0.4)
      }
    });
  }
  
  return zones;
}

export const VisualSystem = memo(function VisualSystem({ params }: VisualSystemProps) {
  const colorManager = useRef(new ColorManager()).current;
  const { state } = useCanvasState();
  const { viewport } = useThree();
  const hasLoggedRef = useRef(false);
  
  // Memoize zones with useMemo and stable dependencies
  const zones = useMemo(() => {
    return calculateZoneParams(params, viewport);
  }, [
    params.particleCount,
    params.flowSpeed,
    params.ribbonLength,
    params.colorIntensity,
    params.zoneDiversity,
    viewport.width,
    viewport.height
  ]);

  // Memoize zone rendering with useCallback
  const renderZone = useCallback((zone: typeof zones[0]) => (
    <group position={zone.position} scale={zone.scale}>
      <MemoizedFlowField
        colorManager={colorManager}
        count={zone.params.particleCount}
        length={zone.params.ribbonLength}
        flowSpeed={zone.params.flowSpeed}
        colorIntensity={zone.params.colorIntensity * 1.2}
      />
      <MemoizedParticleSystem
        count={Math.floor(zone.params.particleCount * 0.6)}
        size={0.2}
        speed={zone.params.flowSpeed * 1.2}
        colors={['#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#00ffff']}
        distribution="random"
      />
    </group>
  ), [colorManager]);

  // Log initialization only once
  useEffect(() => {
    if (!hasLoggedRef.current) {
      console.log('VisualSystem initialized:', {
        viewport: {
          width: viewport.width,
          height: viewport.height
        },
        zones: zones.length,
        hasCanvasState: !!state
      });
      hasLoggedRef.current = true;
    }
  }, [viewport.width, viewport.height, zones.length, state]);

  return (
    <group>
      {zones.map((zone, index) => (
        <React.Fragment key={`zone-${index}`}>
          {renderZone(zone)}
        </React.Fragment>
      ))}
    </group>
  );
}); 