import { CanvasState, CanvasOperation, WeatherData, ColorPalette, FlowParameters, ParticleConfig } from '../types/canvas';
import { supabase } from '../lib/supabase';

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
  main: {
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
    const currentState = await this.getCurrentState();
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

    // Save to database
    const { data, error } = await supabase
      .from('canvas_states')
      .insert({
        theme_id: newState.themeId,
        weather_data: newState.weatherData,
        time_of_day: newState.timeOfDay,
        evolution_step: newState.evolutionStep,
        color_palette: newState.colorPalette,
        flow_parameters: newState.flowParameters,
        particle_configs: newState.particleConfigs,
        metadata: newState.metadata,
        version: newState.version
      })
      .select()
      .single();

    if (error) throw error;
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

    const { data, error } = await supabase
      .from('canvas_states')
      .insert({
        id: initialState.id,
        theme_id: initialState.themeId,
        weather_data: initialState.weatherData,
        time_of_day: initialState.timeOfDay,
        evolution_step: initialState.evolutionStep,
        color_palette: initialState.colorPalette,
        flow_parameters: initialState.flowParameters,
        particle_configs: initialState.particleConfigs,
        metadata: initialState.metadata,
        version: initialState.version
      })
      .select()
      .single();

    if (error) throw error;
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
} 