"use client";

import { useEffect, useState, use } from "react";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2, Star, MapPin, Phone, MessageCircle, Share, Heart, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import { ReviewSection } from "@/components/mess/ReviewSection";
import { UtensilsCrossed } from "lucide-react";
import dynamic from "next/dynamic";

const MapPickerClient = dynamic(
  () => import("@/components/ui/MapPickerClient"),
  { ssr: false, loading: () => <div className="w-full h-[400px] bg-white rounded-2xl animate-pulse" /> }
);

export default function MessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrapping params as Next.js 15 requires
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  
  const { user } = useAuthStore();
  const [mess, setMess] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchMess = async () => {
      try {
        const docRef = doc(db, "messes", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMess({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching mess:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const checkFavorite = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().savedMesses?.includes(id)) {
          setIsFavorite(true);
        }
      } catch (error) {
        console.error("Error checking favorite:", error);
      }
    };

    fetchMess();
    checkFavorite();
  }, [id, user]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  const toggleFavorite = async () => {
    if (!user) {
      alert("Please log in to save messes.");
      return;
    }
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      if (isFavorite) {
        await updateDoc(userRef, { savedMesses: arrayRemove(id) });
        setIsFavorite(false);
      } else {
        await updateDoc(userRef, { savedMesses: arrayUnion(id) });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
      </div>
    );
  }

  if (!mess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-slate-600">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Mess Not Found</h1>
        <p className="mb-6">The mess you are looking for does not exist or has been removed.</p>
        <Link href="/explore" className="text-red-500 hover:text-indigo-300">
          ← Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/explore" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{mess.name}</h1>
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-1 text-slate-900">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {mess.rating || "New"} <span className="text-slate-600 font-normal">({mess.totalReviews || 0} reviews)</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-600" />
                {mess.address}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors font-medium"
            >
              <Share className="w-4 h-4" /> Share
            </button>
            <button 
              onClick={toggleFavorite}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors font-medium disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />} 
              {isFavorite ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Image Gallery (Airbnb Style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[400px] md:h-[500px] mb-12 rounded-3xl overflow-hidden relative">
        {mess.images?.[0] && (
          <div className="md:col-span-2 row-span-2 h-full">
            <img src={optimizeCloudinaryUrl(mess.images[0])} alt="Cover" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
        )}
        {mess.images?.slice(1, 5).map((img: string, idx: number) => (
          <div key={idx} className="hidden md:block h-full">
            <img src={optimizeCloudinaryUrl(img)} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
        ))}
        {mess.images?.length > 5 && (
          <button className="absolute bottom-6 right-6 bg-white text-slate-900 font-medium px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
            Show all photos
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
        <div className="lg:col-span-2">
          {/* Tags */}
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="px-4 py-1.5 bg-red-50 text-red-500 border border-red-200 rounded-full font-medium text-sm">
              {mess.type}
            </span>
            <span className="px-4 py-1.5 bg-red-50 text-red-500 border border-red-200 rounded-full font-medium text-sm">
              {mess.gender}
            </span>
            {mess.verified && (
              <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-medium text-sm flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Verified Mess
              </span>
            )}
          </div>

          <div className="pb-8 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">About this mess</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{mess.description}</p>
          </div>

          {/* Weekly Menu Section */}
          {mess.menu && (
            <div className="py-8 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-red-500" /> Weekly Menu Schedule
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(mess.menu).map(([day, details]: [string, any]) => (
                  (details.item) && (
                    <div key={day} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center font-bold text-xs text-red-500 shrink-0 shadow-sm uppercase">
                        {day.substring(0, 3)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 leading-tight">{details.item}</p>
                        {details.quantity && (
                          <p className="text-xs text-slate-500 mt-0.5">{details.quantity}</p>
                        )}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          <div className="py-8 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Location</h2>
            {mess.latitude && mess.longitude ? (
              <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-slate-200 relative z-0">
                <MapPickerClient 
                  position={[mess.latitude, mess.longitude]} 
                  onPositionChange={() => {}} // Read-only
                  readOnly={true}
                />
              </div>
            ) : (
              <p className="text-slate-600">Location map not available.</p>
            )}
            <p className="text-slate-600 mt-4 font-medium">{mess.address}</p>
          </div>

          {/* Reviews Section */}
          <ReviewSection messId={id as string} messName={mess.name} />
        </div>

        {/* Right Column - Sticky CTA */}
        <div className="relative">
          <div className="sticky top-24 glass p-6 rounded-3xl border border-slate-200 shadow-2xl">
            <div className="flex items-end gap-1 mb-6">
              <span className="text-3xl font-bold text-slate-900">₹{mess.monthlyPrice}</span>
              <span className="text-slate-600 mb-1">/ month</span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">Available Seats</span>
                <span className={`font-bold ${mess.availableSeats > 5 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {mess.availableSeats} / {mess.totalSeats}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${mess.availableSeats > 5 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${(mess.availableSeats / mess.totalSeats) * 100}%` }}
                />
              </div>
            </div>

            {mess.dailyPrice && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Daily Trial Meal</span>
                <span className="text-slate-900 font-bold">₹{mess.dailyPrice}</span>
              </div>
            )}

            <div className="space-y-4 mb-8">
              <a 
                href={`tel:${mess.contactNumber}`} 
                className="w-full bg-red-500 hover:bg-red-600 text-slate-900 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-500/20"
              >
                <Phone className="w-5 h-5" />
                Call Owner
              </a>
              <a 
                href={`https://wa.me/91${mess.whatsappNumber}`} 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
              
              <button 
                onClick={() => {
                  if (!user) return alert("Please log in to send a request.");
                  const queryText = prompt("Enter your query or request to join:");
                  if (queryText) {
                    addDoc(collection(db, "requests"), {
                      messId: id,
                      ownerId: mess.ownerId,
                      userId: user.uid,
                      userName: user.displayName || "Student",
                      userEmail: user.email,
                      messName: mess.name,
                      query: queryText,
                      status: "pending",
                      createdAt: serverTimestamp()
                    }).then(() => alert("Request sent successfully!"));
                  }
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-900/20"
              >
                Send Join Request
              </button>
            </div>

            <div className="text-center text-sm text-slate-600">
              Mention <span className="text-red-500 font-semibold">MessMate</span> when calling to get quick responses!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
