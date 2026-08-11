import { and, asc, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
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
    },
  });
}

function toSummary(product: ProductWithRelations): ProductSummary {
  const primaryImage = product.images[0] ? toImage(product.images[0]) : null;
  return {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    stockStatus: product.stockStatus,
    priceExVat: product.priceExVat,
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
  const rows = await findPublishedProducts({
    where: and(eq(schema.products.isPublished, true), eq(schema.products.isFeatured, true)),
    orderBy: asc(schema.products.sortOrder),
  });
  return rows.map(toSummary);
}

export async function getProductsByCategorySlug(categorySlug: string): Promise<ProductSummary[]> {
  const category = await db.query.categories.findFirst({
    where: eq(schema.categories.slug, categorySlug),
  });
  if (!category) return [];

  const rows = await findPublishedProducts({
    where: and(eq(schema.products.isPublished, true), eq(schema.products.categoryId, category.id)),
    orderBy: asc(schema.products.sortOrder),
  });
  return rows.map(toSummary);
}

export async function getProductBySlugs(
  categorySlug: string,
  productSlug: string,
): Promise<ProductDetail | undefined> {
  const category = await db.query.categories.findFirst({
    where: eq(schema.categories.slug, categorySlug),
  });
  if (!category) return undefined;

  const product = await db.query.products.findFirst({
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
    },
  });
  if (!product) return undefined;

  const images = product.images.map(toImage);

  return {
    ...toSummary(product),
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
