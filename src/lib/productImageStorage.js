import { isSupabaseConfigured, supabase, SUPABASE_PRODUCT_IMAGE_BUCKET } from "./supabase";

export function hasRemoteProductImageStorage() {
  return isSupabaseConfigured;
}

export function getProductImageStorageLabel() {
  return isSupabaseConfigured ? "Supabase Bucket" : "Local Browser Storage";
}

export async function uploadProductImages(files) {
  if (!files || !files.length) {
    return { urls: [], provider: "none", warning: "" };
  }

  // Fallback to local Data URLs if Supabase is not set up
  if (!isSupabaseConfigured || !supabase) {
    const urls = await Promise.all(
      files.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
      })
    );
    return { urls, provider: "local", warning: "Supabase not configured. Images saved locally." };
  }

  // Upload to Supabase Storage
  const urls = [];
  for (const file of files) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 10)}-${Date.now()}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { error } = await supabase.storage
      .from(SUPABASE_PRODUCT_IMAGE_BUCKET)
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from(SUPABASE_PRODUCT_IMAGE_BUCKET)
      .getPublicUrl(filePath);

    urls.push(data.publicUrl);
  }

  return { urls, provider: "supabase", warning: "" };
}