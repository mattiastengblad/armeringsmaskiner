import { brandDocuments, brands, categories, products } from '@/lib/mock/catalog';
import type { Brand, Category, DocumentItem, ProductDetail, ProductSummary } from '@/lib/types';

// Backed by in-memory mock data for now. Swap the bodies below for Drizzle
// queries once the Supabase project is live — callers (pages) don't change.

function toSummary(product: ProductDetail): ProductSummary {
  const {
    id,
    sku,
    slug,
    name,
    shortDescription,
    stockStatus,
    priceExVat,
    currency,
    isFeatured,
    isPublished,
    category,
    brand,
    primaryImage,
  } = product;
  return {
    id,
    sku,
    slug,
    name,
    shortDescription,
    stockStatus,
    priceExVat,
    currency,
    isFeatured,
    isPublished,
    category,
    brand,
    primaryImage,
  };
}

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return categories.find((c) => c.slug === slug);
}

export async function getFeaturedProducts(): Promise<ProductSummary[]> {
  return products.filter((p) => p.isPublished && p.isFeatured).map(toSummary);
}

export async function getProductsByCategorySlug(categorySlug: string): Promise<ProductSummary[]> {
  return products.filter((p) => p.isPublished && p.category.slug === categorySlug).map(toSummary);
}

export async function getProductBySlugs(
  categorySlug: string,
  productSlug: string,
): Promise<ProductDetail | undefined> {
  return products.find(
    (p) => p.isPublished && p.category.slug === categorySlug && p.slug === productSlug,
  );
}

export async function getAllProductSlugsWithCategory(): Promise<
  { categorySlug: string; productSlug: string }[]
> {
  return products
    .filter((p) => p.isPublished)
    .map((p) => ({ categorySlug: p.category.slug, productSlug: p.slug }));
}

export async function getBrands(): Promise<Brand[]> {
  return brands;
}

export async function getDocumentsGroupedByBrand(): Promise<
  { brand: Brand; documents: DocumentItem[] }[]
> {
  return brands.map((brand) => {
    const productDocs = products
      .filter((p) => p.brand.slug === brand.slug)
      .flatMap((p) => p.documents);
    const generalDocs = brandDocuments.filter((doc) => doc.id.startsWith(`doc-${brand.slug}-`));
    return { brand, documents: [...generalDocs, ...productDocs] };
  });
}
