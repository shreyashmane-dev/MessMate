"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Plus, TrendingUp, Users, Star, Store, MessageSquare, UtensilsCrossed, Search, MapPin, Navigation, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";

export default function DashboardOverview() {
  const { user, role } = useAuthStore();
  const [stats, setStats] = useState({ totalMesses: 0, avgRating: 0, totalReviews: 0 });
  const [nearbyMesses, setNearbyMesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        if (role === "owner") {
          const q = query(collection(db, "messes"), where("ownerId", "==", user.uid));
          const snapshot = await getDocs(q);
          
          let totalReviews = 0;
          let sumRating = 0;
          
          snapshot.forEach(doc => {
            const data = doc.data();
            totalReviews += data.totalReviews || 0;
            sumRating += (data.rating || 0) * (data.totalReviews || 0);
          });

          const avgRating = totalReviews > 0 ? (sumRating / totalReviews).toFixed(1) : "0.0";
          
          setStats({
            totalMesses: snapshot.size,
            avgRating: Number(avgRating),
            totalReviews
          });
        } else {
          // Student Data: Recent/Featured messes
          const q = query(collection(db, "messes"), orderBy("createdAt", "desc"), limit(4));
          const snapshot = await getDocs(q);
          setNearbyMesses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, role]);

  return (
    <div className="pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back!</h1>
          <p className="text-slate-600">Here's what's happening with your account today.</p>
        </div>
        {role === "owner" ? (
          <Link 
            href="/dashboard/messes/new" 
            className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-6 py-3 font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-500/20"
          >
            <Plus className="w-5 h-5" />
            Add New Mess
          </Link>
        ) : (
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for messes near you..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (window.location.href = `/explore?q=${searchQuery}`)}
            />
          </div>
        )}
      </div>

      {role === "owner" ? (
        /* Owner View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 font-bold text-sm uppercase tracking-wider">Total Listings</h3>
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <Store className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{loading ? "-" : stats.totalMesses}</p>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 font-bold text-sm uppercase tracking-wider">Avg Rating</h3>
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{loading ? "-" : stats.avgRating}</p>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 font-bold text-sm uppercase tracking-wider">Reviews</h3>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{loading ? "-" : stats.totalReviews}</p>
          </div>
        </div>
      ) : (
        /* Student View */
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/explore" className="bg-slate-900 p-8 rounded-[2rem] text-white flex flex-col justify-between h-48 hover:scale-[1.02] transition-transform shadow-xl shadow-slate-900/20 overflow-hidden relative group">
              <Navigation className="w-20 h-20 text-white/10 absolute -bottom-4 -right-4 rotate-12 group-hover:scale-110 transition-transform" />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2">Explore on Map</h2>
                <p className="text-slate-400 text-sm max-w-[200px]">Find the mess exactly where you need it around Kolhapur.</p>
              </div>
              <div className="flex items-center gap-2 font-bold text-red-500">
                Find Nearby <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link href="/dashboard/favorites" className="bg-red-500 p-8 rounded-[2rem] text-white flex flex-col justify-between h-48 hover:scale-[1.02] transition-transform shadow-xl shadow-red-500/20 overflow-hidden relative group">
              <Store className="w-20 h-20 text-white/10 absolute -bottom-4 -right-4 rotate-12 group-hover:scale-110 transition-transform" />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2">My Favorites</h2>
                <p className="text-red-100 text-sm max-w-[200px]">Quickly access your saved messes and check menus.</p>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-900">
                View Saved <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* Recently Added / Recommendations */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">New Listings</h2>
              <Link href="/explore" className="text-red-500 font-bold text-sm flex items-center gap-1">
                Explore All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {nearbyMesses.map((mess) => (
                  <Link key={mess.id} href={`/mess/${mess.id}`} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                    <div className="h-40 relative">
                      <img 
                        src={optimizeCloudinaryUrl(mess.images?.[0])} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        alt={mess.name} 
                      />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-bold">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {mess.rating || "New"}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-900 line-clamp-1 text-sm mb-1">{mess.name}</h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-3">
                        <MapPin className="w-3 h-3" /> {mess.address.split(',')[0]}
                      </p>
                      <p className="text-sm font-bold text-red-500">₹{mess.monthlyPrice}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
