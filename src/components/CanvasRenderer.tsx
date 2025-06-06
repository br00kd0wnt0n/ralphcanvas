import { useEffect, useState } from 'react';
import { VisualEngine } from './visual/VisualEngine';
import { CanvasState } from '../types/canvas';

export function CanvasRenderer() {
  const [canvasState, setCanvasState] = useState<CanvasState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCanvasState = async () => {
      try {
        const response = await fetch('/api/canvas/current');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCanvasState(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch canvas state');
        console.error('Error fetching canvas state:', err);
      }
    };

    // Initial fetch
    fetchCanvasState();

    // Set up polling every minute
    const intervalId = setInterval(fetchCanvasState, 60000);

    // Cleanup
    return () => clearInterval(intervalId);
  }, []);

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Canvas</h1>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black">
      <VisualEngine />
      {canvasState && (
        <div className="absolute bottom-4 left-4 text-white text-sm opacity-50">
          Last updated: {new Date(canvasState.lastModified).toLocaleString()}
        </div>
      )}
    </div>
  );
} 