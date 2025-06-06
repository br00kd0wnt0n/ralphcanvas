import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { CanvasElement, OperationType } from '@/types/canvas';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { element, canvasId = 'default' } = req.body;

    if (!element || !element.id || !element.type) {
      return res.status(400).json({ error: 'Invalid element data' });
    }

    // Create the operation
    const operation = {
      canvas_id: canvasId,
      operation_type: OperationType.ADD,
      element_id: element.id,
      element: element,
      created_by: 'system' // In a real app, this would be the authenticated user
    };

    // Insert the operation
    const { data: operationData, error: operationError } = await supabase
      .from('canvas_operations')
      .insert(operation)
      .select()
      .single();

    if (operationError) {
      console.error('Error saving operation:', operationError);
      return res.status(500).json({ error: 'Failed to save operation' });
    }

    // Get the current state
    const { data: currentState, error: stateError } = await supabase
      .from('canvas_states')
      .select('*')
      .eq('canvas_id', canvasId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (stateError && stateError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching current state:', stateError);
      return res.status(500).json({ error: 'Failed to fetch current state' });
    }

    // Create new state
    const newState = {
      canvas_id: canvasId,
      version: (currentState?.version || 0) + 1,
      state: {
        elements: {
          ...(currentState?.state?.elements || {}),
          [element.id]: element
        },
        version: (currentState?.version || 0) + 1,
        lastModified: new Date().toISOString(),
        metadata: {
          name: currentState?.state?.metadata?.name || 'Untitled Canvas',
          createdBy: currentState?.state?.metadata?.createdBy || 'system',
          createdAt: currentState?.state?.metadata?.createdAt || new Date().toISOString(),
          lastModifiedBy: 'system'
        }
      },
      created_by: 'system'
    };

    // Insert the new state
    const { data: newStateData, error: newStateError } = await supabase
      .from('canvas_states')
      .insert(newState)
      .select()
      .single();

    if (newStateError) {
      console.error('Error saving new state:', newStateError);
      return res.status(500).json({ error: 'Failed to save new state' });
    }

    return res.status(200).json({
      success: true,
      operation: operationData,
      state: newStateData.state
    });

  } catch (error) {
    console.error('Error in add element handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 