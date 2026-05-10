"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, MessageSquare, Star, User } from "lucide-react";

export default function OwnerReviewsPage() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) return;
      try {
        // First get owner's messes
        const messQuery = query(collection(db, "messes"), where("ownerId", "==", user.uid));
        const messSnapshot = await getDocs(messQuery);
        const messIds = messSnapshot.docs.map(doc => doc.id);

        if (messIds.length === 0) {
          setReviews([]);
          return;
        }

        // Get reviews for these messes
        const reviewQuery = query(
          collection(db, "reviews"), 
          where("messId", "in", messIds)
        );
        const reviewSnapshot = await getDocs(reviewQuery);
        const data = reviewSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort in JavaScript
        data.sort((a: any, b: any) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
          return dateB - dateA;
        });

        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
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
        <h1 className="text-3xl font-bold text-slate-900">Mess Reviews</h1>
        <p className="text-slate-600">See what students are saying about your messes.</p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
          <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">No reviews yet</h2>
          <p className="text-slate-500">When students rate your mess, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-500">
                    {review.userName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{review.userName}</p>
                    <p className="text-xs text-slate-500">{review.createdAt?.toDate?.().toLocaleDateString() || "Recently"}</p>
                  </div>
                </div>
                <div className="flex bg-slate-50 px-2 py-1 rounded border border-slate-200">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-bold text-slate-700 ml-1">{review.rating}</span>
                </div>
              </div>
              <p className="text-slate-600 italic text-sm mb-4">"{review.comment}"</p>
              <div className="pt-4 border-t border-slate-50 text-xs font-medium text-slate-400 uppercase tracking-widest">
                Review for: <span className="text-slate-600">{review.messName || "Your Mess"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
