/**
 * Seeds the real Supabase database with the catalog content that currently
 * lives in src/lib/mock/catalog.ts (scraped from armeringsmaskiner.se with
 * the site owner's permission). Safe to re-run — clears catalog tables
 * first, in FK-dependency order, before re-inserting.
 *
 * Does NOT touch inquiries/orders/customers (real lead data) or the
 * pricing engine tables (product_cost_inputs/pricing_settings/resellers —
 * those are seeded separately once Per approves the Excel model mapping).
 */
import { db } from '../src/lib/db';
import * as schema from '../src/lib/db/schema';
import { brandDocuments, brands, categories, products } from '../src/lib/mock/catalog';

async function main() {
  console.log('Clearing existing catalog data...');
  await db.delete(schema.documents);
  await db.delete(schema.accessories);
  await db.delete(schema.productCapacity);
  await db.delete(schema.productSpecs);
  await db.delete(schema.productImages);
  await db.delete(schema.products);
  await db.delete(schema.categories);
  await db.delete(schema.brands);

  console.log('Seeding brands...');
  const brandIdBySlug = new Map<string, string>();
  for (const brand of brands) {
    const [row] = await db
      .insert(schema.brands)
      .values({
        slug: brand.slug,
        name: brand.name,
        description: brand.description,
        logoUrl: brand.logoUrl,
      })
      .returning({ id: schema.brands.id });
    brandIdBySlug.set(brand.slug, row.id);
  }

  console.log('Seeding categories...');
  const categoryIdBySlug = new Map<string, string>();
  for (const category of categories) {
    const [row] = await db
      .insert(schema.categories)
      .values({
        slug: category.slug,
        name: category.name,
        description: category.description,
        metaTitle: category.metaTitle,
        metaDescription: category.metaDescription,
      })
      .returning({ id: schema.categories.id });
    categoryIdBySlug.set(category.slug, row.id);
  }

  console.log(`Seeding ${products.length} products...`);
  const productIdBySlug = new Map<string, string>();
  for (const product of products) {
    const [row] = await db
      .insert(schema.products)
      .values({
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        brandId: brandIdBySlug.get(product.brand.slug)!,
        categoryId: categoryIdBySlug.get(product.category.slug)!,
        shortDescription: product.shortDescription,
        description: product.description,
        powerWatts: product.powerWatts,
        voltage: product.voltage,
        driveType: product.driveType,
        weightKg: product.weightKg,
        dimensionsLengthMm: product.dimensionsLengthMm,
        dimensionsWidthMm: product.dimensionsWidthMm,
        dimensionsHeightMm: product.dimensionsHeightMm,
        priceExVat: product.priceExVat,
        currency: product.currency,
        stockStatus: product.stockStatus,
        isPublished: product.isPublished,
        isFeatured: product.isFeatured,
      })
      .returning({ id: schema.products.id });
    productIdBySlug.set(product.slug, row.id);
  }

  console.log('Seeding images, specs, capacity, accessories, documents...');
  for (const product of products) {
    const productId = productIdBySlug.get(product.slug)!;

    if (product.images.length > 0) {
      await db.insert(schema.productImages).values(
        product.images.map((image, i) => ({
          productId,
          url: image.url,
          altText: image.altText,
          isPrimary: i === 0,
          sortOrder: image.sortOrder,
        })),
      );
    }

    if (product.specs.length > 0) {
      await db.insert(schema.productSpecs).values(
        product.specs.map((spec) => ({
          productId,
          specKey: spec.specKey,
          specValue: spec.specValue,
          sortOrder: spec.sortOrder,
        })),
      );
    }

    if (product.capacity.length > 0) {
      await db.insert(schema.productCapacity).values(
        product.capacity.map((row) => ({
          productId,
          barDiameterMm: row.barDiameterMm,
          maxQtySimultaneous: row.maxQtySimultaneous,
          sortOrder: row.sortOrder,
        })),
      );
    }

    if (product.accessories.length > 0) {
      await db.insert(schema.accessories).values(
        product.accessories.map((accessory) => ({
          productId,
          name: accessory.name,
          description: accessory.description,
          quantityIncluded: accessory.quantityIncluded,
        })),
      );
    }

    if (product.documents.length > 0) {
      await db.insert(schema.documents).values(
        product.documents.map((doc) => ({
          productId,
          title: doc.title,
          fileUrl: doc.fileUrl,
          docType: doc.docType,
          language: doc.language,
        })),
      );
    }
  }

  console.log(`Seeding ${brandDocuments.length} brand-level documents...`);
  for (const doc of brandDocuments) {
    const brandSlug = doc.id.startsWith('doc-gms-')
      ? 'gms'
      : doc.id.startsWith('doc-ogura-')
        ? 'ogura'
        : null;
    if (!brandSlug) {
      console.warn(`Skipping brand document with unrecognized id: ${doc.id}`);
      continue;
    }
    await db.insert(schema.documents).values({
      brandId: brandIdBySlug.get(brandSlug)!,
      title: doc.title,
      fileUrl: doc.fileUrl,
      docType: doc.docType,
      language: doc.language,
    });
  }

  console.log('Seed complete.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
