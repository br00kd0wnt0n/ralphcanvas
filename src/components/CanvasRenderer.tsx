import { useEffect, useState } from 'react';
import { VisualEngine } from './visual/VisualEngine';
import { CanvasState } from '../types/canvas';

export function CanvasRenderer() {
  console.log('CanvasRenderer component mounting...');

  const [state, setState] = useState<CanvasState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const response = await fetch('/api/canvas/current');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setState(data);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch canvas state');
        console.error('Error fetching canvas state:', e);
      }
    };

    // Initial fetch
    fetchState();

    // Set up polling
    const interval = setInterval(fetchState, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log('CanvasRenderer component mounted and initialized');
  }, []);

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Canvas</h2>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <VisualEngine />
      {state && (
        <div className="absolute bottom-4 left-4 text-white text-sm opacity-50">
          <p>Canvas ID: {state.id}</p>
          <p>Version: {state.version}</p>
          <p>Time: {new Date(state.lastUpdated).toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
} 