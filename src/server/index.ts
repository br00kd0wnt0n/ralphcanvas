import express from 'express';
import { DatabaseManager } from '../database/DatabaseManager';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const dbManager = new DatabaseManager();

app.get('/health', async (req, res) => {
  try {
    await dbManager.initialize();
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (e) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: (e as Error).message });
  }
});

app.get('/', (req, res) => {
  res.send('Ralph Canvas API is running.');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
}); 