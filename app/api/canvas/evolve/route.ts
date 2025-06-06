import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const stateManager = new CanvasStateManager();
    const newState = await stateManager.evolveState(body);
    return NextResponse.json(newState);
  } catch (error) {
    console.error('Error evolving canvas state:', error);
    return NextResponse.json(
      { error: 'Failed to evolve canvas state' },
      { status: 500 }
    );
  }
} 