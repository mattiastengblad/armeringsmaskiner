'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  accessoryRowSchema,
  capacityRowSchema,
  documentRowSchema,
  productBaseSchema,
  specRowSchema,
  type AccessoryRow,
  type CapacityRow,
  type DocumentRow,
  type ProductBaseValues,
  type SpecRow,
} from '@/lib/validation/product';

export interface CreateProductInput {
  base: ProductBaseValues;
  specs: SpecRow[];
  capacity: CapacityRow[];
  accessories: AccessoryRow[];
  images: File[];
  documents: { file: File; meta: DocumentRow }[];
}

export interface CreateProductResult {
  success: boolean;
  error?: string;
  productId?: string;
}

async function uploadToStorage(bucket: string, path: string, file: File): Promise<string> {
  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) throw new Error(`Uppladdning misslyckades (${file.name}): ${error.message}`);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function createProduct(input: CreateProductInput): Promise<CreateProductResult> {
  await requireAdmin();

  const base = productBaseSchema.safeParse(input.base);
  if (!base.success) {
    return { success: false, error: base.error.issues.map((i) => i.message).join(', ') };
  }
  const data = base.data;

  const specs = specRowSchema.array().parse(input.specs);
  const capacity = capacityRowSchema.array().parse(input.capacity);
  const accessories = accessoryRowSchema.array().parse(input.accessories);
  for (const doc of input.documents) {
    documentRowSchema.parse(doc.meta);
  }

  const existingSku = await db.query.products.findFirst({
    where: (products, { eq }) => eq(products.sku, data.sku),
  });
  if (existingSku) {
    return { success: false, error: `Artikelnumret "${data.sku}" används redan.` };
  }
  const existingSlug = await db.query.products.findFirst({
    where: (products, { eq }) => eq(products.slug, data.slug),
  });
  if (existingSlug) {
    return { success: false, error: `Slugen "${data.slug}" används redan.` };
  }

  const [product] = await db
    .insert(schema.products)
    .values({
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      brandId: data.brandId,
      categoryId: data.categoryId,
      shortDescription: data.shortDescription ?? null,
      description: data.description ?? null,
      powerWatts: data.powerWatts ?? null,
      voltage: data.voltage ?? null,
      driveType: data.driveType ?? null,
      weightKg: data.weightKg != null ? String(data.weightKg) : null,
      dimensionsLengthMm: data.dimensionsLengthMm ?? null,
      dimensionsWidthMm: data.dimensionsWidthMm ?? null,
      dimensionsHeightMm: data.dimensionsHeightMm ?? null,
      priceExVat: data.priceExVat != null ? String(data.priceExVat) : null,
      stockStatus: data.stockStatus,
      isPublished: data.isPublished,
      isFeatured: data.isFeatured,
    })
    .returning({ id: schema.products.id });

  const productId = product.id;

  try {
    const images = input.images.filter((file) => file.size > 0);
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${data.slug}-${Date.now()}-${i}.${ext}`;
      const url = await uploadToStorage('product-images', path, file);
      await db.insert(schema.productImages).values({
        productId,
        url,
        altText: `${data.name} – produktbild`,
        isPrimary: i === 0,
        sortOrder: i,
      });
    }

    const documents = input.documents.filter((doc) => doc.file.size > 0);
    for (const doc of documents) {
      const path = `${data.slug}/${doc.file.name}`;
      const url = await uploadToStorage('documents', path, doc.file);
      await db.insert(schema.documents).values({
        productId,
        title: doc.meta.title,
        fileUrl: url,
        docType: doc.meta.docType,
        language: doc.meta.language,
      });
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Uppladdning misslyckades.',
      productId,
    };
  }

  if (specs.length > 0) {
    await db.insert(schema.productSpecs).values(
      specs.map((spec, i) => ({
        productId,
        specKey: spec.specKey,
        specValue: spec.specValue,
        sortOrder: i,
      })),
    );
  }

  if (capacity.length > 0) {
    await db.insert(schema.productCapacity).values(
      capacity.map((row, i) => ({
        productId,
        barDiameterMm: String(row.barDiameterMm),
        maxQtySimultaneous: row.maxQtySimultaneous,
        sortOrder: i,
      })),
    );
  }

  if (accessories.length > 0) {
    await db.insert(schema.accessories).values(
      accessories.map((accessory, i) => ({
        productId,
        name: accessory.name,
        quantityIncluded: accessory.quantityIncluded,
        sortOrder: i,
      })),
    );
  }

  revalidatePath('/admin/produkter');
  revalidatePath('/produkter');

  return { success: true, productId };
}
