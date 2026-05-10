"use client";

import Link from "next/link";
import { Plus, Store, MapPin, Star, ArrowRight, Loader2, Edit2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";

export default function OwnerMessesPage() {
  const { user } = useAuthStore();
  const [messes, setMesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyMesses = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "messes"), where("ownerId", "==", user.uid));
        const snapshot = await getDocs(q);
        const fetchedMesses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMesses(fetchedMesses);
      } catch (error) {
        console.error("Error fetching my messes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyMesses();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this mess? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "messes", id));
      setMesses(messes.filter(m => m.id !== id));
    } catch (error) {
      console.error("Error deleting mess:", error);
      alert("Failed to delete mess.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">My Messes</h1>
        <Link 
          href="/dashboard/messes/new" 
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New
        </Link>
      </div>

      {messes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center text-center shadow-sm">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <Store className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No messes listed yet</h2>
          <p className="text-slate-500 max-w-md mb-6">You haven't added any mess services to your profile yet. Create your first listing to start reaching students.</p>
          <Link 
            href="/dashboard/messes/new" 
            className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold hover:bg-slate-800 transition-colors"
          >
            Create your first Mess
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {messes.map((mess) => (
            <div key={mess.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row">
              <div className="w-full sm:w-48 h-48 sm:h-full bg-slate-100 shrink-0">
                {mess.images?.[0] ? (
                  <img src={optimizeCloudinaryUrl(mess.images[0])} alt={mess.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="w-8 h-8 text-slate-300" />
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{mess.name}</h3>
                  <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-slate-700">{mess.rating || "New"}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-3 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{mess.address}</span>
                </p>
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Monthly Price</p>
                    <p className="font-bold text-red-500">₹{mess.monthlyPrice}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleDelete(mess.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link 
                      href={`/dashboard/messes/edit/${mess.id}`} 
                      className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <Link 
                      href={`/mess/${mess.id}`} 
                      className="flex items-center gap-1 text-sm font-bold text-slate-900 hover:text-red-500 transition-colors"
                    >
                      View <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
