import { NextResponse } from 'next/server';
import { CanvasStateManager } from '../../../../src/core/CanvasStateManager';

export async function GET() {
  try {
    const stateManager = new CanvasStateManager();
    const state = await stateManager.getCurrentState();
    return NextResponse.json(state);
  } catch (error) {
    console.error('Error getting current canvas state:', error);
    return NextResponse.json(
      { error: 'Failed to get current canvas state' },
      { status: 500 }
    );
  }
} 