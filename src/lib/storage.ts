export const STORAGE_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`;

export function productImageUrl(filename: string): string {
  return `${STORAGE_BASE_URL}/product-images/${filename}`;
}

export function documentUrl(path: string): string {
  return `${STORAGE_BASE_URL}/documents/${path}`;
}
