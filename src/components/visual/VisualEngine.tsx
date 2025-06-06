import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { FlowField } from './FlowField';
import { ParticleSystem } from './ParticleSystem';
import { ColorManager } from './ColorManager';

interface VisualEngineProps {
  className?: string;
}

export function VisualEngine({ className = '' }: VisualEngineProps) {
  const [mounted, setMounted] = useState(false);
  const [colorManager, setColorManager] = useState<ColorManager | null>(null);

  useEffect(() => {
    setMounted(true);
    setColorManager(ColorManager.getInstance());
  }, []);

  if (!mounted || !colorManager) return null;

  return (
    <div className={`w-full h-screen ${className}`}>
      <Canvas
        dpr={[1, 2]} // Responsive pixel ratio
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera
            makeDefault
            position={[0, 0, 15]}
            fov={75}
            near={0.1}
            far={1000}
          />
          
          {/* Lighting */}
          <ambientLight intensity={colorManager.getAmbientLightIntensity(0)} />
          <pointLight
            position={[10, 10, 10]}
            intensity={colorManager.getPointLightIntensity(0)}
          />
          <pointLight
            position={[-10, -10, -10]}
            intensity={colorManager.getPointLightIntensity(0)}
          />

          {/* Visual Components */}
          <FlowField count={15} length={8} radius={0.05} />
          <ParticleSystem count={2000} size={0.03} speed={0.3} />

          {/* Controls */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
} 