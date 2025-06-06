import { NextApiRequest, NextApiResponse } from 'next';
import { CanvasStateManager } from '@/core/CanvasStateManager';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type } = req.body;

    if (!type || type !== 'time_evolution') {
      return res.status(400).json({ 
        error: 'Invalid evolution type. Only "time_evolution" is supported.' 
      });
    }

    const canvasId = 'default'; // Updated to match the add endpoint
    const userId = 'system'; // Use a real user ID in production

    const stateManager = new CanvasStateManager(canvasId);
    await stateManager.initialize();
    const evolvedState = await stateManager.evolveState(userId);

    return res.status(200).json({ 
      success: true, 
      state: evolvedState 
    });

  } catch (error) {
    console.error('Error evolving canvas state:', error);
    return res.status(500).json({ 
      error: 'Failed to evolve canvas state' 
    });
  }
} 