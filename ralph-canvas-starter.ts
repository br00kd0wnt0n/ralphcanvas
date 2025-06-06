// Core Canvas State Management
// src/lib/visual-engine/canvas-state.ts

import { CanvasState, ThemeInput, WeatherData, Color } from '@/types/canvas';
import { createClient } from '@supabase/supabase-js';

export class CanvasStateManager {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  async getCurrentState(): Promise<CanvasState> {
    const { data, error } = await this.supabase
      .from('canvas_states')
      .select(`
        *,
        themes (*)
      `)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return this.mapToCanvasState(data);
  }

  async evolveState(currentState: CanvasState): Promise<CanvasState> {
    const now = new Date();
    const timeOfDay = now.getHours() + now.getMinutes() / 60;
    const evolutionStep = now.getHours() * 60 + now.getMinutes();

    // Get fresh weather data
    const weatherData = await this.getWeatherData();

    // Calculate evolution parameters
    const evolvedParams = this.calculateEvolution(
      currentState,
      timeOfDay,
      evolutionStep,
      weatherData
    );

    const newState: CanvasState = {
      ...currentState,
      timeOfDay,
      evolutionStep,
      weatherData,
      flowParameters: evolvedParams.flow,
      particleConfigs: evolvedParams.particles,
      colorPalette: evolvedParams.colors,
      lastUpdated: now,
      version: this.generateVersion()
    };

    // Save to database
    await this.saveState(newState);
    return newState;
  }

  private calculateEvolution(
    currentState: CanvasState,
    timeOfDay: number,
    evolutionStep: number,
    weather: WeatherData
  ) {
    // Time-based evolution (0-24 hours)
    const timeProgress = timeOfDay / 24;
    
    // Weather influence
    const weatherIntensity = this.calculateWeatherIntensity(weather);
    
    // Daily evolution phases
    const phase = this.getEvolutionPhase(timeOfDay);
    
    return {
      flow: this.evolveFlowParameters(currentState.flowParameters, phase, weatherIntensity),
      particles: this.evolveParticleConfigs(currentState.particleConfigs, phase, timeProgress),
      colors: this.evolveColorPalette(currentState.colorPalette, timeOfDay, weather)
    };
  }

  private getEvolutionPhase(timeOfDay: number): 'genesis' | 'growth' | 'flourishing' | 'reflection' {
    if (timeOfDay >= 6 && timeOfDay < 12) return 'genesis';
    if (timeOfDay >= 12 && timeOfDay < 18) return 'growth';
    if (timeOfDay >= 18 && timeOfDay < 24) return 'flourishing';
    return 'reflection';
  }

  private evolveFlowParameters(current: any, phase: string, weatherIntensity: number) {
    const baseIntensity = {
      genesis: 0.3,
      growth: 0.6,
      flourishing: 0.9,
      reflection: 0.4
    }[phase];

    return {
      ...current,
      intensity: baseIntensity * (0.8 + weatherIntensity * 0.4),
      turbulence: Math.min(1, current.turbulence + (weatherIntensity - 0.5) * 0.1),
      flowSpeed: baseIntensity * 0.5
    };
  }

  private evolveColorPalette(current: any, timeOfDay: number, weather: WeatherData) {
    // Time-based color temperature
    const warmth = this.calculateColorWarmth(timeOfDay);
    
    // Weather-based adjustments
    const weatherAdjustment = this.getWeatherColorAdjustment(weather);
    
    return {
      ...current,
      temperature: warmth,
      saturation: Math.max(0.4, current.saturation + weatherAdjustment.saturation),
      brightness: Math.max(0.3, current.brightness + weatherAdjustment.brightness)
    };
  }

  private calculateColorWarmth(timeOfDay: number): number {
    // Sunrise/sunset = warm, midday = neutral, night = cool
    const hour = timeOfDay;
    if (hour < 6 || hour > 20) return 0.3; // Cool nights
    if (hour < 10 || hour > 16) return 0.8; // Warm morning/evening
    return 0.5; // Neutral midday
  }

  private getWeatherColorAdjustment(weather: WeatherData) {
    const adjustments = {
      'clear': { saturation: 0.1, brightness: 0.1 },
      'cloudy': { saturation: -0.1, brightness: -0.05 },
      'rain': { saturation: -0.2, brightness: -0.1 },
      'storm': { saturation: 0.2, brightness: -0.2 },
      'snow': { saturation: -0.3, brightness: 0.1 }
    };

    return adjustments[weather.condition as keyof typeof adjustments] || 
           { saturation: 0, brightness: 0 };
  }

  private calculateWeatherIntensity(weather: WeatherData): number {
    // Combine multiple weather factors into single intensity score
    const tempFactor = Math.abs(weather.temperature - 20) / 30; // Deviation from 20°C
    const windFactor = weather.windSpeed / 50; // Wind speed influence
    const cloudFactor = weather.cloudCover / 100; // Cloud coverage
    
    return Math.min(1, (tempFactor + windFactor + cloudFactor) / 3);
  }

  private async getWeatherData(): Promise<WeatherData> {
    // Check cache first
    const cached = await this.getCachedWeather();
    if (cached && !this.isWeatherExpired(cached)) {
      return cached;
    }

    // Fetch fresh data
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Tokyo&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );
    
    const data = await response.json();
    
    const weatherData: WeatherData = {
      location: 'Tokyo',
      temperature: data.main.temp,
      condition: data.weather[0].main.toLowerCase(),
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      cloudCover: data.clouds.all,
      timestamp: new Date()
    };

    // Cache the result
    await this.cacheWeather(weatherData);
    
    return weatherData;
  }

  private generateVersion(): string {
    return `v${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private mapToCanvasState(dbData: any): CanvasState {
    return {
      id: dbData.id,
      themeId: dbData.theme_id,
      weatherData: dbData.weather_data,
      timeOfDay: dbData.time_of_day,
      evolutionStep: dbData.evolution_step,
      colorPalette: dbData.color_palette,
      flowParameters: dbData.flow_parameters,
      particleConfigs: dbData.particle_configs,
      lastUpdated: new Date(dbData.created_at),
      version: dbData.version
    };
  }

  private async saveState(state: CanvasState): Promise<void> {
    const { error } = await this.supabase
      .from('canvas_states')
      .insert({
        theme_id: state.themeId,
        weather_data: state.weatherData,
        time_of_day: state.timeOfDay,
        evolution_step: state.evolutionStep,
        color_palette: state.colorPalette,
        flow_parameters: state.flowParameters,
        particle_configs: state.particleConfigs,
        version: state.version
      });

    if (error) throw error;
  }

  private async getCachedWeather(): Promise<WeatherData | null> {
    const { data } = await this.supabase
      .from('weather_cache')
      .select('*')
      .eq('location', 'Tokyo')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single();

    return data?.weather_data || null;
  }

  private async cacheWeather(weather: WeatherData): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minute cache

    await this.supabase
      .from('weather_cache')
      .insert({
        location: weather.location,
        weather_data: weather,
        expires_at: expiresAt.toISOString()
      });
  }

  private isWeatherExpired(weather: WeatherData): boolean {
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
    return new Date(weather.timestamp) < thirtyMinutesAgo;
  }
}

// Theme Processing with AI
// src/lib/visual-engine/theme-processor.ts

import OpenAI from 'openai';
import { ThemeInput, StyleParameters, Color } from '@/types/canvas';

export class ThemeProcessor {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  async processTheme(textPrompt: string, referenceImageUrl?: string): Promise<StyleParameters> {
    const analysis = await this.analyzeThemeWithAI(textPrompt, referenceImageUrl);
    return this.convertToStyleParameters(analysis);
  }

  async extractColorsFromImage(imageUrl: string): Promise<Color[]> {
    const analysis = await this.openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the 5 most prominent colors from this image. Return them as hex codes with descriptive names."
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    return this.parseColorsFromResponse(analysis.choices[0].message.content || '');
  }

  private async analyzeThemeWithAI(textPrompt: string, imageUrl?: string): Promise<any> {
    const messages: any[] = [
      {
        role: "system",
        content: `You are a visual design AI that converts creative prompts into specific visual parameters for abstract art generation. 

Analyze the input and return a JSON object with these parameters (all values 0-1):
{
  "complexity": 0.7, // How intricate the composition should be
  "flowIntensity": 0.6, // How dynamic the flowing elements are
  "particleDensity": 0.5, // How many small details/particles
  "colorHarmony": "complementary", // monochromatic/complementary/triadic/tetradic
  "movementStyle": "dynamic", // gentle/dynamic/chaotic
  "visualWeight": "medium", // light/medium/heavy
  "mood": "energetic", // calm/energetic/mysterious/playful
  "dominantColors": ["#ff1493", "#00ff88", "#4169e1"]
}`
      },
      {
        role: "user",
        content: `Theme: ${textPrompt}`
      }
    ];

    if (imageUrl) {
      messages[1].content = [
        { type: "text", text: `Theme: ${textPrompt}` },
        { type: "image_url", image_url: { url: imageUrl } }
      ];
    }

    const response = await this.openai.chat.completions.create({
      model: imageUrl ? "gpt-4-vision-preview" : "gpt-4-turbo-preview",
      messages,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  private convertToStyleParameters(aiAnalysis: any): StyleParameters {
    return {
      complexity: aiAnalysis.complexity || 0.5,
      flowIntensity: aiAnalysis.flowIntensity || 0.5,
      particleDensity: aiAnalysis.particleDensity || 0.5,
      colorHarmony: aiAnalysis.colorHarmony || 'complementary',
      movementStyle: aiAnalysis.movementStyle || 'dynamic',
      visualWeight: aiAnalysis.visualWeight || 'medium'
    };
  }

  private parseColorsFromResponse(response: string): Color[] {
    // Parse the AI response to extract color information
    // This would need more sophisticated parsing based on the actual response format
    const defaultColors: Color[] = [
      { hex: '#00ff88', rgb: [0, 255, 136], hsl: [152, 100, 50], name: 'Electric Green' },
      { hex: '#4169e1', rgb: [65, 105, 225], hsl: [225, 73, 57], name: 'Royal Blue' },
      { hex: '#ffa500', rgb: [255, 165, 0], hsl: [39, 100, 50], name: 'Orange' },
      { hex: '#ff1493', rgb: [255, 20, 147], hsl: [328, 100, 54], name: 'Deep Pink' },
      { hex: '#9370db', rgb: [147, 112, 219], hsl: [260, 60, 65], name: 'Medium Purple' }
    ];

    return defaultColors; // Simplified for now
  }
}

// Recipe Display Component
// src/components/UI/RecipeDisplay.tsx

import React from 'react';
import { CanvasState, ThemeInput } from '@/types/canvas';

interface RecipeDisplayProps {
  canvasState: CanvasState;
  currentTheme: ThemeInput;
}

export const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ 
  canvasState, 
  currentTheme 
}) => {
  const formatRecipe = () => {
    const timePhase = getPhaseFromTime(canvasState.timeOfDay);
    const weatherDesc = formatWeatherDescription(canvasState.weatherData);
    
    return `**Welcome to our world** — this ${timePhase} brought to you by ${currentTheme.title} and ${weatherDesc}`;
  };

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md">
      <div className="bg-black/60 backdrop-blur-lg border border-white/10 rounded-lg p-4">
        <p className="text-white/90 text-sm leading-relaxed">
          {formatRecipe()}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white/60 text-xs">
            Live canvas • Updated {formatTimeAgo(canvasState.lastUpdated)}
          </span>
        </div>
      </div>
    </div>
  );
};

function getPhaseFromTime(timeOfDay: number): string {
  if (timeOfDay >= 6 && timeOfDay < 12) return 'morning';
  if (timeOfDay >= 12 && timeOfDay < 18) return 'afternoon';
  if (timeOfDay >= 18 && timeOfDay < 24) return 'evening';
  return 'night';
}

function formatWeatherDescription(weather: any): string {
  return `${weather.condition} weather from ${weather.location}`;
}

function formatTimeAgo(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}