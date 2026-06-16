'use client';

import dynamic from 'next/dynamic';

const PlayerContent = dynamic(() => import('./PlayerContent'), { ssr: false });

export default function PlayerPage() {
  return <PlayerContent />;
}
