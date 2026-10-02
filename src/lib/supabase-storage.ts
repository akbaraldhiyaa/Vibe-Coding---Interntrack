import { createClient, SupabaseClient } from "@supabase/supabase-js";

function getSupabaseProjectUrl(): string {
  if (process.env.SUPABASE_URL) return process.env.SUPABASE_URL;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) return process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Fallback: extract project ref from DATABASE_URL if available
  if (process.env.DATABASE_URL) {
    try {
      const parsed = new URL(process.env.DATABASE_URL);
      const userRef = parsed.username.split(".")[1];
      if (userRef) {
        return `https://${userRef}.supabase.co`;
      }
    } catch {
      // ignore
    }
  }

  return "";
}

function getSupabaseKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

let supabaseAdminClient: SupabaseClient | null = null;

export function getSupabaseStorageClient(): SupabaseClient | null {
  if (supabaseAdminClient) return supabaseAdminClient;

  const url = getSupabaseProjectUrl();
  const key = getSupabaseKey();

  if (!url || !key) {
    return null;
  }

  supabaseAdminClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseAdminClient;
}

const AVATAR_BUCKET = "avatars";

/**
 * Ensures the 'avatars' bucket exists in Supabase Storage.
 * Creates it as a public bucket with appropriate file restrictions if missing.
 */
export async function ensureAvatarBucketExists(): Promise<boolean> {
  const client = getSupabaseStorageClient();
  if (!client) return false;

  try {
    const { data: bucket, error: getError } = await client.storage.getBucket(AVATAR_BUCKET);
    if (bucket && !getError) {
      return true;
    }

    // Attempt bucket creation
    const { error: createError } = await client.storage.createBucket(AVATAR_BUCKET, {
      public: true,
      fileSizeLimit: 2 * 1024 * 1024, // 2MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    });

    if (createError && !createError.message?.toLowerCase().includes("already exists")) {
      console.error("[supabase-storage] createBucket error:", createError);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[supabase-storage] ensureAvatarBucketExists error:", err);
    return false;
  }
}

/**
 * Uploads user avatar to Supabase Storage under `avatars/{userId}/{unique-filename}`.
 */
export async function uploadAvatarToStorage(
  userId: string,
  buffer: Buffer,
  mimeType: string,
  extension: string
): Promise<{ success: boolean; avatarUrl?: string; path?: string; error?: string }> {
  const client = getSupabaseStorageClient();
  if (!client) {
    return {
      success: false,
      error: "Konfigurasi Supabase Storage belum lengkap (SUPABASE_SERVICE_ROLE_KEY diperlukan).",
    };
  }

  // Ensure bucket is available
  await ensureAvatarBucketExists();

  const cleanExt = extension.replace(/^\./, "");
  const filename = `avatar-${Date.now()}.${cleanExt}`;
  const storagePath = `${userId}/${filename}`;

  try {
    const { error: uploadError } = await client.storage
      .from(AVATAR_BUCKET)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("[supabase-storage] Upload failed:", uploadError);
      return { success: false, error: uploadError.message || "Gagal mengunggah foto ke storage." };
    }

    const { data: urlData } = client.storage.from(AVATAR_BUCKET).getPublicUrl(storagePath);
    if (!urlData?.publicUrl) {
      return { success: false, error: "Gagal mendapatkan URL publik avatar." };
    }

    return {
      success: true,
      avatarUrl: urlData.publicUrl,
      path: storagePath,
    };
  } catch (err: any) {
    console.error("[supabase-storage] uploadAvatarToStorage exception:", err);
    return { success: false, error: err?.message || "Terjadi kesalahan saat mengunggah foto." };
  }
}

/**
 * Deletes an avatar from Supabase Storage, verifying it belongs to the authenticated user.
 */
export async function deleteAvatarFromStorage(
  avatarUrlOrPath: string | null | undefined,
  userId: string
): Promise<boolean> {
  if (!avatarUrlOrPath) return true;

  const client = getSupabaseStorageClient();
  if (!client) return false;

  try {
    let relativePath = "";

    if (avatarUrlOrPath.includes(`/storage/v1/object/public/${AVATAR_BUCKET}/`)) {
      const parts = avatarUrlOrPath.split(`/storage/v1/object/public/${AVATAR_BUCKET}/`);
      relativePath = parts[1] || "";
    } else if (avatarUrlOrPath.startsWith(`${userId}/`)) {
      relativePath = avatarUrlOrPath;
    }

    // Security check: Must strictly belong to the authenticated user's directory
    if (!relativePath || !relativePath.startsWith(`${userId}/`)) {
      console.warn("[supabase-storage] Refusing to delete avatar path not owned by user:", relativePath);
      return false;
    }

    const { error } = await client.storage.from(AVATAR_BUCKET).remove([relativePath]);
    if (error) {
      console.warn("[supabase-storage] Failed to delete old avatar file:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.warn("[supabase-storage] deleteAvatarFromStorage error:", err);
    return false;
  }
}
