'use client';

import { Suspense } from 'react';
import PlayerContent from './PlayerContent';

export default function PlayerWrapper() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#FAFAF8]"><div className="animate-spin h-8 w-8 border-2 border-orange-200 border-t-[#F4A47C] rounded-full" /></div>}>
      <PlayerContent />
    </Suspense>
  );
}
