import { Color } from 'three';

export const RALPH_COLORS = {
  primary: '#00ff88',
  secondary: '#4169e1',
  accent1: '#ffa500',
  accent2: '#ff1493',
  accent3: '#9370db',
} as const;

export class ColorManager {
  private colors: { [key: string]: Color };
  private time: number;

  constructor() {
    this.colors = {
      primary: new Color(RALPH_COLORS.primary),
      secondary: new Color(RALPH_COLORS.secondary),
      accent1: new Color(RALPH_COLORS.accent1),
      accent2: new Color(RALPH_COLORS.accent2),
      accent3: new Color(RALPH_COLORS.accent3),
    };
    this.time = 0;
  }

  update(deltaTime: number) {
    this.time += deltaTime;
  }

  getColor(name: keyof typeof RALPH_COLORS, intensity: number = 1): Color {
    const baseColor = this.colors[name].clone();
    const timeOffset = this.time * 0.5;
    
    // Add subtle pulsing effect
    const pulse = Math.sin(timeOffset) * 0.1 + 0.9;
    baseColor.multiplyScalar(pulse * intensity);
    
    return baseColor;
  }

  getGradient(startColor: keyof typeof RALPH_COLORS, endColor: keyof typeof RALPH_COLORS, t: number): Color {
    const start = this.colors[startColor];
    const end = this.colors[endColor];
    return start.clone().lerp(end, t);
  }

  getAmbientLight(): Color {
    return this.getColor('primary', 0.2);
  }

  getDirectionalLight(): Color {
    return this.getColor('secondary', 0.8);
  }
} 