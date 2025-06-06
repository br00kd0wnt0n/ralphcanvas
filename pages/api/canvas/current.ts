import type { NextApiRequest, NextApiResponse } from 'next';
import { CanvasStateManager } from '@/core/CanvasStateManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const canvasId = typeof req.query.canvasId === 'string' ? req.query.canvasId : 'default';
    const stateManager = new CanvasStateManager(canvasId);
    await stateManager.initialize();
    const state = stateManager.getState();

    if (!state) {
      return res.status(404).json({ status: 'error', message: 'Canvas state not found' });
    }

    res.status(200).json(state);
  } catch (error) {
    console.error('Error fetching current canvas state:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch canvas state' });
  }
} 