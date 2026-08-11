/**
 * One-time migration: uploads the staged local files in
 * public/images/products and public/documents/{gms,ogura} to real Supabase
 * Storage buckets (product-images, documents), both public.
 *
 * Usage: pnpm exec tsx --env-file=.env.local scripts/migrate-storage.ts
 */
import { readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const CONTENT_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.pdf': 'application/pdf',
};

async function ensureBucket(supabase: SupabaseClient, name: string): Promise<void> {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((b) => b.name === name)) return;

  const { error } = await supabase.storage.createBucket(name, { public: true });
  if (error) throw new Error(`Failed to create bucket "${name}": ${error.message}`);
  console.log(`Created bucket: ${name}`);
}

async function uploadDir(
  supabase: SupabaseClient,
  bucket: string,
  localDir: string,
  pathPrefix = '',
): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};
  const entries = readdirSync(localDir, { withFileTypes: true });

  for (const entry of entries) {
    const localPath = join(localDir, entry.name);

    if (entry.isDirectory()) {
      const nested = await uploadDir(supabase, bucket, localPath, `${pathPrefix}${entry.name}/`);
      Object.assign(urls, nested);
      continue;
    }

    const storagePath = `${pathPrefix}${entry.name}`;
    const contentType =
      CONTENT_TYPES[extname(entry.name).toLowerCase()] ?? 'application/octet-stream';
    const fileBuffer = readFileSync(localPath);

    const { error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, fileBuffer, { contentType, upsert: true });

    if (error) {
      console.error(`Failed to upload ${storagePath}:`, error.message);
      continue;
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    urls[storagePath] = publicUrlData.publicUrl;
    console.log(`Uploaded: ${bucket}/${storagePath}`);
  }

  return urls;
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  await ensureBucket(supabase, 'product-images');
  await ensureBucket(supabase, 'documents');

  const imageUrls = await uploadDir(
    supabase,
    'product-images',
    join(__dirname, '../public/images/products'),
  );
  const documentUrls = await uploadDir(
    supabase,
    'documents',
    join(__dirname, '../public/documents'),
  );

  console.log(
    `\nUploaded ${Object.keys(imageUrls).length} images, ${Object.keys(documentUrls).length} documents.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
