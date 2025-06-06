import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const newState = {
    id: 'canvas-1',
    version: '2.0',
    timeOfDay: new Date().getHours(),
    success: true,
    evolved: true
  };
  
  return res.status(200).json(newState);
} 