export enum OperationType {
  UPDATE_WEATHER = 'UPDATE_WEATHER',
  UPDATE_FLOW = 'UPDATE_FLOW',
  UPDATE_PARTICLES = 'UPDATE_PARTICLES',
  UPDATE_COLORS = 'UPDATE_COLORS',
  UPDATE_TIME = 'UPDATE_TIME'
}

export interface CanvasElement {
  id: string;
  type: string;
  properties: Record<string, any>;
  createdAt: Date;
  modifiedAt: Date;
}

export interface CanvasOperation {
  type: OperationType;
  data: Partial<WeatherData | FlowParameters | Record<string, ParticleConfig> | ColorPalette | { timeOfDay: number }>;
  timestamp: Date;
}

export interface CanvasMetadata {
  name: string;
  createdBy: string;
  createdAt: Date;
  lastModifiedBy: string;
}

export interface WeatherData {
  location?: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  cloudCover: number;
  condition?: string;
  timestamp?: Date;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface FlowParameters {
  velocity: number;
  turbulence: number;
  direction: {
    x: number;
    y: number;
    z: number;
  };
  scale: number;
}

export interface ParticleConfig {
  count: number;
  size: number;
  speed: number;
  lifetime: number;
  color: string;
}

export interface CanvasState {
  id: string;
  themeId: string;
  weatherData: WeatherData;
  timeOfDay: number; // 0-24 representing hour of day
  evolutionStep: number;
  colorPalette: ColorPalette;
  flowParameters: FlowParameters;
  particleConfigs: Record<string, ParticleConfig>;
  lastUpdated: Date;
  version: number;
  metadata: {
    name: string;
    createdBy: string;
    createdAt: Date;
    lastModifiedBy: string;
  };
}

export interface CanvasSnapshot {
  id: string;
  state: CanvasState;
  createdAt: Date;
  createdBy: string;
}

export interface CanvasCollaborationSession {
  id: string;
  canvasId: string;
  userId: string;
  joinedAt: Date;
  lastActive: Date;
  cursor?: {
    x: number;
    y: number;
    userId: string;
  };
} 