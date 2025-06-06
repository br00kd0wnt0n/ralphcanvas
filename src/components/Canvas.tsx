import { Canvas as ThreeCanvas } from '@react-three/fiber';
import { VisualSystem } from './visual/VisualSystem';
import { useState } from 'react';
import { VisualParameters } from './visual/VisualSystem';
import { VisualControls } from './visual/VisualControls';

const DEFAULT_PARAMS: VisualParameters = {
  particleCount: 50,
  flowSpeed: 1.0,
  ribbonLength: 100,
  colorIntensity: 0.8,
  zoneDiversity: 0.5
};

export function Canvas() {
  const [params, setParams] = useState<VisualParameters>(DEFAULT_PARAMS);

  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden">
      <div className="absolute inset-0 z-10">
        <VisualControls params={params} onParamsChange={setParams} />
      </div>
      <div className="absolute inset-0">
        <ThreeCanvas
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
        >
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <VisualSystem params={params} />
        </ThreeCanvas>
      </div>
    </div>
  );
} 