import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CanvasStateManager } from '../../../src/core/CanvasStateManager';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST() {
  try {
    // Initialize a new canvas state
    const stateManager = new CanvasStateManager();
    const state = await stateManager.getCurrentState();

    return NextResponse.json({ 
      success: true, 
      state 
    });

  } catch (error) {
    console.error('Error in init endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also handle GET requests for initialization status
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('canvas_states')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No canvas state exists yet
        return NextResponse.json({ 
          initialized: false 
        });
      }
      throw error;
    }

    return NextResponse.json({ 
      initialized: true,
      state: data
    });

  } catch (error) {
    console.error('Error checking initialization status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 