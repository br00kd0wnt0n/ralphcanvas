import { useRef, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { ColorManager } from './ColorManager';
import { FlowField } from './FlowField';
import { ParticleSystem } from './ParticleSystem';

interface VisualEngineProps {
  className?: string;
}

function Scene() {
  const { camera } = useThree();
  const colorManager = useRef(new ColorManager()).current;
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Set up camera
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);
    setIsLoaded(true);
  }, [camera]);

  if (!isLoaded) return null;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 15]} />
      <OrbitControls enableZoom={false} enablePan={false} />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} color={colorManager.getAmbientLight()} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        color={colorManager.getDirectionalLight()}
      />

      {/* Visual Components */}
      <FlowField colorManager={colorManager} count={30} length={50} />
      <ParticleSystem colorManager={colorManager} count={2000} size={0.03} />
    </>
  );
}

export function VisualEngine({ className = '' }: VisualEngineProps) {
  return (
    <div className={`w-full h-screen bg-black ${className}`}>
      <Canvas
        dpr={[1, 2]} // Responsive pixel ratio
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
} 