import { useEffect, useState, useMemo, memo, useCallback } from 'react';
import { Canvas } from './Canvas';
import { CanvasState } from '../types/canvas';
import { AdminPanel } from './admin/AdminPanel';

// Memoize the Canvas component to prevent unnecessary re-renders
const MemoizedCanvas = memo(Canvas);

// Helper function for safe date formatting
const formatTime = (timestamp: string | Date | null): string => {
  try {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString();
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid time';
  }
};

// Separate container component to manage state
function CanvasContainer({ state, onStateChange }: { state: CanvasState, onStateChange: (newState: Partial<CanvasState>) => Promise<void> }) {
  return (
    <div className="relative w-screen h-screen">
      <MemoizedCanvas state={state} />
      <AdminPanel initialState={state} onStateChange={onStateChange} />
      <div className="absolute bottom-4 left-4 text-white text-sm opacity-50">
        <p>Canvas ID: {state.id}</p>
        <p>Version: {state.version}</p>
        <p>Time: {formatTime(state.lastUpdated)}</p>
      </div>
    </div>
  );
}

export function CanvasRenderer() {
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  const [isStable, setIsStable] = useState(false);
  const [state, setState] = useState<CanvasState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Memoize the state change handler
  const handleStateChange = useCallback(async (newState: Partial<CanvasState>) => {
    if (!state) return; // Guard against null state

    try {
      // TEMPORARY: Mock successful update to prevent database errors
      const mockResponse: CanvasState = {
        ...state,
        ...newState,
        id: state.id, // Ensure id is always set
        lastUpdated: new Date(), // Use Date object
        version: state.version + 1,
        metadata: {
          ...state.metadata,
          lastModifiedBy: 'system'
        }
      };
      setState(mockResponse);
      return;

      // TODO: Re-enable actual API call once stability is confirmed
      /*
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
      */
    } catch (e) {
      console.error('Error updating canvas state:', e);
      setError(e instanceof Error ? e.message : 'Failed to update canvas state');
    }
  }, [state]);

  // Memoize the container to prevent unnecessary re-renders
  const container = useMemo(() => {
    if (!state) return null;
    return <CanvasContainer state={state} onStateChange={handleStateChange} />;
  }, [state, handleStateChange]);

  // Initial fetch only once on mount - NO polling
  useEffect(() => {
    let isMounted = true; // Track component mount state

    const fetchState = async () => {
      try {
        const response = await fetch('/api/canvas/current');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          setState(data);
          setError(null);
        }
      } catch (e) {
        if (isMounted) {
          setError(e instanceof Error ? e.message : 'Failed to fetch canvas state');
          console.error('Error fetching canvas state:', e);
        }
      }
    };

    console.log('CanvasRenderer mounted - should only see this ONCE');
    fetchState();
    setIsStable(true);

    // Cleanup function to prevent state updates after unmount
    return () => {
      console.log('CanvasRenderer unmounting - this should NOT happen');
      isMounted = false;
    };
  }, []);

  // CONDITIONAL RETURNS ONLY AFTER ALL HOOKS
  if (!isStable) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Initializing Canvas...</h2>
          <p className="text-blue-400">Setting up WebGL context...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Canvas</h2>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  // Main render
  return container;
} 