"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Star, Loader2, MessageSquare, Reply } from "lucide-react";

export function ReviewSection({ messId, messName }: { messId: string; messName: string }) {
  const { user, role } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "reviews"), where("messId", "==", messId));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Sort newest first in JS (avoids composite index requirement)
      data.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;
    setSubmitting(true);

    try {
      // 1. Add review document
      await addDoc(collection(db, "reviews"), {
        messId,
        messName,
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "Student",
        rating,
        comment: comment.trim(),
        replies: [],
        createdAt: serverTimestamp(),
      });

      // 2. Recalculate mess average rating using current reviews + new one
      const allRatings = [...reviews.map((r: any) => r.rating || 0), rating];
      const avgRating = (
        allRatings.reduce((acc, cur) => acc + cur, 0) / allRatings.length
      ).toFixed(1);

      await updateDoc(doc(db, "messes", messId), {
        rating: Number(avgRating),
        totalReviews: allRatings.length,
      });

      // Reset & reload
      setComment("");
      setRating(5);
      await fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!user || !replyText.trim()) return;
    setReplySubmitting(true);
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      await updateDoc(reviewRef, {
        replies: arrayUnion({
          userId: user.uid,
          userName: user.displayName || "Owner",
          comment: replyText.trim(),
          createdAt: new Date().toISOString(),
        }),
      });
      setReplyingTo(null);
      setReplyText("");
      await fetchReviews();
    } catch (error) {
      console.error("Error replying to review:", error);
      alert("Failed to send reply. Please try again.");
    } finally {
      setReplySubmitting(false);
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-red-500" /> Reviews ({reviews.length})
      </h2>

      {/* Review Submission Form — students only */}
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
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      rating >= star ? "text-yellow-500 fill-yellow-500" : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            placeholder="Share your experience about the food, hygiene, service, etc."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 mb-4 bg-white min-h-[100px] resize-none"
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
          <p className="text-slate-600">
            Please{" "}
            <a href="/login" className="text-red-500 font-semibold hover:underline">
              log in as a student
            </a>{" "}
            to write a review.
          </p>
        </div>
      ) : null}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              {/* Review Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-500 uppercase">
                    {review.userName?.charAt(0) || "S"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{review.userName || "Student"}</p>
                    <p className="text-xs text-slate-500">
                      {review.createdAt?.toDate
                        ? review.createdAt.toDate().toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Just now"}
                    </p>
                  </div>
                </div>
                <div className="flex bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Comment */}
              <p className="text-slate-700 leading-relaxed text-sm">{review.comment}</p>

              {/* Replies */}
              {review.replies && review.replies.length > 0 && (
                <div className="pl-5 border-l-2 border-red-100 space-y-3">
                  {review.replies.map((reply: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">{reply.userName}</span>
                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                          Owner
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{reply.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Owner Reply Toggle */}
              {role === "owner" && (
                <div>
                  {replyingTo === review.id ? (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        onKeyDown={(e) => e.key === "Enter" && handleReply(review.id)}
                      />
                      <button
                        onClick={() => handleReply(review.id)}
                        disabled={replySubmitting || !replyText.trim()}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-1"
                      >
                        {replySubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Send
                      </button>
                      <button
                        onClick={() => { setReplyingTo(null); setReplyText(""); }}
                        className="px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-900 border border-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(review.id)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition-colors mt-1"
                    >
                      <Reply className="w-3.5 h-3.5" /> Reply to this review
                    </button>
                  )}
                </div>
              )}
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
