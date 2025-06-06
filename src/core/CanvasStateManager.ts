import { CanvasState, CanvasOperation, WeatherData, ColorPalette, FlowParameters, ParticleConfig } from '../types/canvas';
import { supabase } from '../lib/supabase';
import { getFallbackWeather, shouldUseFallbacks } from '../lib/api/fallbacks';

const DEFAULT_WEATHER: WeatherData = {
  temperature: 20,
  humidity: 50,
  windSpeed: 5,
  precipitation: 0,
  cloudCover: 30
};

const DEFAULT_COLORS: ColorPalette = {
  primary: '#ff0000',
  secondary: '#00ff00',
  accent: '#0000ff',
  background: '#000000',
  text: '#ffffff'
};

const DEFAULT_FLOW: FlowParameters = {
  velocity: 1.0,
  turbulence: 0.5,
  direction: { x: 1, y: 0, z: 0 },
  scale: 1.0
};

const DEFAULT_PARTICLES: Record<string, ParticleConfig> = {
  default: {
    count: 1000,
    size: 0.05,
    speed: 1.0,
    lifetime: 5.0,
    color: '#ffffff'
  }
};

export class CanvasStateManager {
  async getCurrentState(): Promise<CanvasState> {
    const { data, error } = await supabase
      .from('canvas_states')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return this.createInitialState();
      }
      throw error;
    }

    return this.mapToCanvasState(data);
  }

  async evolveState(operation: CanvasOperation): Promise<CanvasState> {
    console.log('Evolving state with operation:', operation);
    const currentState = await this.getCurrentState();
    console.log('Current state:', currentState);
    const now = new Date();
    
    // Create new state
    const newState: CanvasState = {
      ...currentState,
      evolutionStep: currentState.evolutionStep + 1,
      version: currentState.version + 1,
      lastUpdated: now,
      metadata: {
        ...currentState.metadata,
        lastModifiedBy: 'system'
      }
    };

    // Apply operation-specific changes
    switch (operation.type) {
      case 'UPDATE_WEATHER':
        newState.weatherData = { ...newState.weatherData, ...operation.data as WeatherData };
        break;
      case 'UPDATE_FLOW':
        newState.flowParameters = { ...newState.flowParameters, ...operation.data as FlowParameters };
        break;
      case 'UPDATE_PARTICLES':
        newState.particleConfigs = { ...newState.particleConfigs, ...operation.data as Record<string, ParticleConfig> };
        break;
      case 'UPDATE_COLORS':
        newState.colorPalette = { ...newState.colorPalette, ...operation.data as ColorPalette };
        break;
      case 'UPDATE_TIME':
        if ('timeOfDay' in operation.data) {
          newState.timeOfDay = operation.data.timeOfDay as number;
        }
        break;
    }

    console.log('New state to be saved:', newState);

    // Save to database - handle nullable fields
    const { data, error } = await supabase
      .from('canvas_states')
      .insert({
        id: crypto.randomUUID(),
        canvas_id: currentState.id || null, // Allow null if no current state id
        state: newState,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        version: newState.version,
        created_by: 'system', // We can still set this when we know it
        metadata: {
          name: 'Canvas Update',
          createdBy: 'system',
          createdAt: now,
          lastModifiedBy: 'system'
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Database error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    return this.mapToCanvasState(data);
  }

  private async createInitialState(): Promise<CanvasState> {
    const now = new Date();
    const initialState: CanvasState = {
      id: crypto.randomUUID(),
      themeId: 'default',
      weatherData: DEFAULT_WEATHER,
      timeOfDay: now.getHours() + now.getMinutes() / 60,
      evolutionStep: 0,
      colorPalette: DEFAULT_COLORS,
      flowParameters: DEFAULT_FLOW,
      particleConfigs: DEFAULT_PARTICLES,
      metadata: {
        name: 'Initial State',
        createdBy: 'system',
        createdAt: now,
        lastModifiedBy: 'system'
      },
      version: 1,
      lastUpdated: now
    };

    console.log('Creating initial state:', initialState);

    // Save to database - handle nullable fields
    const { data, error } = await supabase
      .from('canvas_states')
      .insert({
        id: initialState.id,
        canvas_id: null, // Initial state has no parent canvas
        state: initialState,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        version: initialState.version,
        created_by: 'system', // We know this for initial state
        metadata: {
          name: 'Initial State',
          createdBy: 'system',
          createdAt: now,
          lastModifiedBy: 'system'
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Database error creating initial state:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    return this.mapToCanvasState(data);
  }

  private mapToCanvasState(data: any): CanvasState {
    return {
      id: data.id,
      themeId: data.theme_id,
      weatherData: data.weather_data,
      timeOfDay: data.time_of_day,
      evolutionStep: data.evolution_step,
      colorPalette: data.color_palette,
      flowParameters: data.flow_parameters,
      particleConfigs: data.particle_configs,
      metadata: data.metadata,
      version: data.version,
      lastUpdated: new Date(data.created_at)
    };
  }

  private async getWeatherData(): Promise<WeatherData> {
    // Check if we should use fallbacks
    if (shouldUseFallbacks()) {
      return getFallbackWeather();
    }

    // Check cache first
    const cached = await this.getCachedWeather();
    if (cached && !this.isWeatherExpired(cached)) {
      return cached;
    }

    try {
      // Fetch fresh data
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Tokyo&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        console.warn('Weather API request failed, using fallback data');
        return getFallbackWeather();
      }
      
      const data = await response.json();
      
      const weatherData: WeatherData = {
        location: 'Tokyo',
        temperature: data.main.temp,
        condition: data.weather[0].main.toLowerCase(),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        cloudCover: data.clouds.all,
        precipitation: data.rain?.['1h'] || 0,
        timestamp: new Date()
      };

      // Cache the result
      await this.cacheWeather(weatherData);
      
      return weatherData;
    } catch (error) {
      console.warn('Error fetching weather data, using fallback:', error);
      return getFallbackWeather();
    }
  }

  private async getCachedWeather(): Promise<WeatherData | null> {
    try {
      const { data } = await supabase
        .from('weather_cache')
        .select('*')
        .eq('location', 'Tokyo')
        .order('fetched_at', { ascending: false })
        .limit(1)
        .single();

      return data?.weather_data || null;
    } catch (error) {
      console.warn('Error fetching cached weather:', error);
      return null;
    }
  }

  private async cacheWeather(weather: WeatherData): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minute cache

      await supabase
        .from('weather_cache')
        .insert({
          location: weather.location || 'Tokyo',
          weather_data: weather,
          expires_at: expiresAt.toISOString()
        });
    } catch (error) {
      console.warn('Error caching weather data:', error);
    }
  }

  private isWeatherExpired(weather: WeatherData): boolean {
    if (!weather.timestamp) return true;
    
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
    return new Date(weather.timestamp) < thirtyMinutesAgo;
  }
} 