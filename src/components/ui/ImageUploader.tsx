"use client";

import React, { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { X, UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface ImageUploaderProps {
  folder: "messmate/messes" | "messmate/reviews" | "messmate/profiles";
  maxFiles?: number;
  onUploadComplete: (urls: string[]) => void;
  existingImages?: string[];
}

interface UploadingFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
  url?: string;
}

export function ImageUploader({
  folder,
  maxFiles = 5,
  onUploadComplete,
  existingImages = [],
}: ImageUploaderProps) {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);

  // Keep a stable ref to onUploadComplete to avoid stale closures
  const onUploadCompleteRef = useRef(onUploadComplete);
  onUploadCompleteRef.current = onUploadComplete;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const available = maxFiles - uploadedUrls.length;
      if (available <= 0) return;
      const filesToProcess = acceptedFiles.slice(0, available);

      const newUploading: UploadingFile[] = filesToProcess.map((file) => ({
        id: Math.random().toString(36).slice(2),
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
      }));

      setUploading((prev) => [...prev, ...newUploading]);

      const results = await Promise.all(
        newUploading.map(async (item) => {
          try {
            // Simulate progress ticks
            const tick = setInterval(() => {
              setUploading((prev) =>
                prev.map((f) =>
                  f.id === item.id && f.progress < 85
                    ? { ...f, progress: f.progress + 15 }
                    : f
                )
              );
            }, 300);

            const url = await uploadToCloudinary(item.file, folder);
            clearInterval(tick);

            setUploading((prev) =>
              prev.map((f) => (f.id === item.id ? { ...f, progress: 100, url } : f))
            );
            return url;
          } catch (err: any) {
            setUploading((prev) =>
              prev.map((f) =>
                f.id === item.id ? { ...f, error: err.message || "Upload failed" } : f
              )
            );
            return null;
          }
        })
      );

      const successUrls = results.filter((u): u is string => !!u);

      if (successUrls.length > 0) {
        setUploadedUrls((prev) => {
          const updated = [...prev, ...successUrls];
          // Call parent callback after state is updated
          setTimeout(() => onUploadCompleteRef.current(updated), 0);
          return updated;
        });
      }

      // Clear finished uploads from the queue after a short delay
      setTimeout(() => {
        setUploading((prev) => prev.filter((f) => !!f.error));
      }, 1500);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [folder, maxFiles, uploadedUrls.length]
  );

  const removeUrl = (url: string) => {
    setUploadedUrls((prev) => {
      const updated = prev.filter((u) => u !== url);
      setTimeout(() => onUploadCompleteRef.current(updated), 0);
      return updated;
    });
  };

  const removeUploading = (id: string) => {
    setUploading((prev) => prev.filter((f) => f.id !== id));
  };

  const isFull = uploadedUrls.length + uploading.filter((f) => !f.error).length >= maxFiles;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxSize: 5 * 1024 * 1024,
    disabled: isFull,
  });

  return (
    <div className="w-full space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all
          ${isDragActive ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-400"}
          ${isFull ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
          <UploadCloud className={`w-6 h-6 ${isDragActive ? "text-red-500" : "text-slate-500"}`} />
        </div>
        <p className="text-sm font-semibold text-slate-800">
          {isDragActive ? "Drop here!" : "Click or drag images to upload"}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          JPG, PNG, WEBP — max 5MB — {uploadedUrls.length}/{maxFiles} uploaded
        </p>
      </div>

      {/* Uploaded images preview */}
      {uploadedUrls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {uploadedUrls.map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-100"
            >
              <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeUrl(url)}
                  className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* In-progress uploads */}
      {uploading.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {uploading.map((f) => (
            <div
              key={f.id}
              className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
            >
              <img src={f.preview} alt="Preview" className="w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                {f.error ? (
                  <>
                    <X className="w-6 h-6 text-red-500 mb-1" />
                    <p className="text-[10px] text-red-400 text-center line-clamp-2">{f.error}</p>
                    <button
                      type="button"
                      onClick={() => removeUploading(f.id)}
                      className="absolute top-1 right-1 bg-white/80 p-1 rounded-full"
                    >
                      <X className="w-3 h-3 text-slate-600" />
                    </button>
                  </>
                ) : f.progress === 100 ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                ) : (
                  <>
                    <Loader2 className="w-7 h-7 text-red-500 animate-spin mb-2" />
                    <div className="w-full bg-white/50 rounded-full h-1">
                      <div
                        className="bg-red-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${f.progress}%` }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
