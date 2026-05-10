"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icon for Owner Pin
const createCustomIcon = () => {
  const iconHtml = renderToString(
    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-xl shadow-red-500/50 border-2 border-white transform -translate-y-4">
      <MapPin className="w-5 h-5 text-white" />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

interface MapPickerClientProps {
  position: [number, number];
  onPositionChange: (pos: [number, number]) => void;
  className?: string;
  readOnly?: boolean;
}

function LocationMarker({ position, onPositionChange, readOnly }: { position: [number, number], onPositionChange: (p: [number, number]) => void, readOnly: boolean }) {
  const markerRef = useRef<L.Marker>(null);
  
  const map = useMapEvents({
    click(e) {
      if (readOnly) return;
      onPositionChange([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          onPositionChange([newPos.lat, newPos.lng]);
        }
      },
    }),
    [onPositionChange],
  );

  return (
    <Marker
      draggable={!readOnly}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={createCustomIcon()}
    >
      <Popup className="rounded-xl">
        <div className="font-sans text-sm p-1">
          <p className="font-bold text-slate-800 mb-1">Mess Location</p>
          {!readOnly && <p className="text-xs text-slate-600">Drag to adjust</p>}
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapPickerClient({ position, onPositionChange, className = "h-[400px]", readOnly = false }: MapPickerClientProps) {
  const [address, setAddress] = useState<string>("Loading address...");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  // Reverse Geocoding
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}`);
        const data = await res.json();
        setAddress(data.display_name || "Address not found");
      } catch (error) {
        setAddress("Error fetching address");
      }
    };
    
    const timeout = setTimeout(fetchAddress, 500); // Debounce
    return () => clearTimeout(timeout);
  }, [position]);

  // Search Address
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || readOnly) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        onPositionChange([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } else {
        alert("Location not found");
      }
    } catch (error) {
      alert("Error searching location");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className={`w-full flex flex-col gap-4 relative z-0`}>
      
      {!readOnly && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for an address or landmark..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch(e as any))}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all bg-white"
            />
          </div>
          <button 
            type="button" 
            onClick={(e) => handleSearch(e as any)}
            disabled={searching}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
          </button>
        </div>
      )}

      <div className={`w-full rounded-2xl overflow-hidden border border-slate-200 relative ${className}`}>
        <MapContainer 
          center={position} 
          zoom={14} 
          scrollWheelZoom={!readOnly}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <LocationMarker position={position} onPositionChange={onPositionChange} readOnly={readOnly} />
          <UpdateMapCenter position={position} />
        </MapContainer>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
        <MapPin className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Selected Location</p>
          <p className="text-sm text-slate-700">{address}</p>
        </div>
      </div>

    </div>
  );
}

function UpdateMapCenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [position, map]);
  return null;
}
