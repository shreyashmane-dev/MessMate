/**
 * Uploads an image file to Cloudinary and returns the secure URL.
 * Uses the unauthenticated upload preset configured in Cloudinary.
 */
export async function uploadToCloudinary(file: File, folder: string = "messmate/general"): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration is missing in environment variables.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  // Note: f_auto and q_auto are applied when rendering the image,
  // but if the preset allows it, we can pass transformation string
  // It's usually better to just use the returned secure_url and append transformations when displaying,
  // or configure it in the Cloudinary dashboard for the preset.

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to upload image to Cloudinary");
  }

  const data = await response.json();
  return data.secure_url;
}

/**
 * Optimizes a Cloudinary secure_url by injecting q_auto and f_auto.
 * Example: https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg 
 * -> https://res.cloudinary.com/demo/image/upload/q_auto,f_auto/v1234/sample.jpg
 */
export function optimizeCloudinaryUrl(url: string): string {
  if (!url || !url.includes("cloudinary.com/v1_1/") && !url.includes("cloudinary.com/")) return url;
  
  // Check if it already has transformations
  if (url.includes("/upload/q_auto") || url.includes("/upload/f_auto")) {
    return url;
  }

  return url.replace("/upload/", "/upload/q_auto,f_auto,w_auto,dpr_auto/");
}
