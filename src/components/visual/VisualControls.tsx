import { useState } from 'react';
import { VisualParameters } from './VisualSystem';

interface VisualControlsProps {
  params: VisualParameters;
  onParamsChange?: (params: VisualParameters) => void;
}

export function VisualControls({ params, onParamsChange }: VisualControlsProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleParamChange = (key: keyof VisualParameters, value: number) => {
    onParamsChange && onParamsChange({
      ...params,
      [key]: value
    });
  };

  // If onParamsChange is not provided, render a read-only view
  if (!onParamsChange) {
    return (
      <div className="absolute top-4 left-4 text-white text-sm opacity-50">
        <p>Flow Speed: {params.flowSpeed.toFixed(2)}</p>
        <p>Particles: {params.particleCount}</p>
        <p>Turbulence: {params.zoneDiversity.toFixed(2)}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: isVisible ? '20px' : '-300px',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '20px',
        borderRadius: '10px',
        color: 'white',
        transition: 'right 0.3s ease',
        width: '280px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}
    >
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          position: 'absolute',
          left: isVisible ? '-30px' : '10px',
          top: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          border: 'none',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
      >
        {isVisible ? '→' : '←'}
      </button>

      <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2em', fontWeight: '500' }}>Visual Controls</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>
          Particle Count: {params.particleCount}
        </label>
        <input
          type="range"
          min="10"
          max="200"
          value={params.particleCount}
          onChange={(e) => handleParamChange('particleCount', parseInt(e.target.value))}
          style={{ width: '100%', accentColor: '#00ff88' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>
          Flow Speed: {params.flowSpeed.toFixed(1)}
        </label>
        <input
          type="range"
          min="0.1"
          max="2"
          step="0.1"
          value={params.flowSpeed}
          onChange={(e) => handleParamChange('flowSpeed', parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#00ff88' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>
          Ribbon Length: {params.ribbonLength}
        </label>
        <input
          type="range"
          min="50"
          max="200"
          value={params.ribbonLength}
          onChange={(e) => handleParamChange('ribbonLength', parseInt(e.target.value))}
          style={{ width: '100%', accentColor: '#00ff88' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>
          Color Intensity: {params.colorIntensity.toFixed(1)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={params.colorIntensity}
          onChange={(e) => handleParamChange('colorIntensity', parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#00ff88' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>
          Zone Diversity: {params.zoneDiversity.toFixed(1)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={params.zoneDiversity}
          onChange={(e) => handleParamChange('zoneDiversity', parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#00ff88' }}
        />
      </div>
    </div>
  );
} 