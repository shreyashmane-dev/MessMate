"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { collection, query, where, getDocs, doc, getDoc, documentId } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Heart, Store, MapPin, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";

export default function FavoritesPage() {
  const { user } = useAuthStore();
  const [messes, setMesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      try {
        // 1. Get user's saved messes array
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const savedIds = userDoc.data()?.savedMesses || [];

        if (savedIds.length === 0) {
          setMesses([]);
          return;
        }

        // 2. Fetch mess details for those IDs
        const q = query(collection(db, "messes"), where(documentId(), "in", savedIds.slice(0, 10))); // Firestore 'in' limit is 10
        const snapshot = await getDocs(q);
        setMesses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Favorite Messes</h1>
        <p className="text-slate-600">Messes you've saved for quick access.</p>
      </div>

      {messes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
          <Heart className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">No favorites yet</h2>
          <p className="text-slate-500">Tap the heart icon on any mess to save it here.</p>
          <Link href="/explore" className="inline-block mt-6 bg-red-500 text-white px-8 py-3 rounded-full font-bold hover:bg-red-600 transition-colors">
            Start Exploring
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {messes.map((mess) => (
            <div key={mess.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={optimizeCloudinaryUrl(mess.images?.[0])} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt={mess.name} 
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-slate-100 flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-bold text-slate-700">{mess.rating || "New"}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-slate-900 mb-1">{mess.name}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1 mb-4">
                  <MapPin className="w-3.5 h-3.5" /> {mess.address}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <p className="font-bold text-red-500">₹{mess.monthlyPrice}<span className="text-xs text-slate-400 font-normal"> /mo</span></p>
                  <Link href={`/mess/${mess.id}`} className="flex items-center gap-1 text-sm font-bold text-slate-900 hover:text-red-500 transition-colors">
                    View Details <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
