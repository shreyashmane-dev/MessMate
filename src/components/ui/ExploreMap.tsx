"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const ExploreMapClient = dynamic(
  () => import('./ExploreMapClient'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-white flex flex-col items-center justify-center text-slate-600">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <span>Loading map...</span>
      </div>
    )
  }
);

interface ExploreMapProps {
  messes: any[];
  hoveredMessId: string | null;
  center?: [number, number];
}

export function ExploreMap(props: ExploreMapProps) {
  return <ExploreMapClient {...props} />;
}
