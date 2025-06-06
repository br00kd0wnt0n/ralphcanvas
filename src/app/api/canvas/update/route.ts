import { NextResponse } from 'next/server';
import { supabase } from '@/database/supabase';
import { CanvasState } from '@/types/canvas';

export async function POST(request: Request) {
  console.log('=== CANVAS UPDATE REQUEST ===');
  try {
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    const { section, value } = body;

    // Get current state
    console.log('Fetching current state...');
    const { data: currentData, error: fetchError } = await supabase
      .from('canvas_states')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError) {
      console.error('Error fetching current state:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch current state' },
        { status: 500 }
      );
    }

    if (!currentData) {
      console.log('No current state found');
      return NextResponse.json(
        { error: 'No canvas state found' },
        { status: 404 }
      );
    }

    console.log('Current state:', JSON.stringify(currentData, null, 2));

    // Update the state
    const currentState = currentData.state as CanvasState;
    const updatedState = {
      ...currentState,
      [section]: value,
      lastUpdated: new Date(),
      version: currentState.version + 1,
      metadata: {
        ...currentState.metadata,
        lastModifiedBy: 'system'
      }
    };

    console.log('Updated state to save:', JSON.stringify(updatedState, null, 2));

    // Insert new state with required fields
    const { data: newState, error: insertError } = await supabase
      .from('canvas_states')
      .insert([{
        id: crypto.randomUUID(),
        canvas_id: currentState.id, // Ensure canvas_id is set
        state: updatedState,
        created_at: new Date().toISOString(),
        version: updatedState.version,
        created_by: 'system', // Add required created_by field
        metadata: {
          name: 'Canvas Update',
          createdBy: 'system',
          createdAt: new Date(),
          lastModifiedBy: 'system'
        }
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Database error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    console.log('Successfully saved new state:', JSON.stringify(newState, null, 2));
    return NextResponse.json(newState.state);
  } catch (error) {
    console.error('Error in canvas update endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 