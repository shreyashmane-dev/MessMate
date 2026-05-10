"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ExploreMap } from "@/components/ui/ExploreMap";
import { Search, MapPin, Star, Filter, SlidersHorizontal, Loader2, Utensils } from "lucide-react";
import Link from "next/link";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";

export default function ExplorePage() {
  const [messes, setMesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredMessId, setHoveredMessId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");

  // Default Map Center (Kolhapur)
  const [mapCenter, setMapCenter] = useState<[number, number]>([16.7050, 74.2433]);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  useEffect(() => {
    const fetchMesses = async () => {
      try {
        const q = query(collection(db, "messes"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMesses(data);
        
        // If we have data and it has coordinates, set map center to first item
        if (data.length > 0 && data[0].latitude && data[0].longitude) {
          setMapCenter([data[0].latitude, data[0].longitude]);
        }
      } catch (error) {
        console.error("Error fetching messes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMesses();
  }, []);

  const filteredMesses = messes.filter(mess => {
    const matchesSearch = mess.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          mess.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "All" || mess.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:flex-row overflow-hidden relative">
      
      {/* Mobile Toggle Button */}
      <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={() => setMobileView(prev => prev === "list" ? "map" : "list")}
          className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold shadow-xl shadow-slate-900/20 flex items-center gap-2 border border-slate-700"
        >
          {mobileView === "list" ? (
            <><MapPin className="w-4 h-4" /> Show Map</>
          ) : (
            <><Search className="w-4 h-4" /> Show List</>
          )}
        </button>
      </div>

      {/* Sidebar List */}
      <div className={`w-full md:w-[600px] flex flex-col h-full bg-white border-r border-slate-200 relative z-10 shadow-xl ${mobileView === 'map' ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-200 bg-white/90 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Explore Messes</h1>
            <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition-colors">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input 
              type="text" 
              placeholder="Search by name or location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {["All", "Veg", "Non-Veg", "Both"].map(type => (
              <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filterType === type 
                    ? "bg-red-500 text-slate-900" 
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-sm font-medium text-slate-600 mb-2">{filteredMesses.length} messes found</p>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Loading messes...</p>
            </div>
          ) : filteredMesses.length === 0 ? (
            <div className="text-center py-20">
              <Utensils className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No messes found matching your criteria.</p>
            </div>
          ) : (
            filteredMesses.map(mess => (
              <Link 
                href={`/mess/${mess.id}`} 
                key={mess.id}
                onMouseEnter={() => {
                  setHoveredMessId(mess.id);
                  if (mess.latitude && mess.longitude) {
                    setMapCenter([mess.latitude, mess.longitude]);
                  }
                }}
                onMouseLeave={() => setHoveredMessId(null)}
                className="group flex flex-col sm:flex-row gap-4 bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all cursor-pointer"
              >
                <div className="w-full sm:w-48 h-48 sm:h-auto bg-slate-100 relative shrink-0">
                  {mess.images?.[0] ? (
                    <img 
                      src={optimizeCloudinaryUrl(mess.images[0])} 
                      alt={mess.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Utensils className="text-slate-600 w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="bg-black/60 backdrop-blur-md text-slate-900 text-xs font-medium px-2 py-1 rounded-full">
                      {mess.type}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-600">{mess.gender}</span>
                      <div className="flex items-center gap-1 text-sm font-medium text-slate-900">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        {mess.rating || "New"}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-red-500 transition-colors line-clamp-1">{mess.name}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">{mess.address}</p>
                  </div>
                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      <span className="text-xl font-bold text-slate-900">₹{mess.monthlyPrice}</span>
                      <span className="text-xs text-slate-600">/mo</span>
                    </div>
                    <span className="text-red-500 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                      View details <span className="text-lg leading-none">›</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Map Section */}
      <div className={`flex-1 h-full bg-white relative ${mobileView === 'list' ? 'hidden md:block' : 'block'}`}>
        <ExploreMap messes={filteredMesses} hoveredMessId={hoveredMessId} center={mapCenter} />
      </div>
    </div>
  );
}
