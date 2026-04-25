import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function createResumableUploadUrl(urlValue) {
  if (!urlValue) {
    return "";
  }

  try {
    const url = new URL(urlValue);
    const hostname = url.hostname.endsWith(".supabase.co")
      ? url.hostname.replace(".supabase.co", ".storage.supabase.co")
      : url.hostname;
    return `${url.protocol}//${hostname}/storage/v1/upload/resumable`;
  } catch {
    return "";
  }
}

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;

export const SUPABASE_PRODUCT_IMAGE_BUCKET =
  import.meta.env.VITE_SUPABASE_PRODUCT_IMAGE_BUCKET || "product-images";
export const SUPABASE_STORAGE_RESUMABLE_URL = createResumableUploadUrl(supabaseUrl);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

export function getDataBackendLabel() {
  return isSupabaseConfigured ? "Supabase shared backend" : "Local demo storage";
}
