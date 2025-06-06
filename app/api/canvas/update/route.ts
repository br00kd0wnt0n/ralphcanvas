import { NextRequest, NextResponse } from 'next/server';
import { CanvasStateManager } from '../../../../src/core/CanvasStateManager';
import { CanvasOperation, OperationType } from '../../../../src/types/canvas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, value } = body;

    if (!section || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: section and value' },
        { status: 400 }
      );
    }

    const stateManager = new CanvasStateManager();
    const currentState = await stateManager.getCurrentState();

    // Create appropriate operation type based on the section being updated
    let operationType: OperationType;
    switch (section) {
      case 'weatherData':
        operationType = OperationType.UPDATE_WEATHER;
        break;
      case 'flowParameters':
        operationType = OperationType.UPDATE_FLOW;
        break;
      case 'particleConfigs':
        operationType = OperationType.UPDATE_PARTICLES;
        break;
      case 'colorPalette':
        operationType = OperationType.UPDATE_COLORS;
        break;
      case 'timeOfDay':
        operationType = OperationType.UPDATE_TIME;
        break;
      case 'themeId':
        // For theme updates, we'll use UPDATE_COLORS since it's the closest match
        operationType = OperationType.UPDATE_COLORS;
        break;
      default:
        return NextResponse.json(
          { error: `Invalid section: ${section}` },
          { status: 400 }
        );
    }

    const operation: CanvasOperation = {
      type: operationType,
      data: value,
      timestamp: new Date()
    };

    const newState = await stateManager.evolveState(operation);
    return NextResponse.json(newState);
  } catch (error) {
    console.error('Error updating canvas state:', error);
    return NextResponse.json(
      { error: 'Failed to update canvas state' },
      { status: 500 }
    );
  }
} 