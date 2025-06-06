import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Mock state for now
  const mockState = {
    id: '1',
    version: '1.0.0',
    timeOfDay: 'day',
    weatherData: {
      temperature: 72,
      condition: 'sunny',
      humidity: 45
    },
    status: 'foundation-working',
    lastUpdated: new Date().toISOString()
  };

  res.status(200).json(mockState);
} 