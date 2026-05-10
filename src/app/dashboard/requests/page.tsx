"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Bell, CheckCircle2, XCircle, Mail, User, Clock } from "lucide-react";

export default function OwnerRequestsPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "requests"), 
        where("ownerId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort in JavaScript to avoid composite index requirement
      data.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return dateB - dateA;
      });

      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleStatusUpdate = async (requestId: string, newStatus: "approved" | "rejected") => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: newStatus
      });
      setRequests(requests.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error("Error updating request status:", error);
      alert("Failed to update status.");
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
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Student Requests</h1>
        <p className="text-slate-600">Manage joining requests and queries from students.</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No requests yet</h2>
          <p className="text-slate-500">When students ask to join or send queries, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              {/* Status Badge */}
              <div className="absolute top-0 right-0">
                <span className={`px-4 py-1.5 rounded-bl-2xl text-xs font-bold uppercase tracking-wider ${
                  request.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                  request.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' :
                  'bg-red-500/10 text-red-600'
                }`}>
                  {request.status}
                </span>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" /> {request.userName}
                    </h3>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" /> {request.userEmail}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Query / Message</p>
                    <p className="text-slate-700 italic">"{request.query}"</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 
                      {request.createdAt?.toDate ? request.createdAt.toDate().toLocaleString() : "Recently"}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-slate-500">Mess: {request.messName}</span>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex md:flex-col gap-2 shrink-0">
                    <button 
                      onClick={() => handleStatusUpdate(request.id, "approved")}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(request.id, "rejected")}
                      className="flex items-center gap-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-600 px-6 py-2.5 rounded-xl font-bold transition-all border border-slate-200"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
