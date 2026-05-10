"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const MapPickerClient = dynamic(
  () => import('./MapPickerClient'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-600">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <span>Loading map...</span>
      </div>
    )
  }
);

interface MapPickerProps {
  position: [number, number];
  onPositionChange: (pos: [number, number]) => void;
  className?: string;
  readOnly?: boolean;
}

export function MapPicker(props: MapPickerProps) {
  return <MapPickerClient {...props} />;
}
