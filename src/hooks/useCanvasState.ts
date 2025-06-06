import { useState, useEffect } from 'react';
import { CanvasState } from '../types/canvas';

export function useCanvasState() {
  const [state, setState] = useState<CanvasState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch only
    fetchState();
  }, []); // Empty dependency array ensures this only runs once

  const updateState = async (newState: Partial<CanvasState>) => {
    try {
      const response = await fetch('/api/canvas/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: Object.keys(newState)[0],
          value: Object.values(newState)[0]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedState = await response.json();
      setState(updatedState);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update canvas state');
      console.error('Error updating canvas state:', e);
    }
  };

  return { state, setState: updateState, error, isLoading };
} 