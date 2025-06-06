import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Types for our database tables
export type Tables = {
  canvas_states: {
    id: string;
    theme_id: string;
    weather_data: any;
    time_of_day: number;
    evolution_step: number;
    color_palette: any;
    flow_parameters: any;
    particle_configs: any;
    metadata: any;
    version: number;
    created_at: string;
    updated_at: string;
  };
  canvas_operations: {
    id: string;
    type: string;
    data: any;
    created_at: string;
  };
  canvas_snapshots: {
    id: string;
    state_id: string;
    data: any;
    created_at: string;
  };
  collaboration_sessions: {
    id: string;
    state_id: string;
    participants: string[];
    created_at: string;
    updated_at: string;
  };
}; 