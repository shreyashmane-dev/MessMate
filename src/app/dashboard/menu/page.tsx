"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Save, CheckCircle2, UtensilsCrossed } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function OwnerMenuPage() {
  const { user } = useAuthStore();
  const [messes, setMesses] = useState<any[]>([]);
  const [selectedMessId, setSelectedMessId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Menu state: { Monday: { item: "", quantity: "" }, Tuesday: ... }
  const [menu, setMenu] = useState<Record<string, { item: string, quantity: string }>>({});

  useEffect(() => {
    const fetchMesses = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "messes"), where("ownerId", "==", user.uid));
        const snapshot = await getDocs(q);
        const fetchedMesses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMesses(fetchedMesses);
        
        if (fetchedMesses.length > 0) {
          setSelectedMessId(fetchedMesses[0].id);
          setMenu(fetchedMesses[0].menu || initializeEmptyMenu());
        }
      } catch (error) {
        console.error("Error fetching messes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMesses();
  }, [user]);

  // When selected mess changes, load its menu
  useEffect(() => {
    if (!selectedMessId) return;
    const selectedMess = messes.find(m => m.id === selectedMessId);
    if (selectedMess) {
      setMenu(selectedMess.menu || initializeEmptyMenu());
    }
  }, [selectedMessId, messes]);

  const initializeEmptyMenu = () => {
    const empty: Record<string, { item: string, quantity: string }> = {};
    DAYS.forEach(day => {
      empty[day] = { item: "", quantity: "" };
    });
    return empty;
  };

  const handleMenuChange = (day: string, field: "item" | "quantity", value: string) => {
    setMenu(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!selectedMessId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "messes", selectedMessId), {
        menu
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      // Update local state to reflect saved menu
      setMesses(messes.map(m => m.id === selectedMessId ? { ...m, menu } : m));
    } catch (error) {
      console.error("Error saving menu:", error);
      alert("Failed to save menu.");
    } finally {
      setSaving(false);
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
        <h1 className="text-3xl font-bold text-slate-900">Weekly Menu</h1>
        <button
          onClick={handleSave}
          disabled={saving || !selectedMessId}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Menu"}
        </button>
      </div>

      {messes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <UtensilsCrossed className="w-8 h-8 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">No messes found</h2>
          <p className="text-slate-500">You need to create a mess before you can set a menu.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <label className="block text-sm font-bold text-slate-700 mb-2">Select Mess to Edit</label>
            <select 
              value={selectedMessId}
              onChange={(e) => setSelectedMessId(e.target.value)}
              className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 bg-white"
            >
              {messes.map(mess => (
                <option key={mess.id} value={mess.id}>{mess.name}</option>
              ))}
            </select>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 hidden md:grid">
              <div className="col-span-2">Day</div>
              <div className="col-span-7">Main Food Items (What's cooking?)</div>
              <div className="col-span-3">Quantity Limits (Optional)</div>
            </div>

            {DAYS.map((day) => (
              <div key={day} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="col-span-2 font-bold text-slate-900">{day}</div>
                <div className="col-span-1 md:col-span-7">
                  <input 
                    type="text" 
                    value={menu[day]?.item || ""}
                    onChange={(e) => handleMenuChange(day, "item", e.target.value)}
                    placeholder="e.g. Chapati, Paneer Masala, Rice, Dal..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
                  />
                </div>
                <div className="col-span-1 md:col-span-3">
                  <input 
                    type="text" 
                    value={menu[day]?.quantity || ""}
                    onChange={(e) => handleMenuChange(day, "quantity", e.target.value)}
                    placeholder="e.g. Unlimited, or 3 Chapatis"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 p-6 border-t border-slate-200">
            <h3 className="font-bold text-slate-900 mb-2">Menu Conditions</h3>
            <p className="text-sm text-slate-600">
              Students will see this exact menu on your public mess page. Make sure to update it if there are any changes to your schedule. Empty fields will be hidden from students.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
