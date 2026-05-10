"use client";

import { useState, useEffect, use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, ArrowLeft, Save, MapPin, Store } from "lucide-react";
import Link from "next/link";
import { ImageUploader } from "@/components/ui/ImageUploader";
import dynamic from "next/dynamic";

const MapPicker = dynamic(
  () => import("@/components/ui/MapPicker").then(mod => mod.MapPicker),
  { ssr: false, loading: () => <div className="h-[400px] bg-slate-100 rounded-2xl animate-pulse" /> }
);

const messSchema = z.object({
  name: z.string().min(3, "Mess name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(5, "Address is required"),
  monthlyPrice: z.coerce.number().min(0, "Price must be positive"),
  dailyPrice: z.coerce.number().optional(),
  type: z.enum(["Veg", "Non-Veg", "Both"]),
  gender: z.enum(["Boys", "Girls", "Co-ed"]),
  contactNumber: z.string().min(10, "Valid contact number required"),
  whatsappNumber: z.string().min(10, "Valid WhatsApp number required"),
  totalSeats: z.coerce.number().min(1, "Total seats must be at least 1"),
  availableSeats: z.coerce.number().min(0, "Available seats cannot be negative"),
});

type MessFormValues = z.infer<typeof messSchema>;

export default function EditMessPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [position, setPosition] = useState<[number, number]>([28.6139, 77.2090]);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<MessFormValues>({
    resolver: zodResolver(messSchema),
  });

  useEffect(() => {
    const fetchMess = async () => {
      try {
        const docRef = doc(db, "messes", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Check if user is the owner
          if (data.ownerId !== user?.uid) {
            alert("You do not have permission to edit this mess.");
            router.push("/dashboard/messes");
            return;
          }
          
          reset({
            name: data.name,
            description: data.description,
            address: data.address,
            monthlyPrice: data.monthlyPrice,
            dailyPrice: data.dailyPrice,
            type: data.type,
            gender: data.gender,
            contactNumber: data.contactNumber,
            whatsappNumber: data.whatsappNumber,
            totalSeats: data.totalSeats,
            availableSeats: data.availableSeats,
          });
          setImages(data.images || []);
          if (data.latitude && data.longitude) {
            setPosition([data.latitude, data.longitude]);
          }
        }
      } catch (error) {
        console.error("Error fetching mess:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMess();
  }, [id, reset, user, router]);

  const onSubmit = async (data: MessFormValues) => {
    if (!user) return;
    if (images.length === 0) {
      alert("Please upload at least one image of your mess.");
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, "messes", id);
      await updateDoc(docRef, {
        ...data,
        images,
        latitude: position[0],
        longitude: position[1],
        updatedAt: serverTimestamp(),
      });
      router.push("/dashboard/messes");
    } catch (error) {
      console.error("Error updating mess:", error);
      alert("Failed to update mess. Please try again.");
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
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard/messes" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to List
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Edit Mess Listing</h1>
        </div>
        <div className="bg-red-50 p-3 rounded-2xl">
          <Store className="w-8 h-8 text-red-500" />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Mess Name</label>
              <input 
                {...register("name")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all bg-slate-50"
                placeholder="e.g. Annapurna Executive Mess"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea 
                {...register("description")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all bg-slate-50 min-h-[120px]"
                placeholder="Describe your food quality, timings, and specialties..."
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Food Type</label>
              <select 
                {...register("type")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all bg-slate-50"
              >
                <option value="Veg">Veg Only</option>
                <option value="Non-Veg">Non-Veg Only</option>
                <option value="Both">Both Veg & Non-Veg</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Gender Preference</label>
              <select 
                {...register("gender")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all bg-slate-50"
              >
                <option value="Boys">Boys Only</option>
                <option value="Girls">Girls Only</option>
                <option value="Co-ed">Co-ed / Everyone</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Contact Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Pricing & Contact</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Monthly Price (₹)</label>
              <input 
                type="number"
                {...register("monthlyPrice")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all bg-slate-50"
                placeholder="2500"
              />
              {errors.monthlyPrice && <p className="text-red-500 text-xs mt-1">{errors.monthlyPrice.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Daily Plate Price (Optional ₹)</label>
              <input 
                type="number"
                {...register("dailyPrice")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all bg-slate-50"
                placeholder="80"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Contact Number</label>
              <input 
                {...register("contactNumber")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all bg-slate-50"
                placeholder="98XXXXXXXX"
              />
              {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp Number</label>
              <input 
                {...register("whatsappNumber")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all bg-slate-50"
                placeholder="98XXXXXXXX"
              />
              {errors.whatsappNumber && <p className="text-red-500 text-xs mt-1">{errors.whatsappNumber.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Total Capacity (Seats)</label>
              <input 
                type="number"
                {...register("totalSeats")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all bg-slate-50"
                placeholder="50"
              />
              {errors.totalSeats && <p className="text-red-500 text-xs mt-1">{errors.totalSeats.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Available Seats Now</label>
              <input 
                type="number"
                {...register("availableSeats")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all bg-slate-50"
                placeholder="10"
              />
              {errors.availableSeats && <p className="text-red-500 text-xs mt-1">{errors.availableSeats.message}</p>}
            </div>
          </div>
        </div>

        {/* Media Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Mess Photos</h2>
          <ImageUploader 
            onUploadComplete={(urls) => setImages(prev => [...prev, ...urls])}
            folder="messmate/messes"
            maxFiles={10}
          />
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-4">
              {images.map((url, i) => (
                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                  <img src={url} className="w-full h-full object-cover" alt="" />
                  <button 
                    type="button"
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Map Location</h2>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Full Address</label>
            <input 
              {...register("address")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all bg-slate-50 mb-4"
              placeholder="Building name, Street, Area, City..."
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" /> Pinpoint on Map
            </p>
            <MapPicker 
              position={position} 
              onPositionChange={setPosition} 
              className="h-[400px]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/dashboard/messes" className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-900 transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-10 py-3 rounded-xl font-bold shadow-xl shadow-red-500/20 transition-all flex items-center gap-2"
          >
            {saving && <Loader2 className="w-5 h-5 animate-spin" />}
            {saving ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
