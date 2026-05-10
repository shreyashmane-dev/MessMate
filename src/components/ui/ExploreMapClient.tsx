"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { MapPin, Star, Utensils } from 'lucide-react';
import Link from 'next/link';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icon with Image and Price
const createCustomIcon = (price: number, image: string, name: string, isHovered: boolean) => {
  const iconHtml = renderToString(
    <div className={`relative flex items-center transition-all duration-300 ${isHovered ? 'z-50 scale-110' : 'z-10'}`}>
      <div className={`flex items-center gap-2 px-2 py-1.5 rounded-full shadow-xl border-2 whitespace-nowrap overflow-hidden ${
        isHovered ? 'bg-red-500 text-white border-white' : 'bg-white text-slate-900 border-transparent'
      }`}>
        <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
          {image ? (
            <img src={optimizeCloudinaryUrl(image)} className="w-full h-full object-cover" alt="" />
          ) : (
            <MapPin className="w-3 h-3 text-slate-400 m-auto" />
          )}
        </div>
        <div className="flex flex-col pr-1">
          {isHovered && <span className="text-[8px] uppercase font-black leading-none mb-0.5 opacity-80">{name}</span>}
          <span className="font-bold text-xs leading-none">₹{price}</span>
        </div>
      </div>
      {/* Triangle pointer */}
      <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r-2 border-b-2 ${
        isHovered ? 'bg-red-500 border-white' : 'bg-white border-transparent'
      }`} />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-mess-icon',
    iconSize: [80, 40],
    iconAnchor: [40, 40],
  });
};

interface ExploreMapClientProps {
  messes: any[];
  hoveredMessId: string | null;
  center?: [number, number];
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

export default function ExploreMapClient({ messes, hoveredMessId, center = [28.6139, 77.2090] }: ExploreMapClientProps) {
  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.carto.com/">Carto</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {messes.map((mess) => {
          if (!mess.latitude || !mess.longitude) return null;
          const isHovered = hoveredMessId === mess.id;
          
          return (
            <Marker
              key={mess.id}
              position={[mess.latitude, mess.longitude]}
              icon={createCustomIcon(mess.monthlyPrice, mess.images?.[0] || "", mess.name, isHovered)}
              zIndexOffset={isHovered ? 1000 : 0}
            >
              <Popup className="custom-popup rounded-2xl overflow-hidden p-0 border-0 shadow-2xl">
                <div className="w-64 bg-white overflow-hidden font-sans">
                  <div className="h-32 bg-slate-100 relative">
                    {mess.images?.[0] ? (
                      <img src={mess.images[0]} className="w-full h-full object-cover" alt={mess.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="text-slate-600" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-slate-900 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-bold shadow-sm">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {mess.rating || "New"}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 text-lg mb-1 leading-tight">{mess.name}</h3>
                    <p className="text-slate-600 text-xs mb-3 truncate">{mess.address}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-500">₹{mess.monthlyPrice}<span className="text-xs font-normal text-slate-500">/mo</span></span>
                      <Link href={`/mess/${mess.id}`} className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-4 py-2 rounded-full transition-colors">
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        <MapUpdater center={center} />
      </MapContainer>
      
      {/* Custom CSS for Popup to override Leaflet defaults */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper { padding: 0; overflow: hidden; background: #ffffff; border: 1px solid #f1f5f9; border-radius: 1rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
        .leaflet-popup-content { margin: 0; width: 256px !important; }
        .leaflet-popup-tip { background: #ffffff; border: 1px solid #f1f5f9; border-top: none; border-left: none; }
        .custom-price-icon { background: transparent; border: none; }
      `}} />
    </div>
  );
}
