import { and, asc, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { computePricing, type PricingSettings } from '@/lib/pricing';
import type {
  Accessory,
  Brand,
  Category,
  DocumentItem,
  ProductCapacityRow,
  ProductDetail,
  ProductImage,
  ProductSpec,
  ProductSummary,
} from '@/lib/types';

function toCategoryRef(
  category: typeof schema.categories.$inferSelect,
): Pick<Category, 'slug' | 'name'> {
  return { slug: category.slug, name: category.name };
}

function toBrandRef(brand: typeof schema.brands.$inferSelect): Pick<Brand, 'slug' | 'name'> {
  return { slug: brand.slug, name: brand.name };
}

function toImage(image: typeof schema.productImages.$inferSelect): ProductImage {
  return { id: image.id, url: image.url, altText: image.altText, sortOrder: image.sortOrder };
}

function toSpec(spec: typeof schema.productSpecs.$inferSelect): ProductSpec {
  return {
    id: spec.id,
    specKey: spec.specKey,
    specValue: spec.specValue,
    sortOrder: spec.sortOrder,
  };
}

function toCapacity(row: typeof schema.productCapacity.$inferSelect): ProductCapacityRow {
  return {
    id: row.id,
    barDiameterMm: row.barDiameterMm,
    maxQtySimultaneous: row.maxQtySimultaneous,
    sortOrder: row.sortOrder,
  };
}

function toAccessory(accessory: typeof schema.accessories.$inferSelect): Accessory {
  return {
    id: accessory.id,
    name: accessory.name,
    description: accessory.description,
    quantityIncluded: accessory.quantityIncluded,
  };
}

function toDocument(doc: typeof schema.documents.$inferSelect): DocumentItem {
  return {
    id: doc.id,
    title: doc.title,
    fileUrl: doc.fileUrl,
    docType: doc.docType,
    language: doc.language,
  };
}

type ProductWithRelations = Awaited<ReturnType<typeof findPublishedProducts>>[number];

function findPublishedProducts(where?: Parameters<typeof db.query.products.findMany>[0]) {
  return db.query.products.findMany({
    ...where,
    with: {
      brand: true,
      category: true,
      images: { orderBy: (images, { asc }) => [asc(images.sortOrder)] },
      costInputs: true,
    },
  });
}

async function getActivePricingSettings(): Promise<PricingSettings | null> {
  const row = await db.query.pricingSettings.findFirst({
    where: eq(schema.pricingSettings.isActive, true),
  });
  if (!row) return null;
  return {
    eurToSekRate: Number(row.eurToSekRate),
    freightMarkupMultiplier: Number(row.freightMarkupMultiplier),
    resellerMarkupMultiplier: Number(row.resellerMarkupMultiplier),
  };
}

function computeGrossPrice(
  costInputs: (typeof schema.productCostInputs.$inferSelect)[],
  settings: PricingSettings | null,
): { amount: number; hasVariants: boolean } | null {
  // Guessed cost bases (isUncertain) are withheld from public display until
  // confirmed — they still show correctly in /admin/priser.
  const confirmed = costInputs.filter((input) => !input.isUncertain);
  if (!settings || confirmed.length === 0) return null;
  const prices = confirmed.map(
    (input) =>
      computePricing(
        {
          gmsCreditPriceEur: Number(input.gmsCreditPriceEur),
          freightPriceEur: Number(input.freightPriceEur),
          targetCostRatio: Number(input.targetCostRatio),
        },
        settings,
      ).grossPrice,
  );
  return { amount: Math.min(...prices), hasVariants: prices.length > 1 };
}

function toSummary(
  product: ProductWithRelations,
  settings: PricingSettings | null,
): ProductSummary {
  const primaryImage = product.images[0] ? toImage(product.images[0]) : null;
  const grossPrice = computeGrossPrice(product.costInputs, settings);
  return {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    stockStatus: product.stockStatus,
    priceExVat: product.priceExVat,
    computedGrossPriceSek: grossPrice?.amount ?? null,
    hasMultiplePriceVariants: grossPrice?.hasVariants ?? false,
    currency: product.currency,
    isFeatured: product.isFeatured,
    isPublished: product.isPublished,
    category: toCategoryRef(product.category),
    brand: toBrandRef(product.brand),
    primaryImage,
  };
}

export async function getCategories(): Promise<Category[]> {
  const rows = await db.query.categories.findMany({ orderBy: asc(schema.categories.sortOrder) });
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
  }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const row = await db.query.categories.findFirst({ where: eq(schema.categories.slug, slug) });
  if (!row) return undefined;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
  };
}

export async function getFeaturedProducts(): Promise<ProductSummary[]> {
  const [rows, settings] = await Promise.all([
    findPublishedProducts({
      where: and(eq(schema.products.isPublished, true), eq(schema.products.isFeatured, true)),
      orderBy: asc(schema.products.sortOrder),
    }),
    getActivePricingSettings(),
  ]);
  return rows.map((row) => toSummary(row, settings));
}

export async function getProductsByCategorySlug(categorySlug: string): Promise<ProductSummary[]> {
  const category = await db.query.categories.findFirst({
    where: eq(schema.categories.slug, categorySlug),
  });
  if (!category) return [];

  const [rows, settings] = await Promise.all([
    findPublishedProducts({
      where: and(
        eq(schema.products.isPublished, true),
        eq(schema.products.categoryId, category.id),
      ),
      orderBy: asc(schema.products.sortOrder),
    }),
    getActivePricingSettings(),
  ]);
  return rows.map((row) => toSummary(row, settings));
}

export async function getProductBySlugs(
  categorySlug: string,
  productSlug: string,
): Promise<ProductDetail | undefined> {
  const category = await db.query.categories.findFirst({
    where: eq(schema.categories.slug, categorySlug),
  });
  if (!category) return undefined;

  const [product, settings] = await Promise.all([
    db.query.products.findFirst({
      where: and(
        eq(schema.products.isPublished, true),
        eq(schema.products.categoryId, category.id),
        eq(schema.products.slug, productSlug),
      ),
      with: {
        brand: true,
        category: true,
        images: { orderBy: (images, { asc }) => [asc(images.sortOrder)] },
        specs: { orderBy: (specs, { asc }) => [asc(specs.sortOrder)] },
        capacity: { orderBy: (capacity, { asc }) => [asc(capacity.sortOrder)] },
        accessories: { orderBy: (accessories, { asc }) => [asc(accessories.sortOrder)] },
        documents: { orderBy: (documents, { asc }) => [asc(documents.sortOrder)] },
        costInputs: true,
      },
    }),
    getActivePricingSettings(),
  ]);
  if (!product) return undefined;

  const images = product.images.map(toImage);

  return {
    ...toSummary(product, settings),
    description: product.description,
    powerWatts: product.powerWatts,
    voltage: product.voltage,
    driveType: product.driveType,
    weightKg: product.weightKg,
    dimensionsLengthMm: product.dimensionsLengthMm,
    dimensionsWidthMm: product.dimensionsWidthMm,
    dimensionsHeightMm: product.dimensionsHeightMm,
    images,
    specs: product.specs.map(toSpec),
    capacity: product.capacity.map(toCapacity),
    accessories: product.accessories.map(toAccessory),
    documents: product.documents.map(toDocument),
  };
}

export async function getAllProductSlugsWithCategory(): Promise<
  { categorySlug: string; productSlug: string }[]
> {
  const rows = await db.query.products.findMany({
    where: eq(schema.products.isPublished, true),
    with: { category: true },
  });
  return rows.map((row) => ({ categorySlug: row.category.slug, productSlug: row.slug }));
}

export async function getBrands(): Promise<Brand[]> {
  const rows = await db.query.brands.findMany();
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    logoUrl: row.logoUrl,
  }));
}

export async function getDocumentsGroupedByBrand(): Promise<
  { brand: Brand; documents: DocumentItem[] }[]
> {
  const [brandRows, generalDocs, productDocs] = await Promise.all([
    getBrands(),
    db.query.documents.findMany({
      where: isNull(schema.documents.productId),
      orderBy: asc(schema.documents.sortOrder),
    }),
    db.query.documents.findMany({
      where: isNull(schema.documents.brandId),
      orderBy: asc(schema.documents.sortOrder),
      with: { product: { columns: { brandId: true } } },
    }),
  ]);

  return brandRows.map((brand) => {
    const brandGeneralDocs = generalDocs.filter((doc) => doc.brandId === brand.id);
    const brandProductDocs = productDocs.filter((doc) => doc.product?.brandId === brand.id);
    return {
      brand,
      documents: [...brandGeneralDocs, ...brandProductDocs].map(toDocument),
    };
  });
}
