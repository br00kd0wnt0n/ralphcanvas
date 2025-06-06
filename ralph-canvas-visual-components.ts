// Main Visual Engine Component
// src/components/Canvas/VisualEngine.tsx

import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CanvasState } from '@/types/canvas';
import { FlowField } from './FlowField';
import { ParticleSystem } from './ParticleSystem';
import { ColorManager } from './ColorManager';

interface VisualEngineProps {
  canvasState: CanvasState;
  className?: string;
}

export const VisualEngine: React.FC<VisualEngineProps> = ({ 
  canvasState, 
  className = '' 
}) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        style={{ background: '#000000' }}
      >
        <CanvasContent canvasState={canvasState} />
      </Canvas>
    </div>
  );
};

const CanvasContent: React.FC<{ canvasState: CanvasState }> = ({ canvasState }) => {
  const { viewport } = useThree();
  
  return (
    <>
      <ambientLight intensity={0.3} />
      <ColorManager canvasState={canvasState} />
      <FlowField 
        canvasState={canvasState}
        viewport={viewport}
      />
      <ParticleSystem 
        canvasState={canvasState}
        viewport={viewport}
      />
    </>
  );
};

// Flow Field Component (Organic Ribbons)
// src/components/Canvas/FlowField.tsx

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CanvasState } from '@/types/canvas';

interface FlowFieldProps {
  canvasState: CanvasState;
  viewport: any;
}

export const FlowField: React.FC<FlowFieldProps> = ({ canvasState, viewport }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const flowData = useMemo(() => {
    return generateFlowField(canvasState, viewport);
  }, [canvasState.flowParameters, canvasState.timeOfDay, viewport]);

  useFrame((state) => {
    if (meshRef.current) {
      // Animate the flow field based on time
      const time = state.clock.elapsedTime;
      const intensity = canvasState.flowParameters?.intensity || 0.5;
      
      meshRef.current.rotation.z = Math.sin(time * 0.1) * intensity * 0.1;
      meshRef.current.position.x = Math.cos(time * 0.05) * intensity * 0.2;
    }
  });

  return (
    <group>
      {flowData.ribbons.map((ribbon, index) => (
        <FlowRibbon
          key={index}
          points={ribbon.points}
          color={ribbon.color}
          width={ribbon.width}
          opacity={ribbon.opacity}
          canvasState={canvasState}
        />
      ))}
    </group>
  );
};

const FlowRibbon: React.FC<{
  points: THREE.Vector3[];
  color: string;
  width: number;
  opacity: number;
  canvasState: CanvasState;
}> = ({ points, color, width, opacity, canvasState }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeometry = new THREE.TubeGeometry(curve, 64, width, 8, false);
    return tubeGeometry;
  }, [points, width]);

  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: opacity,
      side: THREE.DoubleSide
    });
  }, [color, opacity]);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      const phase = getEvolutionPhase(canvasState.timeOfDay);
      const speed = getPhaseSpeed(phase);
      
      meshRef.current.rotation.y = time * speed * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} />
  );
};

function generateFlowField(canvasState: CanvasState, viewport: any) {
  const ribbons = [];
  const { width, height } = viewport;
  const complexity = canvasState.flowParameters?.complexity || 0.5;
  const ribbonCount = Math.floor(3 + complexity * 7); // 3-10 ribbons

  for (let i = 0; i < ribbonCount; i++) {
    const points = generateRibbonPoints(width, height, i, canvasState);
    const color = selectRibbonColor(canvasState.colorPalette, i);
    
    ribbons.push({
      points,
      color,
      width: 0.1 + Math.random() * 0.3,
      opacity: 0.6 + Math.random() * 0.4
    });
  }

  return { ribbons };
}

function generateRibbonPoints(width: number, height: number, index: number, canvasState: CanvasState): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const segments = 20 + Math.floor(Math.random() * 30);
  
  const startX = (Math.random() - 0.5) * width * 2;
  const startY = (Math.random() - 0.5) * height * 2;
  
  // Use weather data to influence flow direction
  const weatherInfluence = canvasState.weatherData?.windSpeed || 0;
  const baseDirection = Math.random() * Math.PI * 2;
  
  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    
    // Create organic flowing curves
    const noiseScale = 0.5;
    const x = startX + Math.cos(baseDirection + t * Math.PI * 2) * width * 0.8 * t +
              Math.sin(t * Math.PI * 6) * noiseScale * (weatherInfluence / 50);
    
    const y = startY + Math.sin(baseDirection + t * Math.PI * 2) * height * 0.6 * t +
              Math.cos(t * Math.PI * 4) * noiseScale * (weatherInfluence / 50);
    
    const z = Math.sin(t * Math.PI * 3) * 2 + (Math.random() - 0.5) * 0.5;
    
    points.push(new THREE.Vector3(x, y, z));
  }
  
  return points;
}

function selectRibbonColor(colorPalette: any, index: number): string {
  const colors = [
    '#00ff88', // Electric Green
    '#4169e1', // Royal Blue
    '#ffa500', // Orange
    '#ff1493', // Deep Pink
    '#9370db'  // Medium Purple
  ];
  
  return colors[index % colors.length];
}

function getEvolutionPhase(timeOfDay: number): 'genesis' | 'growth' | 'flourishing' | 'reflection' {
  if (timeOfDay >= 6 && timeOfDay < 12) return 'genesis';
  if (timeOfDay >= 12 && timeOfDay < 18) return 'growth';
  if (timeOfDay >= 18 && timeOfDay < 24) return 'flourishing';
  return 'reflection';
}

function getPhaseSpeed(phase: string): number {
  const speeds = {
    genesis: 0.3,
    growth: 0.6,
    flourishing: 0.9,
    reflection: 0.4
  };
  return speeds[phase as keyof typeof speeds];
}

// Particle System Component
// src/components/Canvas/ParticleSystem.tsx

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CanvasState } from '@/types/canvas';

interface ParticleSystemProps {
  canvasState: CanvasState;
  viewport: any;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ canvasState, viewport }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const { geometry, material } = useMemo(() => {
    return generateParticleSystem(canvasState, viewport);
  }, [canvasState.particleConfigs, canvasState.colorPalette, viewport]);

  useFrame((state) => {
    if (pointsRef.current) {
      const time = state.clock.elapsedTime;
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const colors = pointsRef.current.geometry.attributes.color.array as Float32Array;
      
      // Animate particles based on time and weather
      for (let i = 0; i < positions.length; i += 3) {
        const particleIndex = i / 3;
        
        // Organic movement based on time and weather
        positions[i] += Math.sin(time * 0.5 + particleIndex * 0.1) * 0.001; // X
        positions[i + 1] += Math.cos(time * 0.3 + particleIndex * 0.05) * 0.001; // Y
        positions[i + 2] += Math.sin(time * 0.2 + particleIndex * 0.02) * 0.001; // Z
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  );
};

function generateParticleSystem(canvasState: CanvasState, viewport: any) {
  const density = canvasState.particleConfigs?.[0]?.density || 0.5;
  const particleCount = Math.floor(1000 + density * 4000); // 1000-5000 particles
  
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  
  const colorOptions = [
    new THREE.Color('#00ff88'),
    new THREE.Color('#4169e1'),
    new THREE.Color('#ffa500'),
    new THREE.Color('#ff1493'),
    new THREE.Color('#9370db')
  ];
  
  for (let i = 0; i < particleCount; i++) {
    // Position particles in organic clusters
    const cluster = Math.floor(Math.random() * 5);
    const clusterX = (cluster - 2) * viewport.width * 0.4;
    const clusterY = (Math.random() - 0.5) * viewport.height * 2;
    
    positions[i * 3] = clusterX + (Math.random() - 0.5) * viewport.width * 0.3;
    positions[i * 3 + 1] = clusterY + (Math.random() - 0.5) * viewport.height * 0.3;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    
    // Assign colors from palette
    const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
    
    // Vary particle sizes
    sizes[i] = Math.random() * 3 + 1;
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  const material = new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });
  
  return { geometry, material };
}

// Color Manager Component
// src/components/Canvas/ColorManager.tsx

import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CanvasState } from '@/types/canvas';

interface ColorManagerProps {
  canvasState: CanvasState;
}

export const ColorManager: React.FC<ColorManagerProps> = ({ canvasState }) => {
  const { scene } = useThree();
  
  useEffect(() => {
    // Update scene lighting based on time of day
    updateSceneLighting(scene, canvasState);
  }, [scene, canvasState.timeOfDay, canvasState.weatherData]);

  return null; // This component doesn't render anything visual directly
};

function updateSceneLighting(scene: THREE.Scene, canvasState: CanvasState) {
  // Remove existing lights
  const lightsToRemove = scene.children.filter(child => child instanceof THREE.Light);
  lightsToRemove.forEach(light => scene.remove(light));
  
  // Add time-based lighting
  const timeOfDay = canvasState.timeOfDay;
  const phase = getEvolutionPhase(timeOfDay);
  
  const lightingConfig = {
    genesis: { ambient: 0.4, directional: 0.6, color: '#ffeb3b' },
    growth: { ambient: 0.6, directional: 0.8, color: '#ffffff' },
    flourishing: { ambient: 0.8, directional: 1.0, color: '#ff9800' },
    reflection: { ambient: 0.3, directional: 0.4, color: '#3f51b5' }
  };
  
  const config = lightingConfig[phase];
  
  // Ambient light
  const ambientLight = new THREE.AmbientLight(config.color, config.ambient);
  scene.add(ambientLight);
  
  // Directional light
  const directionalLight = new THREE.DirectionalLight(config.color, config.directional);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  
  // Weather-based adjustments
  if (canvasState.weatherData?.condition === 'storm') {
    // Add flickering effect for storms
    const flickerLight = new THREE.PointLight('#ffffff', 0.5, 50);
    flickerLight.position.set(0, 10, 0);
    scene.add(flickerLight);
  }
}

// Main Canvas Renderer Component
// src/components/Canvas/CanvasRenderer.tsx

import React, { useState, useEffect } from 'react';
import { VisualEngine } from './VisualEngine';
import { RecipeDisplay } from '../UI/RecipeDisplay';
import { LoadingState } from '../UI/LoadingState';
import { CanvasState, ThemeInput } from '@/types/canvas';
import { useCanvasState } from '@/hooks/useCanvasState';

export const CanvasRenderer: React.FC = () => {
  const { canvasState, currentTheme, isLoading, error } = useCanvasState();

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <h2 className="text-xl mb-2">Canvas Temporarily Unavailable</h2>
          <p className="text-white/60">Please refresh the page to try again.</p>
        </div>
      </div>
    );
  }

  if (!canvasState || !currentTheme) {
    return <LoadingState />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <VisualEngine 
        canvasState={canvasState}
        className="absolute inset-0"
      />
      <RecipeDisplay 
        canvasState={canvasState}
        currentTheme={currentTheme}
      />
    </div>
  );
};

// Loading State Component
// src/components/UI/LoadingState.tsx

import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-white text-xl mb-2">Initializing Canvas</h2>
        <p className="text-white/60">Creating today's unique world...</p>
      </div>
    </div>
  );
};

// Custom Hook for Canvas State
// src/hooks/useCanvasState.ts

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { CanvasState, ThemeInput } from '@/types/canvas';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useCanvasState() {
  const { data: canvasState, error: canvasError, isLoading: canvasLoading } = useSWR<CanvasState>(
    '/api/canvas/current',
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  );

  const { data: currentTheme, error: themeError } = useSWR<ThemeInput>(
    canvasState?.themeId ? `/api/theme/${canvasState.themeId}` : null,
    fetcher,
    {
      revalidateOnFocus: false
    }
  );

  return {
    canvasState,
    currentTheme,
    isLoading: canvasLoading,
    error: canvasError || themeError
  };
}