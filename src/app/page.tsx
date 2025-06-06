'use client';

import dynamic from 'next/dynamic';

// Dynamically import the CanvasRenderer component with no SSR
const CanvasRenderer = dynamic(
  () => import('@/components/CanvasRenderer').then(mod => mod.CanvasRenderer),
  { ssr: false }
);

export default function Home() {
  return <CanvasRenderer />;
} 