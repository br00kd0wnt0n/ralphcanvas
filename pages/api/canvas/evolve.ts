import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { type } = req.body;

    // Mock evolution for now
    const evolvedState = {
      id: '1',
      version: '1.0.0',
      timeOfDay: type === 'time_evolution' ? 'night' : 'day',
      weatherData: {
        temperature: 68,
        condition: 'clear',
        humidity: 50
      },
      status: 'foundation-working',
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json(evolvedState);
  } catch (error) {
    console.error('Failed to evolve state:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 