import sharp from "sharp";
import { getSupabaseServer } from "@/lib/supabase";

const BUCKET = "ticket-attachments";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_DIMENSION = 2048; // Max width or height in pixels
const WEBP_QUALITY = 88; // Balance of size vs visual quality

export function isAllowedImage(file: File): boolean {
  return (
    ALLOWED_TYPES.includes(file.type) &&
    file.size <= MAX_FILE_SIZE
  );
}

/** Optimize image for storage: resize, compress, strip metadata. Outputs WebP for best quality/size ratio. */
async function optimizeImage(
  file: File
): Promise<{ buffer: Buffer; contentType: string; extension: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  const metadata = await sharp(inputBuffer).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const needsResize = width > MAX_DIMENSION || height > MAX_DIMENSION;
  const isAnimated = (metadata.pages ?? 1) > 1 || file.type === "image/gif";

  let pipeline = sharp(inputBuffer, { animated: isAnimated }).rotate(); // Auto-orient from EXIF
  if (needsResize) {
    pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside" });
  }
  const buffer = await pipeline
    .webp({ quality: WEBP_QUALITY, effort: isAnimated ? 2 : 4 })
    .toBuffer();

  return {
    buffer,
    contentType: "image/webp",
    extension: "webp",
  };
}

export async function ensureBucketExists() {
  const supabase = getSupabaseServer();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    await supabase.storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: MAX_FILE_SIZE,
      allowedMimeTypes: ALLOWED_TYPES,
    });
  }
}

export async function uploadTicketAttachment(
  ticketId: string,
  file: File,
  userId: string,
  options?: { replyId?: string; internalNoteId?: string }
): Promise<{ path: string } | { error: string }> {
  if (!isAllowedImage(file)) {
    return { error: "Invalid file. Only JPEG, PNG, GIF, WebP up to 5MB allowed." };
  }

  const supabase = getSupabaseServer();
  await ensureBucketExists();

  let uploadBuffer: Buffer;
  let contentType: string;
  let ext: string;

  try {
    const optimized = await optimizeImage(file);
    uploadBuffer = optimized.buffer;
    contentType = optimized.contentType;
    ext = optimized.extension;
  } catch (err) {
    console.error("Image optimization failed:", err);
    return { error: "Failed to process image. Please try another file." };
  }

  const safeName = `${crypto.randomUUID()}.${ext}`;
  const path = `${ticketId}/${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, uploadBuffer, {
      contentType,
      upsert: false,
    });

  if (error) return { error: error.message };

  const { error: dbError } = await supabase.from("ticket_attachments").insert({
    ticket_id: ticketId,
    reply_id: options?.replyId ?? null,
    internal_note_id: options?.internalNoteId ?? null,
    file_path: path,
    file_name: file.name,
    content_type: contentType,
    uploaded_by: userId,
  });

  if (dbError) {
    await supabase.storage.from(BUCKET).remove([path]);
    return { error: dbError.message };
  }

  return { path };
}

/** Generate a signed URL for viewing a private attachment (expires in 1 hour). */
export async function getAttachmentUrl(filePath: string): Promise<string | null> {
  const supabase = getSupabaseServer();
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 3600);
  return data?.signedUrl ?? null;
}
