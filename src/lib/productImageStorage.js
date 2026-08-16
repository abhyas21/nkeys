import { isSupabaseConfigured, supabase, SUPABASE_PRODUCT_IMAGE_BUCKET } from "./supabase";

export function hasRemoteProductImageStorage() {
  return isSupabaseConfigured;
}

export function getProductImageStorageLabel() {
  return isSupabaseConfigured ? "Supabase Bucket" : "Local Browser Storage";
}

export function dataUrlToFile(dataUrl, filename = "image.png") {
  try {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/png";
    const bstr = atob(arr[1] || "");
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (e) {
    console.warn("dataUrlToFile conversion error:", e);
    return null;
  }
}

export async function uploadProductImages(files) {
  if (!files || !files.length) {
    return { urls: [], provider: "none", warning: "" };
  }

  // Keep local demo mode independent from Supabase storage policies.
  if (import.meta.env.VITE_DEMO_ADMIN === "true" || !isSupabaseConfigured || !supabase) {
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

  try {
    const urls = [];
    for (const file of files) {
      const fileExt = file.name.split('.').pop() || "png";
      const fileName = `${Math.random().toString(36).substring(2, 10)}-${Date.now()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;
      const { error } = await supabase.storage.from(SUPABASE_PRODUCT_IMAGE_BUCKET).upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from(SUPABASE_PRODUCT_IMAGE_BUCKET).getPublicUrl(filePath);
      urls.push(data.publicUrl);
    }
    return { urls, provider: "supabase", warning: "" };
  } catch (error) {
    console.warn("Supabase storage upload error, falling back to data URL:", error);
    const urls = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          })
      )
    );
    return { urls, provider: "local", warning: error?.message || "Supabase storage is unavailable." };
  }
}

export async function processImageSource(urlOrDataUrl) {
  if (!urlOrDataUrl) return "/hero-keychain.svg";

  if (typeof urlOrDataUrl === "string" && urlOrDataUrl.startsWith("data:image/")) {
    try {
      const file = dataUrlToFile(urlOrDataUrl, `prod-img-${Date.now()}.png`);
      if (file) {
        const { urls } = await uploadProductImages([file]);
        if (urls && urls.length > 0 && !urls[0].startsWith("data:image/")) {
          return urls[0];
        }
      }
    } catch (err) {
      console.warn("Upload base64 image failed, keeping data URL:", err);
    }
    return urlOrDataUrl;
  }

  return urlOrDataUrl;
}
