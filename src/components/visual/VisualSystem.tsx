import React, { useRef, useEffect, useMemo, memo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { FlowField } from './FlowField';
import { ColorManager } from './ColorManager';
import { useCanvasState } from '../../hooks/useCanvasState';

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

// Move zone calculations outside component
const calculateZoneParams = (baseParams: VisualParameters, viewport: { width: number; height: number }) => {
  const horizontalSpacing = Math.min(viewport.width, viewport.height) * 0.3;
  const verticalSpacing = Math.min(viewport.width, viewport.height) * 0.2;
  
  return [
    // Left zone
    { 
      position: new Vector3(-horizontalSpacing, -verticalSpacing, 0), 
      scale: 1.2, 
      params: { 
        ...baseParams, 
        flowSpeed: baseParams.flowSpeed * 1.2,
        particleCount: Math.floor(baseParams.particleCount * 0.8)
      } 
    },
    // Right zone
    { 
      position: new Vector3(horizontalSpacing, verticalSpacing, 0), 
      scale: 0.8, 
      params: { 
        ...baseParams, 
        flowSpeed: baseParams.flowSpeed * 0.8,
        particleCount: Math.floor(baseParams.particleCount * 0.8)
      } 
    },
    // Center zone
    { 
      position: new Vector3(0, 0, 0), 
      scale: 1.0, 
      params: { 
        ...baseParams, 
        particleCount: Math.floor(baseParams.particleCount * 1.2),
        flowSpeed: baseParams.flowSpeed * 1.0
      } 
    }
  ];
};

// Memoize the FlowField component with more specific props
const MemoizedFlowField = memo(FlowField, (prevProps, nextProps) => {
  return (
    prevProps.count === nextProps.count &&
    prevProps.length === nextProps.length &&
    prevProps.flowSpeed === nextProps.flowSpeed &&
    prevProps.colorIntensity === nextProps.colorIntensity &&
    prevProps.colorManager === nextProps.colorManager
  );
});

// Memoize the VisualSystem component
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
        colorIntensity={zone.params.colorIntensity}
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
    <>
      {zones.map((zone, index) => (
        <React.Fragment key={`zone-${index}`}>
          {renderZone(zone)}
        </React.Fragment>
      ))}
    </>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.params.particleCount === nextProps.params.particleCount &&
    prevProps.params.flowSpeed === nextProps.params.flowSpeed &&
    prevProps.params.ribbonLength === nextProps.params.ribbonLength &&
    prevProps.params.colorIntensity === nextProps.params.colorIntensity &&
    prevProps.params.zoneDiversity === nextProps.params.zoneDiversity
  );
}); 