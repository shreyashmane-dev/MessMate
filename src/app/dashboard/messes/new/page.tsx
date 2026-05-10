"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/store/useAuthStore";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { MapPicker } from "@/components/ui/MapPicker";
import { Loader2, ArrowLeft, Navigation } from "lucide-react";
import Link from "next/link";

const messSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  type: z.enum(["Veg", "Non-Veg", "Both"]),
  gender: z.enum(["Boys", "Girls", "Co-ed"]),
  monthlyPrice: z.coerce.number().min(500, "Must be at least 500"),
  dailyPrice: z.coerce.number().min(20, "Must be at least 20").optional(),
  contactNumber: z.string().min(10, "Valid phone number required"),
  whatsappNumber: z.string().optional(),
  address: z.string().min(10, "Detailed address is required"),
  description: z.string().min(20, "Add a good description for students").max(500),
  totalSeats: z.coerce.number().min(1, "Total seats must be at least 1"),
  availableSeats: z.coerce.number().min(0, "Available seats cannot be negative"),
});

interface MessFormValues {
  name: string;
  type: "Veg" | "Non-Veg" | "Both";
  gender: "Boys" | "Girls" | "Co-ed";
  monthlyPrice: number;
  dailyPrice?: number;
  contactNumber: string;
  whatsappNumber?: string;
  address: string;
  description: string;
  totalSeats: number;
  availableSeats: number;
}

export default function AddNewMess() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  // Default to a central location, e.g., New Delhi
  const [position, setPosition] = useState<[number, number]>([16.7050, 74.2433]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<MessFormValues>({
    resolver: zodResolver(messSchema) as any,
    defaultValues: {
      type: "Both",
      gender: "Co-ed",
    }
  });

  const onSubmit = async (data: MessFormValues) => {
    if (images.length === 0) {
      setError("Please upload at least one image of your mess");
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      // Check for duplicate name
      const q = query(collection(db, "messes"), where("name", "==", data.name));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setError("A mess with this name already exists. Please use a unique name.");
        setIsSubmitting(false);
        return;
      }

      await addDoc(collection(db, "messes"), {
        ownerId: user?.uid,
        name: data.name,
        type: data.type,
        gender: data.gender,
        monthlyPrice: data.monthlyPrice,
        dailyPrice: data.dailyPrice || null,
        contactNumber: data.contactNumber,
        whatsappNumber: data.whatsappNumber || data.contactNumber,
        address: data.address,
        latitude: position[0],
        longitude: position[1],
        description: data.description,
        totalSeats: data.totalSeats,
        availableSeats: data.availableSeats,
        images,
        facilities: [], // Can be added later
        rating: 0,
        totalReviews: 0,
        verified: false,
        featured: false,
        createdAt: serverTimestamp(),
      });

      router.push("/dashboard/messes");
    } catch (err: any) {
      setError(err.message || "Failed to create mess listing");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>
      
      <h1 className="text-3xl font-bold text-slate-900 mb-2">List Your Mess</h1>
      <p className="text-slate-600 mb-8">Fill in the details below to publish your mess on the platform.</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-8">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="glass p-8 rounded-3xl border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Basic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-2">Mess Name</label>
              <input 
                {...register("name")}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none"
                placeholder="e.g. Annapurna Student Mess"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Food Type</label>
              <select 
                {...register("type")}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none"
              >
                <option value="Veg">Pure Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Both">Both</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Gender Category</label>
              <select 
                {...register("gender")}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none"
              >
                <option value="Boys">Boys Only</option>
                <option value="Girls">Girls Only</option>
                <option value="Co-ed">Co-ed / Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Monthly Price (₹)</label>
              <input 
                type="number"
                {...register("monthlyPrice", { valueAsNumber: true })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none"
                placeholder="e.g. 3500"
              />
              {errors.monthlyPrice && <p className="text-red-400 text-xs mt-1">{errors.monthlyPrice.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Daily Price (₹) - Optional</label>
              <input 
                type="number"
                {...register("dailyPrice", { valueAsNumber: true })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none"
                placeholder="e.g. 150"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Total Capacity (Seats)</label>
              <input 
                type="number"
                {...register("totalSeats", { valueAsNumber: true })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none"
                placeholder="e.g. 50"
              />
              {errors.totalSeats && <p className="text-red-400 text-xs mt-1">{errors.totalSeats.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Available Seats Now</label>
              <input 
                type="number"
                {...register("availableSeats", { valueAsNumber: true })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none"
                placeholder="e.g. 10"
              />
              {errors.availableSeats && <p className="text-red-400 text-xs mt-1">{errors.availableSeats.message}</p>}
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Contact & Location</h2>
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Contact Number</label>
                <input 
                  {...register("contactNumber")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none"
                  placeholder="10 digit mobile number"
                />
                {errors.contactNumber && <p className="text-red-400 text-xs mt-1">{errors.contactNumber.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">WhatsApp Number (Optional)</label>
                <input 
                  {...register("whatsappNumber")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none"
                  placeholder="Defaults to contact number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Full Address</label>
              <textarea 
                {...register("address")}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none resize-none"
                placeholder="Complete address including landmarks"
              />
              {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Description</label>
              <textarea 
                {...register("description")}
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none resize-none"
                placeholder="Tell students about your mess, hygiene standards, special items, etc."
              />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900">Pinpoint Location on Map</label>
                  <p className="text-xs text-slate-600 mt-1">Drag the marker to your exact mess location.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((pos) => {
                        setPosition([pos.coords.latitude, pos.coords.longitude]);
                      });
                    }
                  }}
                  className="flex items-center gap-2 text-xs font-medium bg-slate-100 hover:bg-slate-700 text-slate-900 px-3 py-2 rounded-lg transition-colors"
                >
                  <Navigation className="w-3 h-3" />
                  Use Current Location
                </button>
              </div>
              <MapPicker position={position} onPositionChange={setPosition} />
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-slate-200">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Mess Photos</h2>
            <p className="text-sm text-slate-600">Upload clear, well-lit photos of the dining area and food. First photo will be the cover image.</p>
          </div>
          
          <ImageUploader 
            folder="messmate/messes" 
            maxFiles={5}
            onUploadComplete={(urls) => setImages(urls)}
            existingImages={images}
          />
        </div>

        <div className="flex justify-end gap-4">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-full text-slate-900 font-medium hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="bg-red-500 hover:bg-red-600 text-slate-900 px-8 py-3 rounded-full font-medium shadow-lg shadow-red-500/20 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Publishing..." : "Publish Mess"}
          </button>
        </div>
      </form>
    </div>
  );
}
