import { createClient } from '@/lib/supabase/client';

const BUCKET = 'yvu-assets';

/**
 * Upload a file to Supabase Storage
 * @param {File} file - The file object from input
 * @param {string} folder - Subfolder: 'team', 'events', 'media', 'research'
 * @returns {string} Public URL of the uploaded file
 */
export async function uploadFile(file, folder = 'general') {
  const supabase = createClient();

  const ext = file.name.split('.').pop();
  const timestamp = Date.now();
  const safeName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase()
    .slice(0, 40);
  const path = `${folder}/${timestamp}-${safeName}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Delete a file from Supabase Storage by its public URL
 * @param {string} publicUrl - The full public URL of the file
 */
export async function deleteFile(publicUrl) {
  const supabase = createClient();

  // Extract path after /yvu-assets/
  const marker = `/yvu-assets/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return; // not our file, skip

  const path = publicUrl.slice(idx + marker.length);

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([path]);

  if (error) throw error;
}

/**
 * List all files in a folder
 * @param {string} folder
 */
export async function listFiles(folder = 'general') {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(folder, {
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) throw error;
  return data;
}