import { Canvas as ThreeCanvas } from '@react-three/fiber';
import { VisualSystem } from './visual/VisualSystem';
import { CanvasState } from '../types/canvas';
import { VisualControls } from './visual/VisualControls';
import { PerspectiveCamera } from '@react-three/drei';
import { memo, useMemo } from 'react';

interface CanvasProps {
  state: CanvasState;
}

// Memoize the Canvas component to prevent unnecessary re-renders
export const Canvas = memo(function Canvas({ state }: CanvasProps) {
  // Add safety check for particleConfigs
  const defaultParticleConfig = {
    count: 2000,
    size: 0.1,
    speed: 1.0,
    lifetime: 5.0,
    color: '#00ff88'
  };

  // Default color palette in case state is not yet loaded
  const defaultColorPalette = {
    primary: '#00ff88',
    secondary: '#0088ff',
    accent: '#ff0088',
    background: '#000000',
    text: '#ffffff'
  };

  // Memoize visual parameters to prevent unnecessary recalculations
  const visualParams = useMemo(() => ({
    particleCount: state?.particleConfigs?.default?.count ?? defaultParticleConfig.count,
    flowSpeed: state?.flowParameters?.velocity ?? 1.0,
    ribbonLength: 100, // This could be derived from state if needed
    colorIntensity: 0.8, // This could be derived from state if needed
    zoneDiversity: state?.flowParameters?.turbulence ?? 0.5
  }), [
    state?.particleConfigs?.default?.count,
    state?.flowParameters?.velocity,
    state?.flowParameters?.turbulence
  ]);

  // Memoize the background color to prevent unnecessary style updates
  const backgroundColor = useMemo(() => 
    state?.colorPalette?.background ?? defaultColorPalette.background,
    [state?.colorPalette?.background]
  );

  return (
    <div 
      className="fixed inset-0 w-screen h-screen overflow-hidden"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor,
        overflow: 'hidden'
      }}
    >
      <div className="absolute inset-0 z-10">
        <VisualControls params={visualParams} />
      </div>
      <div 
        className="absolute inset-0"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%'
        }}
      >
        <ThreeCanvas
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            backgroundColor
          }}
        >
          <PerspectiveCamera
            makeDefault
            position={[0, 0, 15]}
            fov={75}
            near={0.1}
            far={1000}
          />
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <VisualSystem params={visualParams} />
        </ThreeCanvas>
      </div>
    </div>
  );
}); 