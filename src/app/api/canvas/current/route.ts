import { NextResponse } from 'next/server';
import { supabase } from '@/database/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('canvas_states')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching canvas state:', error);
      return NextResponse.json(
        { error: 'Failed to fetch canvas state' },
        { status: 500 }
      );
    }

    if (!data) {
      // If no state exists, create a default one
      const defaultState = {
        id: crypto.randomUUID(),
        themeId: 'default',
        weatherData: {
          temperature: 20,
          humidity: 50,
          windSpeed: 10,
          precipitation: 0,
          cloudCover: 30
        },
        timeOfDay: 12,
        evolutionStep: 0,
        colorPalette: {
          primary: '#00ff88',
          secondary: '#4169e1',
          accent: '#ffa500',
          background: '#000000',
          text: '#ffffff'
        },
        flowParameters: {
          velocity: 1.0,
          turbulence: 0.5,
          direction: { x: 0, y: 0, z: 0 },
          scale: 1.0
        },
        particleConfigs: {
          default: {
            count: 2000,
            size: 0.1,
            speed: 1.0,
            lifetime: 5.0,
            color: '#00ff88'
          }
        },
        lastUpdated: new Date(),
        version: 1,
        metadata: {
          name: 'Default Canvas',
          createdBy: 'system',
          createdAt: new Date(),
          lastModifiedBy: 'system'
        }
      };

      const { data: newState, error: insertError } = await supabase
        .from('canvas_states')
        .insert([{
          id: defaultState.id,
          state: defaultState,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating default canvas state:', insertError);
        return NextResponse.json(
          { error: 'Failed to create default canvas state' },
          { status: 500 }
        );
      }

      // Ensure we're returning the state object directly
      return NextResponse.json(newState.state || defaultState);
    }

    // Ensure we're returning the state object directly and handle potential undefined
    const state = data.state || {
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
      lastUpdated: new Date(data.updated_at)
    };

    return NextResponse.json(state);
  } catch (error) {
    console.error('Error in canvas state endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 