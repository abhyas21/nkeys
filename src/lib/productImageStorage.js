import { isSupabaseConfigured, SUPABASE_PRODUCT_IMAGE_BUCKET, supabase } from "./supabase";

function createUploadFileName(file) {
  const extension = String(file?.name || "").split(".").pop()?.toLowerCase() || "jpg";
  return `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
}

function readFilesAsDataUrls(files) {
  return Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        })
    )
  );
}

async function uploadFileToSupabase(file) {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const filePath = createUploadFileName(file);
  const { error } = await supabase.storage
    .from(SUPABASE_PRODUCT_IMAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(SUPABASE_PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(filePath);

  return String(data?.publicUrl || "").trim();
}

export async function uploadProductImages(files) {
  const fileList = Array.from(files || []).filter(Boolean);
  if (!fileList.length) {
    return {
      urls: [],
      provider: isSupabaseConfigured ? "supabase" : "local"
    };
  }

  if (!isSupabaseConfigured) {
    return {
      urls: await readFilesAsDataUrls(fileList),
      provider: "local"
    };
  }

  const uploadedUrls = [];
  for (const file of fileList) {
    const uploadedUrl = await uploadFileToSupabase(file);
    if (uploadedUrl) {
      uploadedUrls.push(uploadedUrl);
    }
  }

  return {
    urls: uploadedUrls,
    provider: "supabase"
  };
}

export function getProductImageStorageLabel() {
  return isSupabaseConfigured
    ? `Supabase storage bucket (${SUPABASE_PRODUCT_IMAGE_BUCKET})`
    : "Local demo fallback";
}

export function hasRemoteProductImageStorage() {
  return isSupabaseConfigured;
}
