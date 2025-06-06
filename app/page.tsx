import dynamic from 'next/dynamic';

// Dynamically import the ParticleSystemTest component with no SSR
const ParticleSystemTest = dynamic(
  () => import('@/components/visual/ParticleSystemTest').then(mod => mod.ParticleSystemTest),
  { ssr: false }
);

export default function Home() {
  return <ParticleSystemTest />;
} 