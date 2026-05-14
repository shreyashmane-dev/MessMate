"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Loader2,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  MessageCircle,
  Send,
} from "lucide-react";
import Link from "next/link";

export default function MyRequestsPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const fetchRequests = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "requests"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setRequests(data);
    } catch (error) {
      console.error("Error fetching my requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleStudentReply = async (requestId: string) => {
    if (!user || !replyText.trim()) return;
    setReplySubmitting(true);
    try {
      await updateDoc(doc(db, "requests", requestId), {
        messages: arrayUnion({
          sender: "student",
          senderName: user.displayName || user.email?.split("@")[0] || "Student",
          text: replyText.trim(),
          createdAt: new Date().toISOString(),
        }),
      });
      setReplyingTo(null);
      setReplyText("");
      await fetchRequests();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setReplySubmitting(false);
    }
  };

  const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    pending: {
      color: "bg-yellow-50 border-yellow-200 text-yellow-700",
      icon: <Clock className="w-4 h-4" />,
      label: "Pending",
    },
    approved: {
      color: "bg-emerald-50 border-emerald-200 text-emerald-700",
      icon: <CheckCircle2 className="w-4 h-4" />,
      label: "Approved ✓",
    },
    rejected: {
      color: "bg-red-50 border-red-200 text-red-600",
      icon: <XCircle className="w-4 h-4" />,
      label: "Rejected",
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Requests</h1>
        <p className="text-slate-600">Track your join requests and messages from owners.</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No requests sent</h2>
          <p className="text-slate-500 mb-6">Browse messes and send a join request to get started.</p>
          <Link
            href="/explore"
            className="inline-block bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Explore Messes
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => {
            const status = statusConfig[request.status] || statusConfig.pending;
            return (
              <div
                key={request.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <Link
                      href={`/mess/${request.messId}`}
                      className="text-lg font-bold text-slate-900 hover:text-red-500 transition-colors"
                    >
                      {request.messName}
                    </Link>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {request.createdAt?.toDate
                        ? request.createdAt.toDate().toLocaleString("en-IN")
                        : "Recently"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border ${status.color}`}
                  >
                    {status.icon}
                    {status.label}
                  </span>
                </div>

                {/* Your message */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Your Request
                  </p>
                  <p className="text-slate-700 text-sm italic">"{request.query}"</p>
                </div>

                {/* Accepted banner */}
                {request.status === "approved" && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 mb-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-emerald-800 text-sm">
                        🎉 Your request has been accepted!
                      </p>
                      <p className="text-emerald-700 text-xs mt-1">
                        Contact the owner directly via the mess page to arrange your joining.
                      </p>
                    </div>
                  </div>
                )}

                {/* Message thread */}
                {request.messages && request.messages.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <MessageCircle className="w-3.5 h-3.5 inline mr-1" /> Thread
                    </p>
                    {request.messages.map((msg: any, idx: number) => (
                      <div
                        key={idx}
                        className={`flex ${msg.sender === "student" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                            msg.sender === "student"
                              ? "bg-slate-900 text-white"
                              : "bg-red-50 text-slate-900 border border-red-100"
                          }`}
                        >
                          <p className="text-[10px] font-bold opacity-60 mb-1">{msg.senderName}</p>
                          <p>{msg.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply input */}
                {replyingTo === request.id ? (
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Send a message to the owner..."
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      onKeyDown={(e) => e.key === "Enter" && handleStudentReply(request.id)}
                    />
                    <button
                      onClick={() => handleStudentReply(request.id)}
                      disabled={replySubmitting || !replyText.trim()}
                      className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-1"
                    >
                      {replySubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => { setReplyingTo(null); setReplyText(""); }}
                      className="px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-900 border border-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingTo(request.id)}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 transition-colors mt-2"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Message the owner
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
