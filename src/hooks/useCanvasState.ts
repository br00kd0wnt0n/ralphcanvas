import { useState, useEffect } from 'react';

export interface CanvasState {
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  weather: 'clear' | 'cloudy' | 'rain' | 'storm' | 'fog';
  lastModified: Date;
}

const DEFAULT_STATE: CanvasState = {
  timeOfDay: 'day',
  weather: 'clear',
  lastModified: new Date()
};

export function useCanvasState() {
  const [state, setState] = useState<CanvasState>(DEFAULT_STATE);

  // Update time of day based on actual time
  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      let timeOfDay: CanvasState['timeOfDay'];
      
      if (hour >= 5 && hour < 8) timeOfDay = 'dawn';
      else if (hour >= 8 && hour < 17) timeOfDay = 'day';
      else if (hour >= 17 && hour < 20) timeOfDay = 'dusk';
      else timeOfDay = 'night';

      setState(prev => ({
        ...prev,
        timeOfDay,
        lastModified: new Date()
      }));
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Simulate weather changes (in a real app, this would come from an API)
  useEffect(() => {
    const weatherTypes: CanvasState['weather'][] = ['clear', 'cloudy', 'rain', 'storm', 'fog'];
    const weatherInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance of weather change
        const newWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        setState(prev => ({
          ...prev,
          weather: newWeather,
          lastModified: new Date()
        }));
      }
    }, 300000); // Check for weather changes every 5 minutes

    return () => clearInterval(weatherInterval);
  }, []);

  return { state, setState };
} 