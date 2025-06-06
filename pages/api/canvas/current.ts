import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const mockState = {
    id: 'canvas-1',
    version: '1.0',
    timeOfDay: new Date().getHours(),
    weatherData: { location: 'Tokyo', temperature: 20 },
    status: 'foundation-working'
  };
  
  return res.status(200).json(mockState);
} 