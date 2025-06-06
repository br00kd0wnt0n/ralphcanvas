'use client';

import { useState, useEffect, useCallback } from 'react';
import { CanvasState, FlowParameters, ParticleConfig, ColorPalette, WeatherData } from '../../types/canvas';
import debounce from 'lodash/debounce';

interface AdminPanelProps {
  initialState: CanvasState;
  onStateChange: (newState: Partial<CanvasState>) => Promise<void>;
}

export function AdminPanel({ initialState, onStateChange }: AdminPanelProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [state, setState] = useState<CanvasState>({
    ...initialState,
    weatherData: initialState.weatherData || {
      temperature: 20,
      humidity: 50,
      windSpeed: 10,
      precipitation: 0,
      cloudCover: 30
    },
    flowParameters: initialState.flowParameters || {
      velocity: 1.0,
      turbulence: 0.5,
      direction: { x: 0, y: 0, z: 0 },
      scale: 1.0
    },
    particleConfigs: initialState.particleConfigs || {
      default: {
        count: 2000,
        size: 0.1,
        speed: 1.0,
        lifetime: 5.0,
        color: '#00ff88'
      }
    },
    colorPalette: initialState.colorPalette || {
      primary: '#00ff88',
      secondary: '#0088ff',
      accent: '#ff0088',
      background: '#000000',
      text: '#ffffff'
    },
    timeOfDay: initialState.timeOfDay || 12.0
  });
  const [isSaving, setIsSaving] = useState(false);

  // Create a debounced version of onStateChange
  const debouncedStateChange = useCallback(
    debounce(async (section: keyof CanvasState, value: any) => {
      setIsSaving(true);
      try {
        await onStateChange({ [section]: value });
      } catch (error) {
        console.error('Error saving state:', error);
      } finally {
        setIsSaving(false);
      }
    }, 500),
    [onStateChange]
  );

  const handleParamChange = async (section: keyof CanvasState, value: any) => {
    if (section === 'flowParameters' && typeof value === 'object') {
      const newState = {
        ...state,
        flowParameters: {
          ...state.flowParameters,
          ...value
        }
      };
      setState(newState);
      debouncedStateChange(section, newState.flowParameters);
      return;
    }

    const newState = { ...state, [section]: value };
    setState(newState);
    debouncedStateChange(section, value);
  };

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedStateChange.cancel();
    };
  }, [debouncedStateChange]);

  useEffect(() => {
    setState({
      ...initialState,
      weatherData: initialState.weatherData || {
        temperature: 20,
        humidity: 50,
        windSpeed: 10,
        precipitation: 0,
        cloudCover: 30
      },
      flowParameters: initialState.flowParameters || {
        velocity: 1.0,
        turbulence: 0.5,
        direction: { x: 0, y: 0, z: 0 },
        scale: 1.0
      },
      particleConfigs: initialState.particleConfigs || {
        default: {
          count: 2000,
          size: 0.1,
          speed: 1.0,
          lifetime: 5.0,
          color: '#00ff88'
        }
      },
      colorPalette: initialState.colorPalette || {
        primary: '#00ff88',
        secondary: '#0088ff',
        accent: '#ff0088',
        background: '#000000',
        text: '#ffffff'
      },
      timeOfDay: initialState.timeOfDay || 12.0
    });
  }, [initialState]);

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-black/95 text-white p-8 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{
        width: '450px',
        backdropFilter: 'blur(10px)',
        boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        overflowY: 'auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ffffff'
      }}
    >
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-black/95 py-4 z-10">
        <h2 className="text-2xl font-bold tracking-tight">Admin Controls</h2>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
          aria-label={isVisible ? 'Hide panel' : 'Show panel'}
        >
          {isVisible ? '→' : '←'}
        </button>
      </div>

      {isSaving && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Saving...
        </div>
      )}

      <div className="space-y-8">
        {/* Weather Controls */}
        <section className="space-y-4 bg-white/5 p-4 rounded-lg">
          <h3 className="text-xl font-semibold border-b border-white/20 pb-3">Weather</h3>
          <div className="space-y-4">
            <label className="block space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Temperature</span>
                <span className="text-white/80">{state.weatherData?.temperature ?? 20}°C</span>
              </div>
              <input
                type="range"
                min="-10"
                max="40"
                value={state.weatherData?.temperature ?? 20}
                onChange={(e) => handleParamChange('weatherData', {
                  ...state.weatherData,
                  temperature: Number(e.target.value)
                })}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </label>
            <label className="block space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Humidity</span>
                <span className="text-white/80">{state.weatherData?.humidity ?? 50}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={state.weatherData?.humidity ?? 50}
                onChange={(e) => handleParamChange('weatherData', {
                  ...state.weatherData,
                  humidity: Number(e.target.value)
                })}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </label>
            <label className="block space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Wind Speed</span>
                <span className="text-white/80">{state.weatherData?.windSpeed ?? 10} km/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={state.weatherData?.windSpeed ?? 10}
                onChange={(e) => handleParamChange('weatherData', {
                  ...state.weatherData,
                  windSpeed: Number(e.target.value)
                })}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </label>
            <label className="block space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Cloud Cover</span>
                <span className="text-white/80">{state.weatherData?.cloudCover ?? 30}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={state.weatherData?.cloudCover ?? 30}
                onChange={(e) => handleParamChange('weatherData', {
                  ...state.weatherData,
                  cloudCover: Number(e.target.value)
                })}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </label>
          </div>
        </section>

        {/* Flow Parameters */}
        <section className="space-y-4 bg-white/5 p-4 rounded-lg">
          <h3 className="text-xl font-semibold border-b border-white/20 pb-3">Flow</h3>
          <div className="space-y-4">
            <label className="block space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Velocity</span>
                <span className="text-white/80">{(state.flowParameters?.velocity ?? 1.0).toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={state.flowParameters?.velocity ?? 1.0}
                onChange={(e) => handleParamChange('flowParameters', {
                  ...(state.flowParameters ?? {
                    velocity: 1.0,
                    turbulence: 0.5,
                    direction: { x: 0, y: 0, z: 0 },
                    scale: 1.0
                  }),
                  velocity: Number(e.target.value)
                })}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </label>
            <label className="block space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Turbulence</span>
                <span className="text-white/80">{(state.flowParameters?.turbulence ?? 0.5).toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={state.flowParameters?.turbulence ?? 0.5}
                onChange={(e) => handleParamChange('flowParameters', {
                  ...(state.flowParameters ?? {
                    velocity: 1.0,
                    turbulence: 0.5,
                    direction: { x: 0, y: 0, z: 0 },
                    scale: 1.0
                  }),
                  turbulence: Number(e.target.value)
                })}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </label>
            <label className="block space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Scale</span>
                <span className="text-white/80">{(state.flowParameters?.scale ?? 1.0).toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={state.flowParameters?.scale ?? 1.0}
                onChange={(e) => handleParamChange('flowParameters', {
                  ...(state.flowParameters ?? {
                    velocity: 1.0,
                    turbulence: 0.5,
                    direction: { x: 0, y: 0, z: 0 },
                    scale: 1.0
                  }),
                  scale: Number(e.target.value)
                })}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </label>
          </div>
        </section>

        {/* Particle Controls */}
        <section className="space-y-4 bg-white/5 p-4 rounded-lg">
          <h3 className="text-xl font-semibold border-b border-white/20 pb-3">Particles</h3>
          {Object.entries(state.particleConfigs || {
            default: {
              count: 2000,
              size: 0.1,
              speed: 1.0,
              lifetime: 5.0,
              color: '#00ff88'
            }
          }).map(([key, config]) => (
            <div key={key} className="space-y-4 p-4 bg-white/10 rounded-lg">
              <h4 className="font-medium text-lg">{key}</h4>
              <div className="space-y-4">
                <label className="block space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Count</span>
                    <span className="text-white/80">{config.count}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={config.count}
                    onChange={(e) => handleParamChange('particleConfigs', {
                      ...state.particleConfigs,
                      [key]: { ...config, count: Number(e.target.value) }
                    })}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </label>
                <label className="block space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Size</span>
                    <span className="text-white/80">{config.size.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.2"
                    step="0.01"
                    value={config.size}
                    onChange={(e) => handleParamChange('particleConfigs', {
                      ...state.particleConfigs,
                      [key]: { ...config, size: Number(e.target.value) }
                    })}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </label>
                <label className="block space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Speed</span>
                    <span className="text-white/80">{config.speed.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={config.speed}
                    onChange={(e) => handleParamChange('particleConfigs', {
                      ...state.particleConfigs,
                      [key]: { ...config, speed: Number(e.target.value) }
                    })}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </label>
                <label className="block space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Lifetime</span>
                    <span className="text-white/80">{config.lifetime.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={config.lifetime}
                    onChange={(e) => handleParamChange('particleConfigs', {
                      ...state.particleConfigs,
                      [key]: { ...config, lifetime: Number(e.target.value) }
                    })}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="font-medium">Color</span>
                  <input
                    type="color"
                    value={config.color}
                    onChange={(e) => handleParamChange('particleConfigs', {
                      ...state.particleConfigs,
                      [key]: { ...config, color: e.target.value }
                    })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </label>
              </div>
            </div>
          ))}
        </section>

        {/* Color Palette */}
        <section className="space-y-4 bg-white/5 p-4 rounded-lg">
          <h3 className="text-xl font-semibold border-b border-white/20 pb-3">Colors</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(state.colorPalette || {}).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <label className="block">
                  <span className="font-medium capitalize">{key}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => handleParamChange('colorPalette', {
                        ...state.colorPalette,
                        [key]: e.target.value
                      })}
                      className="w-8 h-8 rounded cursor-pointer"
                      style={{ padding: 0 }}
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleParamChange('colorPalette', {
                        ...state.colorPalette,
                        [key]: e.target.value
                      })}
                      className="flex-1 px-2 py-1 bg-white/10 rounded text-white border border-white/20 focus:border-white/40 focus:outline-none"
                    />
                  </div>
                </label>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
} 