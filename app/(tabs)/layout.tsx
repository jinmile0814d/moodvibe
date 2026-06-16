'use client';

import { usePathname } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import MiniPlayer from '@/components/MiniPlayer';
import ExploreView from '@/components/ExploreView';

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isExplore = pathname === '/explore';

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-32">
      <div className={isExplore ? 'hidden' : ''}>{children}</div>
      <div className={isExplore ? '' : 'hidden'}>
        <ExploreView />
      </div>
      <MiniPlayer />
      <BottomNav />
    </div>
  );
}
