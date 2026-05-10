import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadToCloudinary, optimizeCloudinaryUrl } from '@/lib/cloudinary';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploaderProps {
  folder: 'messmate/messes' | 'messmate/reviews' | 'messmate/profiles';
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

export function ImageUploader({ folder, maxFiles = 5, onUploadComplete, existingImages = [] }: ImageUploaderProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [completedUrls, setCompletedUrls] = useState<string[]>(existingImages);

  // Sync with parent state when images change
  useEffect(() => {
    onUploadComplete(completedUrls);
  }, [completedUrls]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Filter out if exceeding max files
    const availableSlots = maxFiles - completedUrls.length - files.length;
    const filesToProcess = acceptedFiles.slice(0, availableSlots);

    if (filesToProcess.length === 0) return;

    const newFiles: UploadingFile[] = filesToProcess.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Upload each file
    const uploadPromises = newFiles.map(async (uploadFile) => {
      try {
        setFiles((prev) => prev.map(f => f.id === uploadFile.id ? { ...f, progress: 30 } : f));
        
        // Simulating upload progress while actual upload happens
        const progressInterval = setInterval(() => {
          setFiles((prev) => prev.map(f => {
            if (f.id === uploadFile.id && f.progress < 90) {
              return { ...f, progress: f.progress + 10 };
            }
            return f;
          }));
        }, 200);

        const url = await uploadToCloudinary(uploadFile.file, folder);
        clearInterval(progressInterval);

        setFiles((prev) => prev.map(f => f.id === uploadFile.id ? { ...f, progress: 100, url } : f));
        return url;
      } catch (error: any) {
        setFiles((prev) => prev.map(f => f.id === uploadFile.id ? { ...f, error: error.message } : f));
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUrls = results
      .filter((url): url is string => url !== null)
      .map(url => optimizeCloudinaryUrl(url));
    
    setCompletedUrls((prev) => {
      const updated = [...prev, ...successfulUrls];
      return updated;
    });

    // Clean up successful uploads from queue
    setTimeout(() => {
      setFiles((prev) => prev.filter(f => f.error));
    }, 2000);

  }, [maxFiles, completedUrls.length, files.length, folder, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: completedUrls.length + files.length >= maxFiles
  });

  const removeCompletedUrl = (urlToRemove: string) => {
    setCompletedUrls((prev) => {
      const updated = prev.filter(url => url !== urlToRemove);
      return updated;
    });
  };

  const removeFailedUpload = (id: string) => {
    setFiles((prev) => prev.filter(f => f.id !== id));
  };

  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center text-center
          ${isDragActive ? 'border-indigo-500 bg-red-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-600'}
          ${completedUrls.length + files.length >= maxFiles ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <UploadCloud className={`w-8 h-8 ${isDragActive ? 'text-red-500' : 'text-slate-600'}`} />
        </div>
        <p className="text-lg font-medium text-slate-900 mb-1">
          {isDragActive ? 'Drop your images here' : 'Click or drag images to upload'}
        </p>
        <p className="text-sm text-slate-600">
          SVG, PNG, JPG or WEBP (max. 5MB). {completedUrls.length + files.length} / {maxFiles} uploaded.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <AnimatePresence>
          {completedUrls.map((url, index) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              key={`completed-${index}`}
              className="relative aspect-square rounded-xl overflow-hidden group bg-white border border-slate-200"
            >
              <img src={url} alt={`Upload ${index}`} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeCompletedUrl(url)}
                  className="bg-red-500 hover:bg-red-600 text-slate-900 p-2 rounded-full transform transition-transform hover:scale-110"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}

          {files.map((file) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              key={file.id}
              className="relative aspect-square rounded-xl overflow-hidden bg-white border border-slate-200"
            >
              <img src={file.preview} alt="Preview" className="w-full h-full object-cover opacity-50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                {file.error ? (
                  <>
                    <X className="w-8 h-8 text-red-500 mb-2" />
                    <span className="text-xs text-red-400 text-center line-clamp-2">{file.error}</span>
                    <button 
                      type="button"
                      onClick={() => removeFailedUpload(file.id)}
                      className="absolute top-1 right-1 bg-slate-100 p-1 rounded-full text-slate-600 hover:text-slate-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-2" />
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${file.progress}%` }}></div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
