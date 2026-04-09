import { Upload } from "tus-js-client";
import {
  isSupabaseConfigured,
  SUPABASE_ANON_KEY,
  SUPABASE_PRODUCT_IMAGE_BUCKET,
  SUPABASE_STORAGE_RESUMABLE_URL,
  supabase
} from "./supabase";

const RESUMABLE_UPLOAD_THRESHOLD_BYTES = 6 * 1024 * 1024;
const RESUMABLE_UPLOAD_CHUNK_SIZE_BYTES = 6 * 1024 * 1024;
const RESUMABLE_RETRY_DELAYS = [0, 3000, 5000, 10000, 20000];

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

function getSupabasePublicUrl(filePath) {
  const { data } = supabase.storage
    .from(SUPABASE_PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(filePath);

  return String(data?.publicUrl || "").trim();
}

async function uploadFileToSupabaseStandard(file, filePath) {
  const { error } = await supabase.storage
    .from(SUPABASE_PRODUCT_IMAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (error) {
    throw error;
  }
}

async function uploadFileToSupabaseResumable(file, filePath) {
  if (!SUPABASE_STORAGE_RESUMABLE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase resumable upload is not configured");
  }

  await new Promise((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint: SUPABASE_STORAGE_RESUMABLE_URL,
      retryDelays: RESUMABLE_RETRY_DELAYS,
      headers: {
        authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
        "x-upsert": "false"
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      chunkSize: RESUMABLE_UPLOAD_CHUNK_SIZE_BYTES,
      metadata: {
        bucketName: SUPABASE_PRODUCT_IMAGE_BUCKET,
        objectName: filePath,
        contentType: file.type || "application/octet-stream",
        cacheControl: "3600"
      },
      onError: reject,
      onSuccess: resolve
    });

    upload
      .findPreviousUploads()
      .then((previousUploads) => {
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }

        upload.start();
      })
      .catch(reject);
  });
}

async function uploadFileToSupabase(file) {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const supportsLargeUploadFlow = Number(file?.size) > RESUMABLE_UPLOAD_THRESHOLD_BYTES;

  if (supportsLargeUploadFlow) {
    const resumableFilePath = createUploadFileName(file);

    try {
      await uploadFileToSupabaseResumable(file, resumableFilePath);
      return getSupabasePublicUrl(resumableFilePath);
    } catch {
      const standardFallbackPath = createUploadFileName(file);
      await uploadFileToSupabaseStandard(file, standardFallbackPath);
      return getSupabasePublicUrl(standardFallbackPath);
    }
  }

  const filePath = createUploadFileName(file);
  await uploadFileToSupabaseStandard(file, filePath);
  return getSupabasePublicUrl(filePath);
}

export async function uploadProductImages(files) {
  const fileList = Array.from(files || []).filter(Boolean);
  if (!fileList.length) {
    return {
      urls: [],
      provider: isSupabaseConfigured ? "supabase" : "local",
      warning: ""
    };
  }

  if (!isSupabaseConfigured) {
    return {
      urls: await readFilesAsDataUrls(fileList),
      provider: "local",
      warning: ""
    };
  }

  try {
    const uploadedUrls = [];
    for (const file of fileList) {
      const uploadedUrl = await uploadFileToSupabase(file);
      if (uploadedUrl) {
        uploadedUrls.push(uploadedUrl);
      }
    }

    return {
      urls: uploadedUrls,
      provider: "supabase",
      warning: ""
    };
  } catch (error) {
    console.warn("Product images could not be uploaded to Supabase storage. Falling back to local image data.", error);

    return {
      urls: await readFilesAsDataUrls(fileList),
      provider: "local",
      warning: String(error?.message || "").trim()
    };
  }
}

export function getProductImageStorageLabel() {
  return isSupabaseConfigured
    ? `Supabase storage bucket (${SUPABASE_PRODUCT_IMAGE_BUCKET})`
    : "Local demo fallback";
}

export function hasRemoteProductImageStorage() {
  return isSupabaseConfigured;
}
