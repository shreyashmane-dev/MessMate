"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Star, Loader2, MessageSquare } from "lucide-react";

export function ReviewSection({ messId, messName }: { messId: string, messName: string }) {
  const { user, role } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, "reviews"), where("messId", "==", messId), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [messId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;
    setSubmitting(true);
    
    try {
      // 1. Add Review
      await addDoc(collection(db, "reviews"), {
        messId,
        messName,
        userId: user.uid,
        userName: user.displayName || "Student User",
        rating,
        comment,
        createdAt: serverTimestamp()
      });

      // 2. Recalculate average rating for Mess (Naive approach for client side)
      const newReviews = [{ rating }, ...reviews];
      const avgRating = (newReviews.reduce((acc, curr) => acc + curr.rating, 0) / newReviews.length).toFixed(1);
      
      await updateDoc(doc(db, "messes", messId), {
        rating: avgRating,
        totalReviews: newReviews.length
      });

      // Reset & Reload
      setComment("");
      setRating(5);
      fetchReviews();
      
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-red-500" /> Reviews ({reviews.length})
      </h2>

      {/* Review Submission Form */}
      {user && role === "student" ? (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8">
          <h3 className="font-bold text-slate-900 mb-4">Write a Review</h3>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-slate-700">Rating:</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  type="button" 
                  key={star} 
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none"
                >
                  <Star className={`w-6 h-6 ${rating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            placeholder="Share your experience about the food, hygiene, etc."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 mb-4 bg-white min-h-[100px]"
          />
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={submitting || !comment.trim()}
              className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-full disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Review
            </button>
          </div>
        </form>
      ) : !user ? (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 text-center">
          <p className="text-slate-600 mb-3">You must be logged in as a student to write a review.</p>
        </div>
      ) : null}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-red-500" /></div>
      ) : reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-500">
                    {review.userName?.charAt(0) || "S"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{review.userName || "Student User"}</p>
                    <p className="text-xs text-slate-500">
                      {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                </div>
                <div className="flex bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`} />
                  ))}
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed text-sm">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-slate-100 rounded-2xl">
          <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500">No reviews yet. Be the first to review!</p>
        </div>
      )}
    </div>
  );
}
