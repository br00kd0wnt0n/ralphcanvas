import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/database/config';

export async function GET() {
  try {
    await initializeDatabase();
    return NextResponse.json({ status: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
} 