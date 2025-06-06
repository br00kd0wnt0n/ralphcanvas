import { Color, Vector3 } from 'three';

export const RALPH_COLORS = {
  primary: new Color('#00ff88'),
  secondary: new Color('#4169e1'),
  accent: new Color('#ffa500'),
  highlight: new Color('#ff1493'),
  tertiary: new Color('#9370db'),
};

export class ColorManager {
  private static instance: ColorManager;
  private currentTime: number = 0;
  private colorCycle: Color[] = Object.values(RALPH_COLORS);
  private currentColorIndex: number = 0;

  private constructor() {}

  static getInstance(): ColorManager {
    if (!ColorManager.instance) {
      ColorManager.instance = new ColorManager();
    }
    return ColorManager.instance;
  }

  update(deltaTime: number) {
    this.currentTime += deltaTime;
    if (this.currentTime >= 5) { // Change color every 5 seconds
      this.currentTime = 0;
      this.currentColorIndex = (this.currentColorIndex + 1) % this.colorCycle.length;
    }
  }

  getCurrentColor(): Color {
    return this.colorCycle[this.currentColorIndex];
  }

  getInterpolatedColor(position: Vector3, time: number): Color {
    const baseColor = this.getCurrentColor();
    const nextColor = this.colorCycle[(this.currentColorIndex + 1) % this.colorCycle.length];
    
    // Create a smooth transition between colors based on position and time
    const t = (Math.sin(time * 0.5 + position.x * 0.1 + position.y * 0.1) + 1) * 0.5;
    return baseColor.clone().lerp(nextColor, t);
  }

  getAmbientLightIntensity(time: number): number {
    return 0.5 + Math.sin(time * 0.2) * 0.2; // Subtle pulsing ambient light
  }

  getPointLightIntensity(time: number): number {
    return 1 + Math.sin(time * 0.3) * 0.3; // More pronounced point light variation
  }
} 